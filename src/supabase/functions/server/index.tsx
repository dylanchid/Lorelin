import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";
const app = new Hono();

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const isServiceRoleMode = !SUPABASE_ANON_KEY;
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY,
);

// If SUPABASE_ANON_KEY isn't configured, we fall back to service-role.
// In that case, we MUST gate access behind an internal token to avoid exposing
// service-role privileges to the public internet.
if (isServiceRoleMode) {
  const EDGE_INTERNAL_TOKEN = Deno.env.get('EDGE_INTERNAL_TOKEN') ?? '';

  app.use('/make-server-e8ce19db/*', async (c, next) => {
    const pathname = new URL(c.req.url).pathname;

    // Always allow health checks.
    if (pathname.endsWith('/health')) {
      return next();
    }

    if (!EDGE_INTERNAL_TOKEN) {
      return c.json(
        { error: 'EDGE_INTERNAL_TOKEN is required when running in service-role mode' },
        500,
      );
    }

    const presentedToken =
      c.req.header('x-edge-internal-token') ??
      c.req
        .header('authorization')
        ?.replace(/^Bearer\s+/i, '')
        .trim();

    if (!presentedToken || presentedToken !== EDGE_INTERNAL_TOKEN) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return next();
  });
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e8ce19db/health", (c) => {
  return c.json({ status: "ok" });
});

// Raw SQL endpoint to bypass PostgREST cache issues
app.get("/make-server-e8ce19db/visits/raw", async (c) => {
  try {
    // Use raw SQL query to bypass PostgREST schema cache
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT * FROM visits 
        ORDER BY visit_date ASC, visit_time ASC;
      `
    });

    if (error) {
      console.error('Error in raw SQL query:', error);
      
      // If the function doesn't exist, create it and try again
      if (error.message.includes('exec_sql') || error.message.includes('does not exist')) {
        return c.json({ 
          error: 'SQL function not available. Using direct query instead.',
          needsSetup: true 
        }, 500);
      }
      
      return c.json({ error: error.message }, 500);
    }

    return c.json({ visits: data || [] });
  } catch (error) {
    console.error('Error in raw visits endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Raw SQL endpoint for pre-visit items
app.get("/make-server-e8ce19db/visits/pre-visit/raw", async (c) => {
  try {
    const daysAhead = c.req.query('days') || '7';
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(daysAhead));
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT * FROM visits 
        WHERE visit_date >= '${today}' AND visit_date <= '${futureDateStr}'
        ORDER BY visit_date ASC, visit_time ASC;
      `
    });

    if (error) {
      console.error('Error in raw pre-visit query:', error);
      return c.json({ error: error.message, needsSetup: true }, 500);
    }

    return c.json({ visits: data || [] });
  } catch (error) {
    console.error('Error in raw pre-visit endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Setup endpoint to create the exec_sql function and table
app.post("/make-server-e8ce19db/setup", async (c) => {
  try {
    const setupResults: any = {
      steps: [],
      success: false,
    };

    // Step 1: Create exec_sql function for raw queries
    try {
      await supabase.rpc('exec_sql', { query: 'SELECT 1' });
      setupResults.steps.push({ step: 'exec_sql_function', status: 'already_exists' });
    } catch (error: any) {
      if (error.message.includes('does not exist')) {
        setupResults.steps.push({ 
          step: 'exec_sql_function', 
          status: 'needs_manual_creation',
          instructions: 'Run the SQL from SUPABASE_SETUP.md to create the exec_sql function'
        });
      }
    }

    // Step 2: Try to query the visits table directly
    const { data: tableCheck, error: tableError } = await supabase
      .from('visits')
      .select('id')
      .limit(1);

    if (tableError) {
      setupResults.steps.push({ 
        step: 'visits_table', 
        status: 'error',
        error: tableError.message,
        code: tableError.code
      });
      
      if (tableError.code === 'PGRST205') {
        setupResults.steps.push({
          step: 'schema_cache',
          status: 'needs_reload',
          instructions: [
            'Go to Supabase Dashboard',
            'Navigate to Settings → API',
            'Click "Reload schema cache"',
            'Wait 15 seconds',
            'Retry'
          ]
        });
      }
    } else {
      setupResults.steps.push({ step: 'visits_table', status: 'accessible' });
      setupResults.success = true;
    }

    return c.json(setupResults);
  } catch (error) {
    console.error('Error in setup endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Diagnostic endpoint to check table structure
app.get("/make-server-e8ce19db/diagnose", async (c) => {
  try {
    const diagnostics: any = {
      tableExists: false,
      canQuery: false,
      rowCount: 0,
      sampleRow: null,
      error: null,
      schemaInfo: null,
      rlsEnabled: null,
      policies: null,
    };

    // Try to query the table
    const { data, error, count } = await supabase
      .from('visits')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      diagnostics.error = error.message;
      diagnostics.errorDetails = error;
      diagnostics.errorCode = error.code;
      
      // Check if it's a schema cache issue (PGRST205)
      if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
        diagnostics.suggestedFix = 'SCHEMA_CACHE_RELOAD';
        diagnostics.instructions = [
          'Go to Supabase Dashboard → Settings → API',
          'Click "Reload schema cache" button',
          'Wait 5-10 seconds and retry',
        ];
      }
    } else {
      diagnostics.tableExists = true;
      diagnostics.canQuery = true;
      diagnostics.rowCount = count || 0;
      diagnostics.sampleRow = data && data.length > 0 ? data[0] : null;
    }

    // Try to get additional schema information using raw SQL
    try {
      const { data: schemaData } = await supabase.rpc('exec_sql', {
        query: `
          SELECT 
            schemaname, 
            tablename, 
            tableowner,
            rowsecurity
          FROM pg_tables 
          WHERE tablename = 'visits';
        `
      }).single();
      diagnostics.schemaInfo = schemaData;
    } catch (schemaError) {
      diagnostics.schemaQueryError = 'Could not query pg_tables (this is optional)';
    }

    return c.json(diagnostics);
  } catch (error) {
    console.error('Diagnostic error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Initialize visits table with sample data if it doesn't exist
app.post("/make-server-e8ce19db/init-visits", async (c) => {
  try {
    // Check if table has data
    const { data: existingVisits, error: checkError } = await supabase
      .from('visits')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking visits table:', checkError);
      return c.json({ error: checkError.message }, 500);
    }

    if (existingVisits && existingVisits.length > 0) {
      return c.json({ message: 'Visits table already has data' });
    }
    
    // Generate dates dynamically based on today
    let today, todayStr, tomorrow, tomorrowStr, in2Days, in2DaysStr, in3Days, in3DaysStr;
    
    try {
      today = new Date();
      todayStr = today.toISOString().split('T')[0];
      
      tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      in2Days = new Date(today);
      in2Days.setDate(in2Days.getDate() + 2);
      in2DaysStr = in2Days.toISOString().split('T')[0];
      
      in3Days = new Date(today);
      in3Days.setDate(in3Days.getDate() + 3);
      in3DaysStr = in3Days.toISOString().split('T')[0];
      
      console.log('Generated dates:', { todayStr, tomorrowStr, in2DaysStr, in3DaysStr });
    } catch (dateError) {
      console.error('Error generating dates:', dateError);
      return c.json({ error: `Date generation failed: ${String(dateError)}` }, 500);
    }

    // Sample visits data
    const sampleVisits = [
      {
        patient_name: 'Jane Doe',
        patient_age: 68,
        visit_date: todayStr,
        visit_time: '10:00 AM',
        provider: 'Dr. Lee',
        payer: 'Medicare',
        visit_reason: 'Annual exam',
        status: 'to-record',
        charge_estimate: 285,
        member_id: 'MED123456',
        group_number: 'GRP001',
        pre_visit_step: 'ready',
        pre_visit_risk: 'ready',
      },
      {
        patient_name: 'Robert Chen',
        patient_age: 54,
        visit_date: todayStr,
        visit_time: '10:30 AM',
        provider: 'Dr. Lee',
        payer: 'Aetna',
        visit_reason: 'Glaucoma follow-up',
        status: 'to-record',
        charge_estimate: 320,
        member_id: 'AET789456',
        group_number: 'GRP002',
        pre_visit_step: 'ready',
        pre_visit_risk: 'ready',
      },
      {
        patient_name: 'Maria Garcia',
        patient_age: 45,
        visit_date: todayStr,
        visit_time: '11:00 AM',
        provider: 'Dr. Lee',
        payer: 'UHC',
        visit_reason: 'Retina follow-up',
        status: 'to-review',
        charge_estimate: 450,
        member_id: 'UHC456789',
        group_number: 'GRP003',
        pre_visit_step: 'eligibility-pending',
        pre_visit_risk: 'at-risk',
      },
      {
        patient_name: 'John Smith',
        patient_age: 72,
        visit_date: todayStr,
        visit_time: '11:30 AM',
        provider: 'Dr. Patel',
        payer: 'BCBS',
        visit_reason: 'Post-op check',
        status: 'to-review',
        charge_estimate: 380,
        member_id: 'BCBS123789',
        group_number: 'GRP004',
        pre_visit_step: 'auth-needed',
        pre_visit_risk: 'blocked',
      },
      {
        patient_name: 'Linda Brown',
        patient_age: 72,
        visit_date: todayStr,
        visit_time: '1:00 PM',
        provider: 'Dr. Lee',
        payer: 'Medicare',
        visit_reason: 'AMD injection',
        status: 'approved',
        charge_estimate: 295,
        member_id: 'MED987654',
        group_number: 'GRP001',
        pre_visit_step: 'auth-submitted',
        pre_visit_risk: 'at-risk',
      },
      {
        patient_name: 'David Wilson',
        patient_age: 61,
        visit_date: todayStr,
        visit_time: '1:30 PM',
        provider: 'Dr. Patel',
        payer: 'Cigna',
        visit_reason: 'Cataract evaluation',
        status: 'approved',
        charge_estimate: 340,
        member_id: 'CIG654321',
        group_number: 'GRP005',
        pre_visit_step: 'auth-approved',
        pre_visit_risk: 'ready',
      },
      {
        patient_name: 'Sarah Johnson',
        patient_age: 58,
        visit_date: todayStr,
        visit_time: '2:00 PM',
        provider: 'Dr. Lee',
        payer: 'Medicare',
        visit_reason: 'Diabetic retinopathy',
        status: 'sent',
        charge_estimate: 310,
        member_id: 'MED321654',
        group_number: 'GRP001',
        pre_visit_step: 'ready',
        pre_visit_risk: 'ready',
      },
      {
        patient_name: 'Michael Davis',
        patient_age: 49,
        visit_date: todayStr,
        visit_time: '2:30 PM',
        provider: 'Dr. Patel',
        payer: 'Aetna',
        visit_reason: 'Vision screening',
        status: 'transcribing',
        charge_estimate: 275,
        member_id: 'AET987123',
        group_number: 'GRP002',
        pre_visit_step: 'ready',
        pre_visit_risk: 'ready',
      },
      {
        patient_name: 'K. Williams',
        patient_age: 65,
        visit_date: todayStr,
        visit_time: '3:00 PM',
        provider: 'Dr. Kim',
        payer: 'BCBS',
        visit_reason: 'Cataract surgery',
        status: 'to-record',
        charge_estimate: 520,
        member_id: 'BCBS456123',
        group_number: 'GRP004',
        pre_visit_step: 'auth-needed',
        pre_visit_risk: 'blocked',
      },
      {
        patient_name: 'J. Martinez',
        patient_age: 52,
        visit_date: todayStr,
        visit_time: '3:30 PM',
        provider: 'Dr. Lee',
        payer: 'Aetna PPO',
        visit_reason: 'Annual exam',
        status: 'to-review',
        charge_estimate: 540,
        member_id: 'AET741852',
        group_number: 'GRP002',
        pre_visit_step: 'eligibility-failed',
        pre_visit_risk: 'at-risk',
      },
      // Tomorrow's visits (for pre-visit screen)
      {
        patient_name: 'Emily Thompson',
        patient_age: 63,
        visit_date: tomorrowStr,
        visit_time: '9:00 AM',
        provider: 'Dr. Lee',
        payer: 'UHC',
        visit_reason: 'Cataract follow-up',
        status: 'to-record',
        charge_estimate: 380,
        member_id: 'UHC789123',
        group_number: 'GRP003',
        pre_visit_step: 'eligibility-pending',
        pre_visit_risk: 'at-risk',
      },
      {
        patient_name: 'Robert Anderson',
        patient_age: 71,
        visit_date: tomorrowStr,
        visit_time: '10:30 AM',
        provider: 'Dr. Patel',
        payer: 'Medicare',
        visit_reason: 'Glaucoma check',
        status: 'to-record',
        charge_estimate: 295,
        member_id: 'MED654987',
        group_number: 'GRP001',
        pre_visit_step: 'auth-needed',
        pre_visit_risk: 'blocked',
      },
      {
        patient_name: 'S. Chen',
        patient_age: 59,
        visit_date: in2DaysStr,
        visit_time: '11:00 AM',
        provider: 'Dr. Kim',
        payer: 'Humana PPO',
        visit_reason: 'Retina consultation',
        status: 'to-record',
        charge_estimate: 420,
        member_id: 'HUM963852',
        group_number: 'GRP006',
        pre_visit_step: 'auth-draft-ready',
        pre_visit_risk: 'at-risk',
      },
      {
        patient_name: 'David Park',
        patient_age: 47,
        visit_date: in3DaysStr,
        visit_time: '1:30 PM',
        provider: 'Dr. Patel',
        payer: 'Cigna PPO',
        visit_reason: 'Vision screening',
        status: 'to-record',
        charge_estimate: 260,
        member_id: 'CIG159753',
        group_number: 'GRP005',
        pre_visit_step: 'auth-approved',
        pre_visit_risk: 'ready',
      },
    ];

    const { data, error } = await supabase
      .from('visits')
      .insert(sampleVisits)
      .select();

    if (error) {
      console.error('Error inserting visits:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: 'Visits initialized successfully', count: data?.length });
  } catch (error) {
    console.error('Error in init-visits:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all visits
app.get("/make-server-e8ce19db/visits", async (c) => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('visit_date', { ascending: true })
      .order('visit_time', { ascending: true });

    if (error) {
      console.error('Error fetching visits:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ visits: data });
  } catch (error) {
    console.error('Error in visits endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get visits for today's work (home screen)
app.get("/make-server-e8ce19db/visits/today", async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('visit_date', today)
      .order('visit_time', { ascending: true });

    if (error) {
      console.error('Error fetching today visits:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ visits: data });
  } catch (error) {
    console.error('Error in today visits endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get pre-visit items
app.get("/make-server-e8ce19db/visits/pre-visit", async (c) => {
  try {
    const daysAhead = c.req.query('days') || '7';
    
    // Handle "all" case - don't filter by date
    if (daysAhead === 'all') {
      console.log('Fetching all pre-visit items (no date filter)');
      
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('visit_date', { ascending: true })
        .order('visit_time', { ascending: true });

      if (error) {
        console.error('Error fetching all pre-visit items:', error);
        return c.json({ error: error.message }, 500);
      }
      
      console.log(`Returning ${data?.length || 0} pre-visit items (all)`);
      return c.json({ visits: data || [] });
    }
    
    // Handle "today" case - only today's visits
    if (daysAhead === 'today') {
      console.log('Fetching today\'s pre-visit items');
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('visit_date', todayStr)
        .order('visit_time', { ascending: true });

      if (error) {
        console.error('Error fetching today\'s pre-visit items:', error);
        return c.json({ error: error.message }, 500);
      }
      
      console.log(`Returning ${data?.length || 0} pre-visit items (today)`);
      return c.json({ visits: data || [] });
    }
    
    // Generate dates with error handling for numeric days
    let todayStr, futureDateStr;
    try {
      const daysNum = parseInt(daysAhead);
      if (isNaN(daysNum)) {
        throw new Error(`Invalid days parameter: ${daysAhead}`);
      }
      
      const today = new Date();
      if (isNaN(today.getTime())) {
        throw new Error('Failed to create today Date object');
      }
      todayStr = today.toISOString().split('T')[0];
      
      const futureDate = new Date();
      if (isNaN(futureDate.getTime())) {
        throw new Error('Failed to create futureDate Date object');
      }
      futureDate.setDate(futureDate.getDate() + daysNum);
      futureDateStr = futureDate.toISOString().split('T')[0];
      
      console.log('Pre-visit date range:', { todayStr, futureDateStr, daysAhead: daysNum });
    } catch (dateError) {
      console.error('Error generating date range:', dateError);
      return c.json({ error: `Date generation failed: ${String(dateError)}` }, 500);
    }

    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .gte('visit_date', todayStr)
      .lte('visit_date', futureDateStr)
      .order('visit_date', { ascending: true })
      .order('visit_time', { ascending: true });

    if (error) {
      console.error('Error fetching pre-visit items:', error);
      return c.json({ error: error.message }, 500);
    }
    
    // Validate the data before returning
    if (data && data.length > 0) {
      console.log(`Returning ${data.length} pre-visit items`);
      // Log first item to check data quality
      console.log('Sample visit data:', {
        visit_date: data[0].visit_date,
        visit_time: data[0].visit_time,
        patient_name: data[0].patient_name
      });
    } else {
      console.log('No pre-visit items found in date range');
    }

    return c.json({ visits: data || [] });
  } catch (error) {
    console.error('Error in pre-visit endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update visit status
app.put("/make-server-e8ce19db/visits/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const { data, error } = await supabase
      .from('visits')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating visit:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ visit: data });
  } catch (error) {
    console.error('Error in update visit endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// DISPUTES ENDPOINTS
// ============================================================================

// Get all disputes
app.get("/make-server-e8ce19db/disputes", async (c) => {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .order('deadline_date', { ascending: true });

    if (error) {
      console.error('Error fetching disputes:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ disputes: data || [] });
  } catch (error) {
    console.error('Error in disputes endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single dispute
app.get("/make-server-e8ce19db/disputes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dispute:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ dispute: data });
  } catch (error) {
    console.error('Error in dispute detail endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update dispute
app.put("/make-server-e8ce19db/disputes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const { data, error } = await supabase
      .from('disputes')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dispute:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ dispute: data });
  } catch (error) {
    console.error('Error in update dispute endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Initialize disputes with sample data
app.post("/make-server-e8ce19db/init-disputes", async (c) => {
  try {
    // Check if table has data
    const { data: existingDisputes, error: checkError } = await supabase
      .from('disputes')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking disputes table:', checkError);
      return c.json({ error: checkError.message }, 500);
    }

    if (existingDisputes && existingDisputes.length > 0) {
      return c.json({ message: 'Disputes table already has data' });
    }

    // Generate dynamic dates
    const today = new Date();
    const addDays = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };

    // Sample disputes data
    const sampleDisputes = [
      {
        patient_name: 'J. Martinez',
        claim_id: 'Claim #18294',
        procedure_name: 'Breast reconstruction',
        procedure_code: 'CPT 19357',
        payer_name: 'Aetna PPO',
        plan_type: 'Self-funded',
        billed: 8200,
        paid: 1050,
        potential: 200,
        contract_expected: 1250,
        contract_gap: 200,
        type: 'OON - IDR',
        path: 'Federal IDR',
        issue: null,
        status: 'Ready for IDR',
        next_action: 'Generate IDR packet',
        deadline_date: addDays(12),
        deadline_label: 'IDR filing',
        path_tooltip: 'OON ER service; NSA applies; plan appears self-funded → federal IDR candidate',
        is_urgent: true,
      },
      {
        patient_name: 'S. Chen',
        claim_id: 'Claim #18291',
        procedure_name: 'Rhinoplasty',
        procedure_code: 'CPT 30400',
        payer_name: 'UnitedHealthcare',
        plan_type: 'PPO',
        billed: 12500,
        paid: 4200,
        potential: 5800,
        type: 'OON - Negotiation',
        path: 'State IDR',
        issue: null,
        status: 'In negotiation',
        next_action: 'Generate negotiation letter',
        deadline_date: addDays(20),
        deadline_label: 'Response due',
        path_tooltip: 'State-regulated plan; state IDR process applies',
        is_urgent: false,
      },
      {
        patient_name: 'M. Patel',
        claim_id: 'Claim #18287',
        procedure_name: 'Abdominoplasty',
        procedure_code: 'CPT 15830',
        payer_name: 'Cigna HMO',
        plan_type: null,
        billed: 9800,
        paid: 3500,
        potential: 4200,
        type: 'INN - Denial appeal',
        path: 'Appeal only',
        issue: 'Med necessity denial',
        status: 'New',
        next_action: 'Draft appeal',
        deadline_date: addDays(33),
        deadline_label: 'Appeal deadline',
        path_tooltip: 'HMO plan; standard appeal process only',
        is_urgent: false,
      },
      {
        patient_name: 'K. Williams',
        claim_id: 'Claim #18283',
        procedure_name: 'Facelift',
        procedure_code: 'CPT 30400',
        payer_name: 'Blue Cross Blue Shield',
        plan_type: 'Self-funded',
        billed: 15200,
        paid: 1650,
        potential: 300,
        contract_expected: 1950,
        contract_gap: 300,
        type: 'INN - Underpayment',
        path: 'Appeal only',
        issue: 'Underpayment',
        status: 'New',
        next_action: 'Draft appeal',
        deadline_date: addDays(28),
        deadline_label: 'Appeal deadline',
        path_tooltip: 'Paid below contract rate',
        is_urgent: true,
      },
    ];

    const { data, error } = await supabase
      .from('disputes')
      .insert(sampleDisputes)
      .select();

    if (error) {
      console.error('Error inserting disputes:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: 'Disputes initialized successfully', count: data?.length });
  } catch (error) {
    console.error('Error in init-disputes:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// WORK ITEMS ENDPOINTS
// ============================================================================

// Get all work items
app.get("/make-server-e8ce19db/work-items", async (c) => {
  try {
    const typeFilter = c.req.query('type');
    const stepFilter = c.req.query('step');

    let query = supabase
      .from('work_items')
      .select('*')
      .eq('completed', false);

    if (typeFilter && typeFilter !== 'all') {
      if (typeFilter === 'visits') {
        query = query.eq('type', 'visit');
      } else if (typeFilter === 'claims') {
        query = query.eq('type', 'claim');
      }
    }

    if (stepFilter && stepFilter !== 'all') {
      query = query.eq('step', stepFilter);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await supabase
      .from('work_items')
      .select('*')
      .eq('completed', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work items:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ workItems: data || [] });
  } catch (error) {
    console.error('Error in work items endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update work item
app.put("/make-server-e8ce19db/work-items/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const { data, error } = await supabase
      .from('work_items')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating work item:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ workItem: data });
  } catch (error) {
    console.error('Error in update work item endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Initialize work items with sample data
app.post("/make-server-e8ce19db/init-work-items", async (c) => {
  try {
    // Check if table has data
    const { data: existingItems, error: checkError } = await supabase
      .from('work_items')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking work_items table:', checkError);
      return c.json({ error: checkError.message }, 500);
    }

    if (existingItems && existingItems.length > 0) {
      return c.json({ message: 'Work items table already has data' });
    }

    const today = new Date();
    const addDays = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };

    // Sample work items
    const sampleWorkItems = [
      {
        type: 'visit',
        step: 'to-record',
        patient_name: 'Jane Doe',
        description: 'Annual exam',
        provider: 'Dr. Lee',
        payer: 'Medicare',
        value: 285,
        value_label: '$285',
        deadline: null,
        deadline_label: null,
        urgency: 'medium',
        visit_id: null,
        dispute_id: null,
        completed: false,
      },
      {
        type: 'visit',
        step: 'to-review',
        patient_name: 'John Smith',
        description: 'Post-op check',
        provider: 'Dr. Patel',
        payer: 'BCBS',
        value: 380,
        value_label: '$380',
        deadline: addDays(2),
        deadline_label: 'Due in 2 days',
        urgency: 'high',
        visit_id: null,
        dispute_id: null,
        completed: false,
      },
      {
        type: 'claim',
        step: 'flagged',
        patient_name: 'K. Williams',
        description: 'Facelift – Underpayment',
        provider: 'Dr. Kim',
        payer: 'BCBS',
        value: 300,
        value_label: '$300',
        deadline: addDays(28),
        deadline_label: 'Appeal deadline',
        urgency: 'high',
        visit_id: null,
        dispute_id: null,
        completed: false,
      },
    ];

    const { data, error } = await supabase
      .from('work_items')
      .insert(sampleWorkItems)
      .select();

    if (error) {
      console.error('Error inserting work items:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: 'Work items initialized successfully', count: data?.length });
  } catch (error) {
    console.error('Error in init-work-items:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// AUTHORIZATIONS ENDPOINTS
// ============================================================================

// Get all authorizations
app.get("/make-server-e8ce19db/authorizations", async (c) => {
  try {
    const { data, error } = await supabase
      .from('authorizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching authorizations:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ authorizations: data || [] });
  } catch (error) {
    console.error('Error in authorizations endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single authorization by ID
app.get("/make-server-e8ce19db/authorizations/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { data, error } = await supabase
      .from('authorizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching authorization:', error);
      return c.json({ error: error.message }, 404);
    }

    return c.json({ authorization: data });
  } catch (error) {
    console.error('Error in authorization detail endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get authorizations by visit ID
app.get("/make-server-e8ce19db/authorizations/by-visit/:visitId", async (c) => {
  try {
    const visitId = c.req.param('visitId');
    
    const { data, error } = await supabase
      .from('authorizations')
      .select('*')
      .eq('visit_id', visitId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching authorizations by visit:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ authorizations: data || [] });
  } catch (error) {
    console.error('Error in authorizations by visit endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Create new authorization
app.post("/make-server-e8ce19db/authorizations", async (c) => {
  try {
    const body = await c.req.json();
    
    const authRequest = {
      id: body.id || `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      visit_id: body.visitId || body.visit_id,
      patient_name: body.patientName || body.patient_name,
      patient_id: body.patientId || body.patient_id,
      patient_dob: body.patientDob || body.patient_dob,
      provider: body.provider,
      payer: body.payer,
      plan_id: body.planId || body.plan_id,
      visit_date: body.visitDate || body.visit_date,
      visit_time: body.visitTime || body.visit_time,
      visit_reason: body.visitReason || body.visit_reason,
      procedure_type: body.procedureType || body.procedure_type,
      location: body.location,
      status: body.status || 'needed',
      clinical_justification: body.clinicalJustification || body.clinical_justification || '',
      cpt_codes: body.cptCodes || body.cpt_codes || [],
      icd10_codes: body.icd10Codes || body.icd10_codes || [],
      notes: body.notes || '',
      submitted_date: body.submittedDate || body.submitted_date || null,
      submitted_by: body.submittedBy || body.submitted_by || null,
      submission_method: body.submissionMethod || body.submission_method || null,
      pa_id: body.paId || body.pa_id || null,
      valid_from: body.validFrom || body.valid_from || null,
      valid_to: body.validTo || body.valid_to || null,
      approved_date: body.approvedDate || body.approved_date || null,
      approved_by: body.approvedBy || body.approved_by || null,
      denied_date: body.deniedDate || body.denied_date || null,
      denied_reason: body.deniedReason || body.denied_reason || null,
    };
    
    const { data, error } = await supabase
      .from('authorizations')
      .insert(authRequest)
      .select()
      .single();

    if (error) {
      console.error('Error creating authorization:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ authorization: data }, 201);
  } catch (error) {
    console.error('Error in create authorization endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update authorization
app.put("/make-server-e8ce19db/authorizations/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Convert camelCase to snake_case for database
    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    
    // Map all possible fields
    if (body.status !== undefined) updates.status = body.status;
    if (body.clinicalJustification !== undefined) updates.clinical_justification = body.clinicalJustification;
    if (body.clinical_justification !== undefined) updates.clinical_justification = body.clinical_justification;
    if (body.cptCodes !== undefined) updates.cpt_codes = body.cptCodes;
    if (body.cpt_codes !== undefined) updates.cpt_codes = body.cpt_codes;
    if (body.icd10Codes !== undefined) updates.icd10_codes = body.icd10Codes;
    if (body.icd10_codes !== undefined) updates.icd10_codes = body.icd10_codes;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.submittedDate !== undefined) updates.submitted_date = body.submittedDate;
    if (body.submitted_date !== undefined) updates.submitted_date = body.submitted_date;
    if (body.submittedBy !== undefined) updates.submitted_by = body.submittedBy;
    if (body.submitted_by !== undefined) updates.submitted_by = body.submitted_by;
    if (body.submissionMethod !== undefined) updates.submission_method = body.submissionMethod;
    if (body.submission_method !== undefined) updates.submission_method = body.submission_method;
    if (body.paId !== undefined) updates.pa_id = body.paId;
    if (body.pa_id !== undefined) updates.pa_id = body.pa_id;
    if (body.validFrom !== undefined) updates.valid_from = body.validFrom;
    if (body.valid_from !== undefined) updates.valid_from = body.valid_from;
    if (body.validTo !== undefined) updates.valid_to = body.validTo;
    if (body.valid_to !== undefined) updates.valid_to = body.valid_to;
    if (body.approvedDate !== undefined) updates.approved_date = body.approvedDate;
    if (body.approved_date !== undefined) updates.approved_date = body.approved_date;
    if (body.approvedBy !== undefined) updates.approved_by = body.approvedBy;
    if (body.approved_by !== undefined) updates.approved_by = body.approved_by;
    if (body.deniedDate !== undefined) updates.denied_date = body.deniedDate;
    if (body.denied_date !== undefined) updates.denied_date = body.denied_date;
    if (body.deniedReason !== undefined) updates.denied_reason = body.deniedReason;
    if (body.denied_reason !== undefined) updates.denied_reason = body.denied_reason;

    const { data, error } = await supabase
      .from('authorizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating authorization:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ authorization: data });
  } catch (error) {
    console.error('Error in update authorization endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete authorization
app.delete("/make-server-e8ce19db/authorizations/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('authorizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting authorization:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: 'Authorization deleted successfully' });
  } catch (error) {
    console.error('Error in delete authorization endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// ELIGIBILITIES ENDPOINTS
// ============================================================================

// Get all eligibilities
app.get("/make-server-e8ce19db/eligibilities", async (c) => {
  try {
    const { data, error } = await supabase
      .from('eligibilities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching eligibilities:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ eligibilities: data || [] });
  } catch (error) {
    console.error('Error in eligibilities endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single eligibility by ID
app.get("/make-server-e8ce19db/eligibilities/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { data, error } = await supabase
      .from('eligibilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching eligibility:', error);
      return c.json({ error: error.message }, 404);
    }

    return c.json({ eligibility: data });
  } catch (error) {
    console.error('Error in eligibility detail endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get eligibilities by visit ID
app.get("/make-server-e8ce19db/eligibilities/by-visit/:visitId", async (c) => {
  try {
    const visitId = c.req.param('visitId');
    
    const { data, error } = await supabase
      .from('eligibilities')
      .select('*')
      .eq('visit_id', visitId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching eligibilities by visit:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ eligibilities: data || [] });
  } catch (error) {
    console.error('Error in eligibilities by visit endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Create new eligibility
app.post("/make-server-e8ce19db/eligibilities", async (c) => {
  try {
    const body = await c.req.json();
    
    const eligibilityCheck = {
      id: body.id || `elig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      visit_id: body.visitId || body.visit_id,
      patient_name: body.patientName || body.patient_name,
      patient_id: body.patientId || body.patient_id,
      patient_dob: body.patientDob || body.patient_dob,
      patient_sex: body.patientSex || body.patient_sex,
      provider: body.provider,
      payer: body.payer,
      plan_id: body.planId || body.plan_id,
      member_id: body.memberId || body.member_id,
      group_number: body.groupNumber || body.group_number,
      visit_date: body.visitDate || body.visit_date,
      visit_time: body.visitTime || body.visit_time,
      visit_reason: body.visitReason || body.visit_reason,
      service_type: body.serviceType || body.service_type,
      location: body.location,
      benefit_type: body.benefitType || body.benefit_type || 'Medical benefits',
      status: body.status || 'pending',
      lorelin_available: body.loreleinAvailable !== false && body.lorelin_available !== false,
      current_result: body.currentResult || body.current_result || null,
      history: body.history || [],
      notes: body.notes || '',
    };
    
    const { data, error } = await supabase
      .from('eligibilities')
      .insert(eligibilityCheck)
      .select()
      .single();

    if (error) {
      console.error('Error creating eligibility:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ eligibility: data }, 201);
  } catch (error) {
    console.error('Error in create eligibility endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update eligibility
app.put("/make-server-e8ce19db/eligibilities/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    
    // Map all possible fields
    if (body.status !== undefined) updates.status = body.status;
    if (body.loreleinAvailable !== undefined) updates.lorelin_available = body.loreleinAvailable;
    if (body.lorelin_available !== undefined) updates.lorelin_available = body.lorelin_available;
    if (body.currentResult !== undefined) updates.current_result = body.currentResult;
    if (body.current_result !== undefined) updates.current_result = body.current_result;
    if (body.history !== undefined) updates.history = body.history;
    if (body.notes !== undefined) updates.notes = body.notes;

    const { data, error } = await supabase
      .from('eligibilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating eligibility:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ eligibility: data });
  } catch (error) {
    console.error('Error in update eligibility endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete eligibility
app.delete("/make-server-e8ce19db/eligibilities/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('eligibilities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting eligibility:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ message: 'Eligibility deleted successfully' });
  } catch (error) {
    console.error('Error in delete eligibility endpoint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Run eligibility check (simulate API call)
app.post("/make-server-e8ce19db/eligibilities/:id/check", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { data: eligibility, error: fetchError } = await supabase
      .from('eligibilities')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !eligibility) {
      console.error('Error fetching eligibility:', fetchError);
      return c.json({ error: 'Eligibility check not found' }, 404);
    }
    
    // Simulate checking with payer - 80% success rate
    const isSuccess = Math.random() > 0.2;
    
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const newHistoryEntry = {
      timestamp,
      status: isSuccess ? 'verified' : 'failed',
      method: 'lorelin',
      note: isSuccess ? 'Real-time check via Lorelin' : 'Member ID not found'
    };
    
    const updatedHistory = [newHistoryEntry, ...(eligibility.history || [])];
    
    const updates: any = {
      status: isSuccess ? 'verified' : 'failed',
      history: updatedHistory,
      updated_at: new Date().toISOString(),
    };
    
    if (isSuccess) {
      updates.current_result = {
        status: 'active',
        planName: `${eligibility.payer} Plan`,
        effectiveDates: '01/01/2025–12/31/2025',
        officeVisitCopay: '$40',
        deductibleRemaining: '$600'
      };
    }
    
    const { data: updated, error: updateError } = await supabase
      .from('eligibilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating eligibility after check:', updateError);
      return c.json({ error: updateError.message }, 500);
    }

    return c.json({ eligibility: updated });
  } catch (error) {
    console.error('Error running eligibility check:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Record manual verification
app.post("/make-server-e8ce19db/eligibilities/:id/manual", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const { data: eligibility, error: fetchError } = await supabase
      .from('eligibilities')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !eligibility) {
      console.error('Error fetching eligibility:', fetchError);
      return c.json({ error: 'Eligibility check not found' }, 404);
    }
    
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const newHistoryEntry = {
      timestamp,
      status: body.result,
      method: 'manual',
      note: body.notes || 'Manual verification'
    };
    
    const updatedHistory = [newHistoryEntry, ...(eligibility.history || [])];
    
    const updates: any = {
      status: body.result,
      history: updatedHistory,
      updated_at: new Date().toISOString(),
    };
    
    if (body.result === 'verified') {
      updates.current_result = {
        status: 'active',
        planName: `${eligibility.payer} Plan`,
        effectiveDates: '01/01/2025–12/31/2025',
        officeVisitCopay: body.copay || '$40',
        deductibleRemaining: body.deductible || '$600'
      };
    }
    
    const { data: updated, error: updateError } = await supabase
      .from('eligibilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating eligibility after manual verification:', updateError);
      return c.json({ error: updateError.message }, 500);
    }

    return c.json({ eligibility: updated });
  } catch (error) {
    console.error('Error recording manual verification:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);