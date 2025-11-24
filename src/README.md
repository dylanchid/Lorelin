# Lorelin

A modern back-office web application for medical billing staff to manage payment disputes, visit documentation, and diagnostic analysis.

## Overview

Lorelin is designed specifically for medical billing professionals who need to efficiently manage the complexities of healthcare reimbursement, with a focus on distinguishing between OON/NSA/IDR cases and in-network denials. The application features a clean, fintech-inspired design with a neutral color palette that uses color strategically for value (green), urgency (red), and status indicators.

## Key Features

### 🏥 Visits Management
- **Visual pipeline strip** showing visit progression through recording, transcription, coding review, approval, and submission
- **Context-sensitive actions** based on visit status (Record, Review, Send to Athena, View claim)
- **Visit detail screen** with:
  - Interactive transcript with timestamp-based navigation
  - AI-suggested diagnosis codes (ICD-10) with evidence chips linked to transcript
  - AI-suggested procedure codes (CPT) with visual billed vs. allowed comparison
  - Clinical note sections with structured documentation
  - Status stepper showing visit workflow progress

### ⚖️ Disputes & Appeals
- **Unified worklist** for managing payment disputes across OON/NSA/IDR and in-network denial cases
- **Single-row filters** for case type, payer, status, and date ranges
- **Consolidated columns** showing key dispute information at a glance
- **Detailed case views** with case-specific workflows for appeals and IDR processes
- **Status tracking** through dispute lifecycle stages

### 🔍 Diagnostics
- **Streamlined two-screen workflow**:
  - Upload screen with inline column mapping for claims, remits, and optional contracts
  - Results screen with contract-aware analysis when fee schedules are provided
- **Intelligent data validation** and error handling
- **Visual analysis** of payment patterns and fee schedule compliance

### 📄 Templates
- **Four system templates**: Appeal Letter, IDR Supporting Document, Denial Response, Payment Follow-up
- **Template list page** with filtering and search
- **Individual template detail pages** featuring:
  - WYSIWYG rich text editor
  - Variable insertion for dynamic content
  - Template versioning and metadata
  - Shared layout for consistency

## Design Principles

### Color Strategy
- **Neutral light theme** avoiding the "rainbow of pills" look
- **Strategic color usage**:
  - Blue: Current workflow step and interactive elements
  - Green: Financial value and positive outcomes
  - Red: Urgency and critical items
  - Gray: Completed steps and neutral states
  - Soft pastels: Warnings and secondary alerts

### Layout Philosophy
- **Responsive design** without fixed pixel heights
- **Consistent header patterns** across detail screens (gray background for navigation and context, white cards for content)
- **Left navigation** with Dashboard, Disputes, Visits, Diagnostics, and Templates sections
- **Modern fintech aesthetic** with clean typography and generous whitespace

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon system
- **React Hook Form** - Form management
- **Recharts** - Data visualization

## Project Structure

```
/
├── App.tsx                          # Main application router
├── components/
│   ├── DisputesScreen.tsx           # Disputes worklist
│   ├── DisputesTable.tsx            # Disputes table component
│   ├── CaseDetailScreen.tsx         # Case detail router
│   ├── CaseDetailAppeal.tsx         # Appeal case detail
│   ├── CaseDetailIDR.tsx            # IDR case detail
│   ├── VisitsScreen.tsx             # Visits list with pipeline
│   ├── VisitDetailScreen.tsx        # Visit detail with transcript
│   ├── IntakeScreen.tsx             # Diagnostics upload screen
│   ├── TemplatesScreen.tsx          # Templates list
│   └── templates/
│       ├── TemplateDetailShared.tsx # Shared template layout
│       ├── AppealLetterTemplate.tsx
│       ├── IDRSupportingTemplate.tsx
│       ├── DenialResponseTemplate.tsx
│       └── PaymentFollowUpTemplate.tsx
└── styles/
    └── globals.css                  # Global styles and tokens
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Key Workflows

### Visit Processing
1. **Recording** - Capture patient visit audio
2. **Transcription** - AI converts audio to structured text
3. **Coding Review** - Review AI-suggested diagnosis and procedure codes
4. **Approval** - Finalize charges and validate against fee schedules
5. **Submission** - Send approved charges to practice management system (Athena)

### Dispute Management
1. **Case Creation** - Import denial or underpayment from claims data
2. **Classification** - Categorize as OON/NSA/IDR or in-network denial
3. **Documentation** - Gather evidence and build case file
4. **Appeal/IDR** - Submit through appropriate channel
5. **Resolution** - Track outcome and payment recovery

### Diagnostic Analysis
1. **Data Upload** - Import claims, remits, and optional fee schedules
2. **Column Mapping** - Map data fields inline during upload
3. **Analysis** - System identifies payment discrepancies and patterns
4. **Results Review** - Contract-aware analysis when fee schedules provided

## Development Notes

### Component Patterns
- All screens follow a consistent layout pattern with gray backgrounds and white content cards
- Detail screens mirror the Disputes layout: navigation on gray background, content in white cards
- Action buttons use consistent styling and right-alignment in tables

### State Management
- Currently using React's built-in state management
- Props drilling for navigation and data flow
- Future consideration for Context API or state management library as complexity grows

### Responsive Behavior
- Mobile-first approach with tablet and desktop breakpoints
- Pipeline visualizations adapt to available screen width
- Tables scroll horizontally on smaller screens
- Navigation collapses to hamburger menu on mobile

## Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced filtering and saved search views
- [ ] Bulk operations for visit approval and dispute submission
- [ ] Integration with practice management systems beyond Athena
- [ ] Analytics dashboard with KPIs and trends
- [ ] Role-based access control and user management
- [ ] Audit logging and compliance reporting

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact the development team.

---

**Lorelin** - Streamlining medical billing operations with modern technology.
