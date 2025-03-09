# DeepThreatModel 
DeepThreatModel, or Deep-TM, is a tool that utilizes a set of AI agents to compose threat models. The generated results are expected to be deeply researched, verified, and ready for inclusion in your documents.

## Features
### AI Agent
The bespoke DeepSearch capability:

- Automatically looks up threats and attack techniques from reliable security sources (e.g., OWASP, MITRE, CVE).
- Infrastructure awareness: if your diagram includes services from a cloud provider, it also looks up the corresponding security practice guide for that provider.
  
### Editor
- Mimick Confluence/Notion block editor experience, letting you paste and generate threat modeling in a few steps
- Support mermaid markdown 


## Quick Start with Docker Compose
To use DeepThreatModel, you’ll need API keys for OpenAI and Google Custom Search Engine (CSE). Below are instructions on how to obtain them, followed by steps to set up the project using Docker Compose.

### Retrieving API Keys
1. OpenAI API Key:
   - Sign up for an account at OpenAI.
   - Once logged in, navigate to the API section and generate a new API key.
   - Copy this key for use in the .env file.
2. Google API Key and CSE ID:
   - Go to the Google Cloud Console.
   - Create a new project (or use an existing one).
   - Enable the Custom Search API in the API Library.
   - Generate an API key under Credentials > Create Credentials > API Key.
   - Set up a Custom Search Engine (CSE) at Google CSE and obtain your CSE ID.
   - Copy both the API key and CSE ID for use in the .env file.

### Setup the container
1. Clone or Download the Project 
2. Create your `.env`
    ```bash
        OPENAI_API_KEY=your_actual_openai_api_key
        GOOGLE_API_KEY=your_actual_google_api_key
        GOOGLE_CSE_ID=your_actual_google_cse_id
    ```
3. Build and Start the Containers `docker compose up -d`
4. Access at `http://localhost:5173`

## Acknowledgements
Deep-ThreatModel couldn't have been built without the help of great software already available from the community. Thank you.
- [mermaidjs](https://github.com/mermaid-js/mermaid)
- [BlockNote](https://github.com/TypeCellOS/BlockNote)
- [pydantic-ai](https://github.com/pydantic/pydantic-ai)