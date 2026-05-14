import os
import uuid
import asyncio
import shutil
from pathlib import Path
from typing import Optional, List

import aiofiles
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, BackgroundTasks, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from analyzer import ContractAnalyzer
from models import AnalyzeResponse
from ocr import extract_text_from_pdf
from price_data import get_market_data

load_dotenv()

app = FastAPI(title="AffittoBot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _delete_after_delay(path: str, delay: int = 3600) -> None:
    await asyncio.sleep(delay)
    shutil.rmtree(path, ignore_errors=True)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze(
    background_tasks: BackgroundTasks,
    pdf: UploadFile = File(...),
    images: Optional[List[UploadFile]] = File(default=None),
    city: str = Form(...),
    neighborhood: str = Form(...),
    size_m2: int = Form(...),
    price: int = Form(...),
    description: Optional[str] = Form(default=None),
    email: Optional[str] = Form(default=None),
):
    request_id = str(uuid.uuid4())
    base_dir = Path(f"/tmp/{request_id}")
    pdf_dir = base_dir / "pdf"
    images_dir = base_dir / "images"
    pdf_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    # Schedule temp directory removal after 1 hour
    background_tasks.add_task(_delete_after_delay, str(base_dir), 3600)

    # Persist the uploaded PDF
    safe_pdf_name = Path(pdf.filename).name if pdf.filename else "contratto.pdf"
    pdf_path = pdf_dir / safe_pdf_name
    async with aiofiles.open(pdf_path, "wb") as f:
        await f.write(await pdf.read())

    # Persist uploaded images
    image_paths: List[str] = []
    if images:
        for img in images:
            if img and img.filename:
                safe_name = Path(img.filename).name
                img_path = images_dir / safe_name
                async with aiofiles.open(img_path, "wb") as f:
                    await f.write(await img.read())
                image_paths.append(str(img_path))

    # Extract text from PDF
    pdf_text = extract_text_from_pdf(str(pdf_path))

    # Run AI analysis
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    analyzer = ContractAnalyzer(groq_api_key)

    contract_analysis = analyzer.analyze_contract(
        text=pdf_text,
        city=city,
        neighborhood=neighborhood,
        size_m2=size_m2,
        price=price,
        description=description or "",
    )

    photo_analysis: List[dict] = []
    if image_paths:
        photo_analysis = analyzer.analyze_photos(image_paths)

    market_data = get_market_data(city, neighborhood, size_m2, price)

    return {
        "id": request_id,
        "score": contract_analysis.get("score", 5),
        "clausole_vessatorie": contract_analysis.get("clausole_vessatorie", []),
        "price_analysis": contract_analysis.get("price_analysis", {}),
        "photo_analysis": photo_analysis,
        "consigli": contract_analysis.get("consigli", []),
        "market_data": market_data,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
