import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import FileUpload from "../components/FileUpload";
import FormFields from "../components/FormFields";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const INITIAL_FORM = {
  city: "",
  neighborhood: "",
  size_m2: "",
  price: "",
  description: "",
  email: "",
};

function validate(form, pdfFiles) {
  const errs = {};
  if (!pdfFiles.length) errs.pdf = "Carica il contratto in formato PDF.";
  if (!form.city.trim()) errs.city = "La città è obbligatoria.";
  if (!form.neighborhood.trim()) errs.neighborhood = "Il quartiere è obbligatorio.";
  if (!form.size_m2 || Number(form.size_m2) < 5) errs.size_m2 = "Inserisci la superficie in m².";
  if (!form.price || Number(form.price) < 1) errs.price = "Inserisci il canone mensile.";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errs.email = "Indirizzo email non valido.";
  }
  return errs;
}

export default function Home() {
  const router = useRouter();
  const [pdfFiles, setPdfFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleFieldChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errs = validate(form, pdfFiles);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErr = document.querySelector("[data-error]");
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("pdf", pdfFiles[0]);
      imageFiles.forEach((img) => fd.append("images", img));
      fd.append("city", form.city.trim());
      fd.append("neighborhood", form.neighborhood.trim());
      fd.append("size_m2", String(Number(form.size_m2)));
      fd.append("price", String(Number(form.price)));
      if (form.description.trim()) fd.append("description", form.description.trim());
      if (form.email.trim()) fd.append("email", form.email.trim());

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Errore ${res.status}: analisi fallita.`);
      }

      const data = await res.json();

      // Persist result in localStorage, keyed by id
      localStorage.setItem(`affittobot_result_${data.id}`, JSON.stringify(data));

      router.push(`/dashboard?id=${data.id}`);
    } catch (err) {
      setApiError(
        err.message ||
          "Si è verificato un errore imprevisto. Riprova tra qualche minuto."
      );
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AffittoBot — Analisi Contratti d'Affitto con AI</title>
        <meta
          name="description"
          content="Analizza il tuo contratto d'affitto con l'intelligenza artificiale. Trova clausole abusive, confronta i prezzi e ricevi consigli legali in 5 minuti."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen hero-bg">
        {/* Navigation */}
        <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="font-black text-xl text-gray-800">AffittoBot</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Open Source
          </a>
        </nav>

        {/* Hero */}
        <header className="max-w-3xl mx-auto px-4 pt-12 pb-10 text-center">
          <div className="tricolor-accent w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Analizza il tuo{" "}
            <span className="text-verde-italia">contratto d'affitto</span>
            <br />in 5 minuti con l'AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Carica il contratto, rispondi a poche domande e ricevi un'analisi
            completa: clausole abusive, confronto prezzi, analisi foto e consigli
            personalizzati.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {[
              { icon: "🔒", text: "Nessun dato salvato" },
              { icon: "⚖️", text: "Basato su legge italiana" },
              { icon: "⚡", text: "Risultati in 30 secondi" },
              { icon: "🗑️", text: "Auto-cancellazione dopo 1h" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
              >
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Main form */}
        <main className="max-w-3xl mx-auto px-4 pb-20">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {/* PDF Upload */}
              <div className="card">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-red-500">📄</span>
                  Contratto d'affitto
                  <span className="text-red-500 text-sm">*</span>
                </h2>
                <FileUpload
                  type="pdf"
                  files={pdfFiles}
                  onChange={setPdfFiles}
                  maxFiles={1}
                  maxSizeMB={10}
                  hint="PDF fino a 10 MB — testo selezionabile (non scansione)"
                />
                {errors.pdf && (
                  <p className="mt-2 text-sm text-red-600" data-error>
                    {errors.pdf}
                  </p>
                )}
              </div>

              {/* Photo Upload */}
              <div className="card">
                <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <span>📸</span>
                  Foto dell'appartamento
                  <span className="text-gray-400 font-normal text-sm">(opzionale)</span>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Carica fino a 5 foto per ricevere un'analisi delle condizioni
                  dell'immobile da parte dell'AI.
                </p>
                <FileUpload
                  type="image"
                  files={imageFiles}
                  onChange={setImageFiles}
                  maxFiles={5}
                  maxSizeMB={5}
                  hint="JPG, PNG — max 5 foto, 5 MB ciascuna"
                />
              </div>

              {/* Form fields */}
              <div className="card">
                <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span>📋</span>
                  Dettagli dell'affitto
                </h2>
                <FormFields
                  values={form}
                  onChange={handleFieldChange}
                  errors={errors}
                />
              </div>

              {/* API Error */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-700 text-sm">Errore durante l'analisi</p>
                    <p className="text-red-600 text-sm mt-0.5">{apiError}</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base py-4 rounded-xl"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Analisi in corso… può richiedere fino a 30 secondi
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Analizza il contratto
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Analisi effettuata con AI (Llama 3 70B via Groq). Non sostituisce
                la consulenza legale professionale.
              </p>
            </div>
          </form>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-6 text-center">
          <p className="text-sm text-gray-400">
            AffittoBot — Privacy-first · Nessun dato salvato · Open Source
          </p>
        </footer>
      </div>
    </>
  );
}
