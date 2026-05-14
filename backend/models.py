from typing import Optional
from pydantic import BaseModel, Field


class ClausolaVessatoria(BaseModel):
    clausola: str
    articolo: str
    spiegazione: str
    gravita: str  # "alta" | "media" | "bassa"


class PriceAnalysis(BaseModel):
    confronto: str  # "sopra media" | "nella media" | "sotto media"
    differenza_percentuale: int
    media_zona: int
    valutazione: str


class PhotoAnalysis(BaseModel):
    foto_index: int
    condizioni_generali: str
    danni_riscontrati: list[str] = Field(default_factory=list)
    umidita_presente: bool = False
    consigli_manutenzione: list[str] = Field(default_factory=list)


class MarketData(BaseModel):
    media_zona: int
    prezzo_utente: int
    differenza: int
    differenza_percentuale: int
    confronto: str
    avg_price_m2: float
    city: str
    neighborhood: str
    size_m2: int
    data_source: Optional[str] = None


class AnalyzeResponse(BaseModel):
    id: str
    score: int = Field(ge=1, le=10)
    clausole_vessatorie: list[ClausolaVessatoria] = Field(default_factory=list)
    price_analysis: PriceAnalysis
    photo_analysis: list[PhotoAnalysis] = Field(default_factory=list)
    consigli: list[str] = Field(default_factory=list)
    market_data: MarketData
