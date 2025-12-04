from playwright.async_api import Page
from .base import PortalStrategy
from ...models.domain import VoBRequest

class MockPortalStrategy(PortalStrategy):
    """
    Strategy for interacting with the local mock portal.
    """

    async def login(self, page: Page) -> None:
        # 1. Login
        await page.goto(f"{self.base_url}/login")
        await page.fill("input[name='username']", "admin")
        await page.fill("input[name='password']", "password")
        await page.click("button[type='submit']")
        
        # Wait for navigation to eligibility page
        await page.wait_for_url(f"{self.base_url}/eligibility")

    async def search_eligibility(self, page: Page, request: VoBRequest) -> None:
        # 2. Fill Eligibility Form
        await page.fill("input[name='first_name']", request.patient.first_name)
        await page.fill("input[name='last_name']", request.patient.last_name)
        await page.fill("input[name='dob']", request.patient.dob.strftime("%Y-%m-%d"))
        await page.fill("input[name='member_id']", request.patient.member_id)
        await page.click("button[type='submit']")
        
        # 3. Scrape Results
        await page.wait_for_selector("#results")

    async def extract_results(self, page: Page) -> str:
        # Smart Extraction: Get only the results container
        target_selector = "#results" 
        element = await page.query_selector(target_selector)
        
        if element:
            raw_html = await element.inner_html()
        else:
            # Fallback to body if selector not found
            print(f"Selector {target_selector} not found, falling back to body")
            raw_html = await page.inner_html("body")
            
        return raw_html
