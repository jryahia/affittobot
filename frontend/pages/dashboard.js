import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReportSection from "../components/ReportSection";
import ScoreGauge from "../components/ScoreGauge";
import {
  BookOpen,
  CircleCheck,
  CircleX,
  Droplets,
  FileWarning,
  House,
  Image as ImageIcon,
  Lightbulb,
  Scale,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  ChartColumn,
} from "lucide-react";

// ── Severity helpers ──────────────────────────────────────────────────────────

function SeverityBadge({ gravita }) {
  const map = {
    alta: "badge-alta",
    media: "badge-media",
    bassa: "badge-bassa",
  };
  const labels = { alta: "Alta", media: "Media", bassa: "Bassa" };
  const cls = map[gravita] || "badge-bassa";
  return (
    <span className={cls}>
      <span className="inline-block w-2 h-2 rounded-full bg-current mr-1 align-middle" />
      Gravità {labels[gravita] || gravita}
    </span>
  );
}

// ── Price bar comparison ──────────────────────────────────────────────────────

function PriceBar({ label, value, maxValue, color }) {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-20 text-sm font-semibold text-right shrink-0">
        €{value.toLocaleString("it-IT")}
      </span>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
      <div className="h-56 bg-gray-200 rounded-2xl" />
      <div className="h-40 bg-gray-200 rounded-2xl" />
      <div className="h-40 bg-gray-200 rounded-2xl" />
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const stored = localStorage.getItem(`affittobot_result_${id}`);
    if (stored) {
      try {
        setData(JSON.parse(stored));
        return;
      } catch {
        /* fall through to error */
      }
    }
    setError(
      "Risultato non trovato. L'analisi potrebbe essere scaduta. Torna alla home e ripeti l'analisi."
    );
  }, [id]);

  const handlePrint = () => window.print();

  const handleNewAnalysis = () => {
    if (id) localStorage.removeItem(`affittobot_result_${id}`);
    router.push("/");
  };

  if (!id || (!data && !error)) return <Skeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
        <FileWarning className="w-16 h-16 text-gray-400" />
        <h1 className="text-xl font-bold text-gray-800 text-center">{error}</h1>
        <button className="btn-primary" onClick={() => router.push("/")}>
          ← Nuova analisi
        </button>
      </div>
    );
  }

  const {
    score = 5,
    clausole_vessatorie = [],
    price_analysis = {},
    photo_analysis = [],
    consigli = [],
    market_data = {},
  } = data;

  const maxPriceBar = Math.max(market_data.prezzo_utente || 0, market_data.media_zona || 0) * 1.25 || 1500;

  const confrontoColor =
    market_data.confronto === "sotto media"
      ? "#16A34A"
      : market_data.confronto === "sopra media"
      ? "#DC2626"
      : "#EAB308";

  return (
    <>
      <Head>
        <title>Report AffittoBot — Analisi Contratto</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 no-print">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <House className="w-5 h-5 text-blue-600" />
              <span className="font-black text-lg text-gray-800">AffittoBot</span>
              <span className="text-gray-300 mx-1">|</span>
              <span className="text-sm text-gray-500">Report analisi</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-sm py-2 px-4" onClick={handlePrint}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Scarica PDF
              </button>
              <button className="btn-primary text-sm py-2 px-4" onClick={handleNewAnalysis}>
                Nuova analisi
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Score section */}
          <div className="card text-center animate-fade-in-up">
            <div className="tricolor-accent w-12 mx-auto mb-6" />
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Analisi del tuo contratto d'affitto
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Analisi effettuata con AI — {new Date().toLocaleDateString("it-IT", { dateStyle: "long" })}
            </p>
            <ScoreGauge score={score} />
          </div>

          {/* Clausole Vessatorie */}
          <ReportSection
            title="Clausole Vessatorie"
            subtitle={
              clausole_vessatorie.length > 0
                ? `${clausole_vessatorie.length} clausola${clausole_vessatorie.length !== 1 ? "e" : ""} problematica${clausole_vessatorie.length !== 1 ? "e" : ""} rilevata${clausole_vessatorie.length !== 1 ? "e" : ""}`
                : "Nessuna clausola problematica rilevata"
            }
            badge={clausole_vessatorie.length > 0 ? `${clausole_vessatorie.length} trovate` : "OK"}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            colorClass={clausole_vessatorie.length > 0 ? "text-rosso-italia" : "text-verde-italia"}
            borderClass={clausole_vessatorie.length > 0 ? "border-rosso-italia bg-rosso-italia" : "border-verde-italia bg-verde-italia"}
          >
            {clausole_vessatorie.length === 0 ? (
              <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-xl p-4">
                <CircleCheck className="w-7 h-7 shrink-0" />
                <p className="text-sm font-medium">
                  Ottimo! Non sono state rilevate clausole problematiche nel contratto.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clausole_vessatorie.map((c, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor:
                        c.gravita === "alta"
                          ? "#DC2626"
                          : c.gravita === "media"
                          ? "#F97316"
                          : "#EAB308",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">
                        {c.clausola}
                      </p>
                      <SeverityBadge gravita={c.gravita} />
                    </div>
                    {c.articolo && (
                      <p className="text-xs text-gray-500 mb-2">
                        <BookOpen className="inline w-3.5 h-3.5 mr-1 align-[-2px]" />
                        <span className="font-medium">{c.articolo}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed">{c.spiegazione}</p>
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* Analisi Prezzi */}
          <ReportSection
            title="Analisi del Prezzo"
            subtitle={`Confronto con il mercato di ${market_data.city || "—"} – ${market_data.neighborhood || "—"}`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            colorClass="text-blue-600"
            borderClass="border-blue-600 bg-blue-600"
          >
            <div className="space-y-5">
              {/* Confronto badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{
                  background: `${confrontoColor}18`,
                  color: confrontoColor,
                  border: `1px solid ${confrontoColor}44`,
                }}
              >
                {market_data.confronto === "sotto media" && <TrendingDown className="w-4 h-4" />}
                {market_data.confronto === "nella media" && <ChartColumn className="w-4 h-4" />}
                {market_data.confronto === "sopra media" && <TrendingUp className="w-4 h-4" />}
                <span>
                  Prezzo{" "}
                  {market_data.confronto === "sotto media"
                    ? "sotto la media"
                    : market_data.confronto === "nella media"
                    ? "nella media"
                    : "sopra la media"}{" "}
                  {market_data.differenza_percentuale !== 0 &&
                    `(${Math.abs(market_data.differenza_percentuale)}%${
                      market_data.differenza_percentuale > 0 ? " in più" : " in meno"
                    })`}
                </span>
              </div>

              {/* Bar chart */}
              <div className="space-y-3">
                <PriceBar
                  label="Il tuo canone"
                  value={market_data.prezzo_utente || 0}
                  maxValue={maxPriceBar}
                  color="#2563EB"
                />
                <PriceBar
                  label="Media zona"
                  value={market_data.media_zona || 0}
                  maxValue={maxPriceBar}
                  color="#9CA3AF"
                />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Tuo canone",
                    value: `€${(market_data.prezzo_utente || 0).toLocaleString("it-IT")}`,
                    color: "#2563EB",
                  },
                  {
                    label: "Media zona",
                    value: `€${(market_data.media_zona || 0).toLocaleString("it-IT")}`,
                    color: "#6B7280",
                  },
                  {
                    label: "Differenza",
                    value: `${market_data.differenza > 0 ? "+" : ""}€${(market_data.differenza || 0).toLocaleString("it-IT")}`,
                    color: confrontoColor,
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-base font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Valutazione text */}
              {price_analysis.valutazione && (
                <p className="text-sm text-gray-600 bg-blue-50 rounded-xl p-4 leading-relaxed flex gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                  <span>{price_analysis.valutazione}</span>
                </p>
              )}

              {market_data.data_source && (
                <p className="text-xs text-gray-400">
                  Fonte dati: {market_data.data_source} · {market_data.avg_price_m2}€/m² stimato
                </p>
              )}
            </div>
          </ReportSection>

          {/* Analisi Foto */}
          {photo_analysis.length > 0 && (
            <ReportSection
              title="Analisi Fotografica"
              subtitle={`${photo_analysis.length} foto analizzata${photo_analysis.length !== 1 ? "e" : ""} dal perito AI`}
              badge={`${photo_analysis.length} foto`}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              colorClass="text-purple-600"
              borderClass="border-purple-600 bg-purple-600"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {photo_analysis.map((p) => (
                  <div key={p.foto_index} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        <ImageIcon className="inline w-4 h-4 mr-1 align-[-3px]" />
                        Foto {p.foto_index}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            p.condizioni_generali === "buone"
                              ? "#dcfce7"
                              : p.condizioni_generali === "discrete"
                              ? "#fef9c3"
                              : "#fee2e2",
                          color:
                            p.condizioni_generali === "buone"
                              ? "#166534"
                              : p.condizioni_generali === "discrete"
                              ? "#854d0e"
                              : "#991b1b",
                        }}
                      >
                        {p.condizioni_generali === "buone" ? (
                          <><CircleCheck className="inline w-3.5 h-3.5 mr-1 align-[-2px]" />Buone condizioni</>
                        ) : p.condizioni_generali === "discrete" ? (
                          <><TriangleAlert className="inline w-3.5 h-3.5 mr-1 align-[-2px]" />Condizioni discrete</>
                        ) : (
                          <><CircleX className="inline w-3.5 h-3.5 mr-1 align-[-2px]" />Condizioni scadenti</>
                        )}
                      </span>
                    </div>

                    {p.umidita_presente && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-1.5">
                        <Droplets className="w-3.5 h-3.5" />
                        <span className="font-medium">Possibile umidità rilevata</span>
                      </div>
                    )}

                    {p.danni_riscontrati?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">Danni riscontrati:</p>
                        <ul className="space-y-1">
                          {p.danni_riscontrati.map((d, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                              <span className="text-red-400 shrink-0">•</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {p.consigli_manutenzione?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">Manutenzione consigliata:</p>
                        <ul className="space-y-1">
                          {p.consigli_manutenzione.map((c, i) => (
                            <li key={i} className="text-xs text-green-700 flex items-start gap-1.5">
                              <span className="text-green-500 shrink-0">→</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ReportSection>
          )}

          {/* Consigli */}
          {consigli.length > 0 && (
            <ReportSection
              title="Consigli Personalizzati"
              subtitle="Raccomandazioni specifiche per il tuo contratto"
              badge={`${consigli.length} consigli`}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              colorClass="text-amber-600"
              borderClass="border-amber-600 bg-amber-600"
            >
              <ol className="space-y-3">
                {consigli.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed pt-1">{c}</p>
                  </li>
                ))}
              </ol>
            </ReportSection>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-100 rounded-2xl p-5 text-center space-y-2 no-print">
            <p className="text-xs text-gray-500 leading-relaxed">
              <Scale className="inline w-3.5 h-3.5 mr-1 align-[-2px]" />
              <strong>Disclaimer legale:</strong> Questa analisi è generata da
              intelligenza artificiale a scopo informativo e non costituisce consulenza
              legale professionale. Per decisioni importanti, consulta un avvocato
              specializzato in diritto delle locazioni.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 no-print">
            <button className="btn-secondary flex-1" onClick={handlePrint}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Scarica Report PDF
            </button>
            <button className="btn-primary flex-1" onClick={handleNewAnalysis}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
              Nuova Analisi
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
