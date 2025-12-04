import os
from typing import Type, Dict, Optional
from .base import PortalStrategy
from .mock_portal import MockPortalStrategy
from ...core.config import settings

class PortalFactory:
    """
    Factory for creating portal strategies based on payer_id.
    """
    
    _strategies: Dict[str, Type[PortalStrategy]] = {
        "mock": MockPortalStrategy,
        # Register new strategies here
        # "availity": AvailityStrategy,
    }

    @classmethod
    def get_strategy(cls, payer_id: str, base_url: Optional[str] = None) -> PortalStrategy:
        """
        Returns an instance of the appropriate PortalStrategy for the given payer_id.
        """
        # Normalize payer_id to lowercase for lookup
        strategy_class = cls._strategies.get(payer_id.lower())
        
        if not strategy_class:
            # Fallback logic
            if settings.DEMO_MODE or "mock" in payer_id.lower():
                 strategy_class = MockPortalStrategy
            else:
                raise ValueError(f"No RPA strategy found for payer: {payer_id}")

        # Determine Base URL
        # In a real scenario, this might come from a DB or Config based on payer_id
        url = base_url or settings.RPA_PORTAL_URL
        
        return strategy_class(base_url=url)

    @staticmethod
    def get_credentials(payer_id: str) -> Dict[str, str]:
        """
        Retrieves credentials for the given payer from environment variables.
        Convention: RPA_{PAYER_ID}_USERNAME, RPA_{PAYER_ID}_PASSWORD
        """
        payer_key = payer_id.upper().replace("-", "_")
        username = os.getenv(f"RPA_{payer_key}_USERNAME")
        password = os.getenv(f"RPA_{payer_key}_PASSWORD")
        
        if not username or not password:
             # Fallback for mock/dev
             if settings.DEMO_MODE or "mock" in payer_id.lower():
                 return {"username": "admin", "password": "password"}
             
             # Don't raise here, let the strategy handle missing creds if it wants, 
             # or raise if strict.
             print(f"Warning: No credentials found for {payer_id}")
             return {}

        return {"username": username, "password": password}
