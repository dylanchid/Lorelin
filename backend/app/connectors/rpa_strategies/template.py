from playwright.async_api import Page
from .base import PortalStrategy
from ...models.domain import VoBRequest

class TemplatePortalStrategy(PortalStrategy):
    """
    Template for implementing a new RPA portal strategy.
    Copy this file and rename it to match your payer (e.g., availity.py).
    """

    async def login(self, page: Page) -> None:
        """
        Implement login logic here.
        """
        # Example:
        # await page.goto(f"{self.base_url}/login")
        # await page.fill("input[name='username']", "user")
        # await page.fill("input[name='password']", "pass")
        # await page.click("button[type='submit']")
        pass

    async def search_eligibility(self, page: Page, request: VoBRequest) -> None:
        """
        Implement eligibility search logic here.
        """
        # Example:
        # await page.fill("#memberId", request.patient.member_id)
        # await page.click("#searchBtn")
        pass

    async def extract_results(self, page: Page) -> str:
        """
        Implement result extraction logic here.
        """
        # Example:
        # return await page.inner_html("#results")
        return ""
