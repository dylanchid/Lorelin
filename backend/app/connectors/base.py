from abc import ABC, abstractmethod
from ..models.domain import VoBRequest, VoBResult

class BaseConnector(ABC):
    @abstractmethod
    async def check_eligibility(self, request: VoBRequest) -> VoBResult:
        """
        Check eligibility for a patient.
        """
        pass
