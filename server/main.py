from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import tm


app = FastAPI(
    title="API for deep-tm",
    description="API for deep-tm",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend 
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
app.include_router(tm.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to deep-tm!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)