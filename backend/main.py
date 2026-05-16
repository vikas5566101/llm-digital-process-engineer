from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from google import genai
import os

# Load environment variables
load_dotenv()

# Create Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Create FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class ChatRequest(BaseModel):
    message: str

# Home route
@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }

# Chat route
@app.post("/chat")
async def chat(request: ChatRequest):

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=request.message
        )

        return {
            "response": response.text
        }

    except Exception as e:

        return {
            "error": str(e)
        }