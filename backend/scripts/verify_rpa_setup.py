import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from app.connectors.rpa import RPAConnector
    from app.core.llm_parser import LLMParser
    from app.core.config import settings
    
    print("Successfully imported RPAConnector and LLMParser")
    
    # Mock settings for instantiation
    # settings.BROWSERBASE_API_KEY = "mock_key"
    # settings.BROWSERBASE_PROJECT_ID = "mock_id"
    # settings.ANTHROPIC_API_KEY = "mock_key"
    
    rpa = RPAConnector()
    print("Successfully instantiated RPAConnector")
    
    llm = LLMParser()
    print("Successfully instantiated LLMParser")
    
    print("Verification passed!")
    
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
