from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
# from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File


from pypdf import PdfReader

import shutil
import os

from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from langchain_chroma import Chroma
from fastapi.staticfiles import StaticFiles

from google import genai

# Load environment variables
load_dotenv()

# Gemini Client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Embedding Model
# embedding_model = SentenceTransformer(
#     "all-MiniLM-L6-v2"
# )

vector_store = Chroma(
    collection_name="process_docs",
    persist_directory="chroma_db"
)

# FastAPI App
app = FastAPI()

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Schema
class ChatRequest(BaseModel):
    message: str
    mode: str
    history: list = []

# Home Route
@app.get("/")
def home():

    return {
        "message": "Backend Running Successfully"
    }

# Chat Route
@app.post("/chat")
async def chat(request: ChatRequest):

    try:

        # Search relevant chunks
        results = vector_store.similarity_search_with_score(
            request.message,
            k=4
        )

        # Combine retrieved context
        context = ""

        sources = []

        for doc, score in results:

            metadata = doc.metadata

            source_info = {
                "text": doc.page_content,
                "source": metadata.get("source", "Unknown"),
                "chunk": metadata.get("chunk", 0),
                "score": round(score, 4)
            }

            sources.append(source_info)

            context += doc.page_content + "\n\n"

        history_text = ""

        for msg in request.history[-6:]:

            history_text += f"""
            {msg['role']}:
            {msg['text']}
            """

        system_prompt = ""

        if request.mode == "Safety Analysis":

            system_prompt = """
            You are an industrial safety expert.
            Focus on hazards, shutdown procedures,
            compliance, and operational risks.
            """

        elif request.mode == "Equipment Diagnostics":

            system_prompt = """
            You are an industrial equipment diagnostics expert.
            Focus on troubleshooting, root causes,
            failure analysis, and corrective actions.
            """

        else:

            system_prompt = """
            You are a senior process optimization engineer.
            Focus on efficiency, optimization,
            productivity, and process improvements.
            """

        # Prompt for Gemini
        prompt = f"""
        {system_prompt}

        Answer the question ONLY from the provided document context.

        DOCUMENT CONTEXT:
        {context}
        
        CONVERSATION HISTORY:
        {history_text}

        USER QUESTION:
        {request.message}
        """

        # Generate AI response
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return {
            "response": response.text,
            "sources": sources
            
        }

    except Exception as e:

        return {
            "error": str(e)
        }

# Upload PDF Route
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    try:

        # Create file path
        file_path = f"uploads/{file.filename}"

        # Save uploaded PDF
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Read PDF
        reader = PdfReader(file_path)

        text = ""

        # Extract text
        for page in reader.pages:

            extracted = page.extract_text()

            if extracted:
                text += extracted

        # Text Chunking
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

        chunks = splitter.split_text(text)

        

        # Store chunks in ChromaDB
        for i, chunk in enumerate(chunks):

            vector_store.add_texts(
                texts=[chunk],
                metadatas=[{
                    "source": file.filename,
                    "chunk": i
                }],
                ids=[f"{file.filename}_{i}"]
            )

        return {
            "filename": file.filename,
            "total_chunks": len(chunks),
            "message": "PDF processed and stored successfully"
        }

    except Exception as e:

        return {
            "error": str(e)
        }