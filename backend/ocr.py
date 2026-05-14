import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from every page of a PDF file using PyMuPDF."""
    try:
        doc = fitz.open(pdf_path)
        pages_text: list[str] = []

        for page_index in range(len(doc)):
            page = doc.load_page(page_index)
            text = page.get_text("text")
            if text and text.strip():
                pages_text.append(text.strip())

        doc.close()

        if not pages_text:
            return (
                "Errore: Nessun testo trovato nel PDF. "
                "Il documento potrebbe essere scansionato (immagine) o protetto da password. "
                "Si prega di fornire un PDF con testo selezionabile."
            )

        return "\n\n--- Pagina ---\n\n".join(pages_text)

    except fitz.FileDataError:
        return (
            "Errore: Il file caricato non è un PDF valido o è danneggiato. "
            "Assicurarsi di caricare un file PDF corretto."
        )
    except Exception as exc:
        return f"Errore durante l'estrazione del testo dal PDF: {exc}"
