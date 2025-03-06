from dataclasses import dataclass
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel
from config import config
from pydantic import BaseModel, Field
from typing import List, Optional
from .tools.web_scraper import WebScraperTool, WebScraperInput, WebScraperOutput
from .tools.google_search import GoogleSearchTool, GoogleSearchInput, GoogleSearchOutput


@dataclass
class Deps:
    topic: str


class ResearchAgent:
    def __init__(self):
        self._init_agent()

    def _init_agent(self):
        model = OpenAIModel(
            model_name="gpt-4o-mini",
            api_key=config.OPENAI_API_KEY
        )

        agent = Agent(
                model=model,
                system_prompt=[
                    "You are a security expert specializing in threat modeling.",
                    "Use search_web to find information about the user's input.",
                    "Use scrape_webpage to scrape the web page for more information.",
                    "Use research_web_security_topic to research a web security topic.",
                ],
                deps_type=str,
            )
        
        # Initialize tools
        web_scraper = WebScraperTool()
        google_search = GoogleSearchTool()

        @agent.tool
        async def search_web(ctx: RunContext, query: str, site: Optional[str] = "owasp.org", num_results: int = 5):
            """
            Search the web for information related to web security.
            
            Args:
                ctx: The run context
                query: The search query to perform
                site: Limit search to specific site (defaults to owasp.org)
                num_results: Number of results to return
                
            Returns:
                Search results with titles, links and snippets
            """
            search_input = GoogleSearchInput(
                query=query,
                site=site,
                num_results=num_results
            )
            return google_search.search(search_input)

        @agent.tool
        async def scrape_webpage(ctx: RunContext, url: str, include_links: bool = True):
            """
            Scrape a webpage and extract its content in readable markdown format.
            
            Args:
                ctx: The run context
                url: The URL of the webpage to scrape
                include_links: Whether to preserve hyperlinks in the markdown output
                
            Returns:
                The scraped content as markdown and metadata about the page
            """
            scraper_input = WebScraperInput(
                url=url,
                include_links=include_links
            )
            return web_scraper.scrape(scraper_input)

        @agent.tool
        async def research_web_security_topic(ctx: RunContext, topic: str, depth: int = 2):
            """
            Perform deep research on a web security topic by searching OWASP and other security resources.
            
            Args:
                ctx: The run context
                topic: The web security topic to research
                depth: How many levels deep to research (1-3)
                
            Returns:
                A comprehensive report on the topic
            """
            # Search OWASP for the topic
            owasp_results = google_search.search(GoogleSearchInput(
                query=topic,
                site="owasp.org",
                num_results=3
            ))
            
            # Search more generally if needed
            general_results = google_search.search(GoogleSearchInput(
                query=f"web security {topic}",
                num_results=2
            ))
            
            # Collect all results
            all_results = []
            all_results.extend(owasp_results.results)
            all_results.extend(general_results.results)
            
            # Scrape the most relevant pages based on depth
            pages_to_scrape = all_results[:depth]
            scraped_content = []
            
            for result in pages_to_scrape:
                try:
                    scrape_result = web_scraper.scrape(WebScraperInput(
                        url=result.link,
                        include_links=True
                    ))
                    scraped_content.append({
                        "title": result.title,
                        "url": result.link,
                        "content": scrape_result.content[:1000] + "..." if len(scrape_result.content) > 1000 else scrape_result.content
                    })
                except Exception as e:
                    scraped_content.append({
                        "title": result.title,
                        "url": result.link,
                        "error": str(e)
                    })
            
            return {
                "topic": topic,
                "search_results": all_results,
                "detailed_content": scraped_content
            }

        self.agent = agent

    async def run(self, input: str):
        """Run the agent with the given user input"""
        return await self.agent.run(input)