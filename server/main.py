from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api import tm
import logfire
from config import config
logfire.configure(token=config.LOGFIRE_API_KEY)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize admin user
    try:
        # driver = Neo4jDriver()
        # user_repo = UserRepository(driver)
        # # Hash the default admin password
        # hashed_password = get_password_hash(db_settings.default_admin_password)  # Default password, should change after first login
        # admin_user = await user_repo.initialize_admin(hashed_password)
        # if admin_user:
            print("✅ Admin user initialized successfully")
        # else:
        #     print("ℹ️ Admin user already exists")
    except Exception as e:
        print(f"❌ Error initializing admin user: {str(e)}")
    
    yield  # Server is running
    # Shutdown: Clean up resources if needed

app = FastAPI(
    title="API for /rTM",
    description="API for /rTM",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
app.include_router(tm.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to your FastAPI application!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8098, reload=True)