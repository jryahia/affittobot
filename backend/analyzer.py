import base64
import json
from pathlib import Path

from groq import Groq


class ContractAnalyzer:
    def __init__(self, groq_api_key: str) -> None:
        self.client = Groq(api_key=groq_api_key)

    # ------------------------------------------------------------------
    # Contract text analysis
    # ------------------------------------------------------------------

    def analyze_contract(
        self,
        text: str,
        city: str,
        neighborhood: str,
        size_m2: int,
        price: int,
        description: str,
    ) -> dict:
        system_prompt = """Sei un avvocato specializzato in locazioni immobiliari italiane con 20 anni di esperienza.

Il tuo compito è analizzare contratti d'affitto italiani e identificare:
1. Clausole vessatorie o illegali secondo la legge italiana
2. Valutazione del prezzo rispetto al mercato locale
3. Consigli pratici per l'inquilino

Normativa di riferimento:
- Art. 1341 Codice Civile: clausole vessatorie nei contratti per adesione
- Art. 36 Codice del Consumo (D.Lgs. 206/2005): clausole abusive
- Art. 11 L. 392/1978: cauzione massima pari a 3 mensilità del canone
- L. 431/1998: disciplina delle locazioni ad uso abitativo (durata minima 4+2 anni, o 3+2 transitorio)
- Art. 2 L. 431/1998: divieto di sublocazione senza consenso scritto del locatore
- D.P.R. 131/1986: obbligo di registrazione del contratto entro 30 giorni
- Recesso dell'inquilino: 6 mesi di preavviso (Art. 3 L. 431/1998)
- Recesso del locatore: solo nei casi previsti dalla legge con 6 mesi di preavviso

Restituisci ESCLUSIVAMENTE un oggetto JSON valido con questa struttura esatta:
{
  "score": <intero da 1 a 10; 10=contratto perfetto per l'inquilino, 1=contratto molto sfavorevole>,
  "clausole_vessatorie": [
    {
      "clausola": "<citazione o descrizione della clausola problematica>",
      "articolo": "<norma violata, es. Art. 11 L. 392/1978>",
      "spiegazione": "<spiegazione chiara in italiano del perché è problematica>",
      "gravita": "<alta|media|bassa>"
    }
  ],
  "price_analysis": {
    "confronto": "<sopra media|nella media|sotto media>",
    "differenza_percentuale": <intero positivo o negativo>,
    "media_zona": <stima del canone medio mensile in euro per questa zona>,
    "valutazione": "<breve testo descrittivo della valutazione del prezzo>"
  },
  "consigli": [
    "<consiglio pratico 1 per l'inquilino>",
    "<consiglio pratico 2>",
    "<consiglio pratico 3>",
    "<consiglio pratico 4>",
    "<consiglio pratico 5>"
  ]
}

Non aggiungere testo prima o dopo il JSON. Solo JSON valido."""

        user_message = (
            f"Analizza il seguente contratto d'affitto:\n\n"
            f"CITTÀ: {city}\n"
            f"QUARTIERE/ZONA: {neighborhood}\n"
            f"SUPERFICIE: {size_m2} m²\n"
            f"CANONE MENSILE RICHIESTO: €{price}\n"
            f"NOTE AGGIUNTIVE: {description or 'Nessuna'}\n\n"
            f"TESTO DEL CONTRATTO:\n"
            f"{text[:6000]}\n\n"
            f"Fornisci l'analisi completa in JSON."
        )

        try:
            response = self.client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
                max_tokens=2000,
            )
            raw = response.choices[0].message.content or ""
            return self._parse_json(raw) or self._default_contract_response()
        except Exception:
            return self._default_contract_response()

    # ------------------------------------------------------------------
    # Photo analysis (vision)
    # ------------------------------------------------------------------

    def analyze_photos(self, image_paths: list[str]) -> list[dict]:
        results: list[dict] = []
        for i, image_path in enumerate(image_paths):
            result = self._analyze_single_photo(image_path, i + 1)
            results.append(result)
        return results

    def _analyze_single_photo(self, image_path: str, index: int) -> dict:
        try:
            raw_bytes = Path(image_path).read_bytes()
            image_b64 = base64.b64encode(raw_bytes).decode("utf-8")

            ext = Path(image_path).suffix.lower().lstrip(".")
            media_type = "image/png" if ext == "png" else "image/jpeg"

            prompt = (
                "Sei un perito edile specializzato in valutazione immobiliare. "
                "Analizza questa foto dell'appartamento.\n\n"
                "Restituisci ESCLUSIVAMENTE un oggetto JSON valido:\n"
                "{\n"
                '  "condizioni_generali": "<buone|discrete|scadenti>",\n'
                '  "danni_riscontrati": ["<danno visibile 1>", "<danno visibile 2>"],\n'
                '  "umidita_presente": <true|false>,\n'
                '  "consigli_manutenzione": ["<consiglio 1>", "<consiglio 2>"]\n'
                "}"
            )

            response = self.client.chat.completions.create(
                model="llama-3.2-11b-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{media_type};base64,{image_b64}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=500,
            )

            raw = response.choices[0].message.content or ""
            parsed = self._parse_json(raw)
            if parsed:
                parsed["foto_index"] = index
                return parsed
        except Exception:
            pass

        return self._default_photo_result(index)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_json(text: str) -> dict | None:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end <= start:
            return None
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            return None

    @staticmethod
    def _default_contract_response() -> dict:
        return {
            "score": 5,
            "clausole_vessatorie": [],
            "price_analysis": {
                "confronto": "nella media",
                "differenza_percentuale": 0,
                "media_zona": 0,
                "valutazione": (
                    "Impossibile analizzare automaticamente il prezzo. "
                    "Si consiglia un confronto con i portali immobiliari locali."
                ),
            },
            "consigli": [
                "Far revisionare il contratto da un avvocato specializzato in diritto delle locazioni.",
                "Verificare che il contratto venga registrato all'Agenzia delle Entrate entro 30 giorni.",
                "Controllare che la cauzione non superi 3 mensilità del canone (Art. 11 L. 392/1978).",
                "Assicurarsi che la durata minima sia di 4 anni rinnovabili di altri 2 (L. 431/1998).",
                "Documentare con fotografie lo stato dell'immobile prima dell'ingresso.",
            ],
        }

    @staticmethod
    def _default_photo_result(index: int) -> dict:
        return {
            "foto_index": index,
            "condizioni_generali": "Non valutabile",
            "danni_riscontrati": [],
            "umidita_presente": False,
            "consigli_manutenzione": [
                "Verifica manualmente le condizioni dell'immobile durante il sopralluogo."
            ],
        }
