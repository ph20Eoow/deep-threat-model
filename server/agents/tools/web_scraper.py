from typing import Optional
from urllib.parse import urlparse
import re
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify
from pydantic import BaseModel, Field, HttpUrl
from readability import Document


class WebpageMetadata(BaseModel):
    """Schema for webpage metadata."""
    title: str = Field(..., description="The title of the webpage.")
    author: Optional[str] = Field(None, description="The author of the webpage content.")
    description: Optional[str] = Field(None, description="Meta description of the webpage.")
    site_name: Optional[str] = Field(None, description="Name of the website.")
    domain: str = Field(..., description="Domain name of the website.")


class WebScraperInput(BaseModel):
    """Input schema for the WebScraperTool."""
    url: HttpUrl = Field(
        ..., description="URL of the webpage to scrape.",
    )
    include_links: bool = Field(
        default=True, description="Whether to preserve hyperlinks in the markdown output.",
    )


class WebScraperOutput(BaseModel):
    """Schema for the output of the WebScraperTool."""
    content: str = Field(..., description="The scraped content in markdown format.")
    metadata: WebpageMetadata = Field(..., description="Metadata about the scraped webpage.")


class WebScraperTool:
    """Tool for scraping webpage content and converting it to markdown format."""
    
    def __init__(self):
        self.user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/91.0.4472.124 Safari/537.36"
        )
        self.timeout = 30
        self.max_content_length = 100_000_000

    def _fetch_webpage(self, url: str) -> str:
        """Fetches the webpage content with custom headers."""
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
        }
        response = requests.get(url, headers=headers, timeout=self.timeout)
        if len(response.content) > self.max_content_length:
            raise ValueError(f"Content length exceeds maximum of {self.max_content_length} bytes")
        return response.text

    def _extract_metadata(self, soup: BeautifulSoup, doc: Document, url: str) -> WebpageMetadata:
        """Extracts metadata from the webpage."""
        domain = urlparse(url).netloc
        
        # Extract metadata from meta tags
        metadata = {
            "title": doc.title(),
            "domain": domain,
            "author": None,
            "description": None,
            "site_name": None,
        }
        
        author_tag = soup.find("meta", attrs={"name": "author"})
        if author_tag:
            metadata["author"] = author_tag.get("content")
            
        description_tag = soup.find("meta", attrs={"name": "description"})
        if description_tag:
            metadata["description"] = description_tag.get("content")
            
        site_name_tag = soup.find("meta", attrs={"property": "og:site_name"})
        if site_name_tag:
            metadata["site_name"] = site_name_tag.get("content")
            
        return WebpageMetadata(**metadata)

    def _clean_markdown(self, markdown: str) -> str:
        """Cleans up the markdown content by removing excessive whitespace and normalizing formatting."""
        # Remove multiple blank lines
        markdown = re.sub(r"\n\s*\n\s*\n", "\n\n", markdown)
        # Remove trailing whitespace
        markdown = "\n".join(line.rstrip() for line in markdown.splitlines())
        # Ensure content ends with single newline
        markdown = markdown.strip() + "\n"
        return markdown

    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extracts the main content from the webpage using custom heuristics."""
        # Remove unwanted elements
        for element in soup.find_all(["script", "style", "nav", "header", "footer"]):
            element.decompose()
            
        # Try to find main content container
        content_candidates = [
            soup.find("main"),
            soup.find(id=re.compile(r"content|main", re.I)),
            soup.find(class_=re.compile(r"content|main", re.I)),
            soup.find("article"),
        ]
        
        main_content = next((candidate for candidate in content_candidates if candidate), None)
        if not main_content:
            main_content = soup.find("body")
            
        return str(main_content) if main_content else str(soup)

    def scrape(self, params: WebScraperInput) -> WebScraperOutput:
        """Scrapes webpage content and returns it as markdown with metadata."""
        # Fetch webpage content
        html_content = self._fetch_webpage(str(params.url))
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Extract main content using custom extraction
        main_content = self._extract_main_content(soup)
        
        # Convert to markdown
        markdown_options = {
            "strip": ["script", "style"],
            "heading_style": "ATX",
            "bullets": "-",
            "wrap": True,
        }
        
        if not params.include_links:
            markdown_options["strip"].append("a")
            
        markdown_content = markdownify(main_content, **markdown_options)
        
        # Clean up the markdown
        markdown_content = self._clean_markdown(markdown_content)
        
        # Extract metadata
        metadata = self._extract_metadata(soup, Document(html_content), str(params.url))
        
        return WebScraperOutput(
            content=markdown_content,
            metadata=metadata,
        )
