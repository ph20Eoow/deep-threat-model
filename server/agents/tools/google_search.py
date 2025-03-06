import requests
from pydantic import BaseModel, Field
from typing import List, Optional
import urllib.parse
from config import config

class SearchResult(BaseModel):
    title: str = Field(..., description="Title of the search result")
    link: str = Field(..., description="URL of the search result")
    snippet: str = Field(..., description="Snippet or description of the search result")


class GoogleSearchInput(BaseModel):
    query: str = Field(..., description="The search query to perform")
    site: Optional[str] = Field(None, description="Limit search to specific site (e.g. 'owasp.org')")
    num_results: int = Field(10, description="Number of results to return", ge=1, le=50)


class GoogleSearchOutput(BaseModel):
    results: List[SearchResult] = Field(..., description="List of search results")
    query: str = Field(..., description="The query that was searched")


class GoogleSearchTool:
    """Tool for performing Google searches, especially for security research."""
    
    def __init__(self):
        self.api_key = config.GOOGLE_API_KEY
        self.cx = config.GOOGLE_CSE_ID
        
        if not self.api_key or not self.cx:
            raise ValueError("Google API key or CSE ID not found. Set GOOGLE_API_KEY and GOOGLE_CSE_ID environment variables.")
            
    def search(self, params: GoogleSearchInput) -> GoogleSearchOutput:
        """Performs a Google search with the given parameters."""
        # Construct query with site restriction if provided
        query = params.query
        if params.site:
            query = f"site:{params.site} {query}"
            
        # Build request URL
        url = "https://www.googleapis.com/customsearch/v1"
        query_params = {
            "key": self.api_key,
            "cx": self.cx,
            "q": query,
            "num": min(params.num_results, 10)  # API limit is 10 per request
        }
        
        results = []
        start_index = 1
        
        # Make multiple requests if necessary to get the requested number of results
        while len(results) < params.num_results:
            current_params = query_params.copy()
            current_params["start"] = start_index
            
            response = requests.get(url, params=current_params)
            data = response.json()
            
            if "items" not in data:
                break
                
            for item in data["items"]:
                results.append(
                    SearchResult(
                        title=item.get("title", ""),
                        link=item.get("link", ""),
                        snippet=item.get("snippet", "")
                    )
                )
                
                if len(results) >= params.num_results:
                    break
                    
            if len(data["items"]) < 10:  # No more results available
                break
                
            start_index += 10
            
        return GoogleSearchOutput(
            results=results[:params.num_results],
            query=query
        ) 