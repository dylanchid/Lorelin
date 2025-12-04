from abc import ABC, abstractmethod
from playwright.async_api import Page
from ...models.domain import VoBRequest, VoBResult

class PortalStrategy(ABC):
    """
    Abstract base class for RPA portal strategies.
    Each payer/portal implementation should inherit from this class.
    """

    def __init__(self, base_url: str):
        self.base_url = base_url

    @abstractmethod
    async def login(self, page: Page) -> None:
        """
        Authenticates the user into the portal.
        """
        pass

    @abstractmethod
    async def search_eligibility(self, page: Page, request: VoBRequest) -> None:
        """
        Navigates to the eligibility search page and fills in the patient details.
        """
        pass

    @abstractmethod
    async def extract_results(self, page: Page) -> str:
        """
        Extracts the raw HTML or text results from the page.
        """
        pass
