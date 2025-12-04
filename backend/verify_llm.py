import asyncio
import os
from app.core.llm_parser import LLMParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def verify_parser():
    print("Initializing LLMParser...")
    parser = LLMParser()
    
    # Sample HTML that mimics a payer portal
    sample_html = """
    <html>
        <body>
            <h1>Eligibility Results</h1>
            <div id="coverage-info">
                <p>Status: <strong>Active</strong></p>
                <p>Plan: <span class="plan-name">Super Platinum PPO</span></p>
            </div>
            <table>
                <tr>
                    <td>Individual Deductible</td>
                    <td>$500.00</td>
                </tr>
                <tr>
                    <td>Remaining Deductible</td>
                    <td>$250.00</td>
                </tr>
                <tr>
                    <td>Office Visit Copay</td>
                    <td>$20.00</td>
                </tr>
            </table>
        </body>
    </html>
    """
    
    print("\n--- Input HTML ---")
    print(sample_html)
    
    print("\n--- Parsing with Gemini... ---")
    try:
        result = await parser.parse_html(sample_html, "test-request-id")
        
        print("\n--- Parsed Result ---")
        print(f"Plan Name: {result.plan_name}")
        print(f"Coverage Status: {result.coverage_status}")
        print(f"Deductible Total: {result.financials.deductible.individual.total}")
        print(f"Deductible Remaining: {result.financials.deductible.individual.remaining}")
        print(f"Copay: {result.financials.copays[0].amount}")
        print(f"Confidence: {result.confidence}")
        
        if result.plan_name == "Super Platinum PPO" and result.confidence == 1.0:
            print("\n✅ SUCCESS: LLM correctly extracted data from the sample HTML.")
        else:
            print("\n❌ FAILURE: Data mismatch or fallback used.")
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(verify_parser())
