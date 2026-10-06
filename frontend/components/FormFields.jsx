import { useEffect, useRef, useState } from "react";

const ITALIAN_CITIES = [
  "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno",
  "Asti", "Avellino", "Bari", "Barletta", "Belluno", "Benevento", "Bergamo",
  "Biella", "Bologna", "Bolzano", "Brescia", "Brindisi", "Cagliari",
  "Caltanissetta", "Campobasso", "Caserta", "Catania", "Catanzaro", "Chieti",
  "Como", "Cosenza", "Cremona", "Crotone", "Cuneo", "Enna", "Fermo", "Ferrara",
  "Firenze", "Foggia", "Forlì", "Frosinone", "Genova", "Gorizia", "Grosseto",
  "Imperia", "Isernia", "L'Aquila", "La Spezia", "Latina", "Lecce", "Lecco",
  "Livorno", "Lodi", "Lucca", "Macerata", "Mantova", "Massa", "Matera",
  "Messina", "Milano", "Modena", "Monza", "Napoli", "Novara", "Nuoro",
  "Oristano", "Padova", "Palermo", "Parma", "Pavia", "Perugia", "Pesaro",
  "Pescara", "Piacenza", "Pisa", "Pistoia", "Pordenone", "Potenza", "Prato",
  "Ragusa", "Ravenna", "Reggio Calabria", "Reggio Emilia", "Rieti", "Rimini",
  "Roma", "Rovigo", "Salerno", "Sassari", "Savona", "Siena", "Siracusa",
  "Sondrio", "Sud Sardegna", "Taranto", "Teramo", "Terni", "Torino", "Trapani",
  "Trento", "Treviso", "Trieste", "Udine", "Varese", "Venezia", "Verbania",
  "Vercelli", "Verona", "Vibo Valentia", "Vicenza", "Viterbo",
];

function CityAutocomplete({ value, onChange, error }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.length >= 1
    ? ITALIAN_CITIES.filter((c) => c.toLowerCase().startsWith(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (city) => {
    setQuery(city);
    onChange(city);
    setOpen(false);
    setHighlighted(-1);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        placeholder="Es. Roma"
        className={`form-input ${error ? "border-red-400 focus:ring-red-200" : ""}`}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
        onFocus={() => query.length >= 1 && setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul ref={listRef} className="autocomplete-list">
          {filtered.map((city, i) => (
            <li
              key={city}
              className={`autocomplete-item ${i === highlighted ? "bg-green-50 text-verde-italia" : ""}`}
              onMouseDown={() => select(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FormFields({ values, onChange, errors }) {
  const field = (name) => ({
    value: values[name] || "",
    onChange: (e) => onChange(name, e.target ? e.target.value : e),
  });

  return (
    <div className="space-y-5">

      {/* Città */}
      <div>
        <label className="form-label">
          Città <span className="text-red-500">*</span>
        </label>
        <CityAutocomplete
          value={values.city || ""}
          onChange={(v) => onChange("city", v)}
          error={errors?.city}
        />
        {errors?.city && <p className="form-error">{errors.city}</p>}
      </div>

      {/* Quartiere */}
      <div>
        <label className="form-label">
          Quartiere / Zona <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Es. Trastevere, Navigli, Vomero…"
          className="form-input"
          {...field("neighborhood")}
          style={{ borderColor: errors?.neighborhood ? "#f87171" : undefined }}
        />
        {errors?.neighborhood && <p className="form-error">{errors.neighborhood}</p>}
      </div>

      {/* Superficie + Prezzo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">
            Superficie <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="10"
              max="1000"
              placeholder="80"
              className="form-input pr-10"
              value={values.size_m2 || ""}
              onChange={(e) => onChange("size_m2", e.target.value)}
              style={{ borderColor: errors?.size_m2 ? "#f87171" : undefined }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              m²
            </span>
          </div>
          {errors?.size_m2 && <p className="form-error">{errors.size_m2}</p>}
        </div>

        <div>
          <label className="form-label">
            Canone mensile <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
              €
            </span>
            <input
              type="number"
              min="1"
              placeholder="900"
              className="form-input pl-7"
              value={values.price || ""}
              onChange={(e) => onChange("price", e.target.value)}
              style={{ borderColor: errors?.price ? "#f87171" : undefined }}
            />
          </div>
          {errors?.price && <p className="form-error">{errors.price}</p>}
        </div>
      </div>

      {/* Descrizione */}
      <div>
        <label className="form-label">
          Note aggiuntive{" "}
          <span className="text-gray-400 font-normal">(opzionale)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Es. l'appartamento è arredato, incluse utenze, cauzione richiesta..."
          className="form-input resize-none"
          {...field("description")}
        />
        <p className="text-xs text-gray-400 mt-1">
          Qualsiasi dettaglio aiuta l&apos;analisi a essere più precisa.
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="form-label">
          Email{" "}
          <span className="text-gray-400 font-normal">(opzionale)</span>
        </label>
        <input
          type="email"
          placeholder="mario.rossi@esempio.it"
          className="form-input"
          {...field("email")}
          style={{ borderColor: errors?.email ? "#f87171" : undefined }}
        />
        {errors?.email && <p className="form-error">{errors.email}</p>}
        <p className="text-xs text-gray-400 mt-1">
          Non inviamo spam. Email usata solo per inviarti il report.
        </p>
      </div>
    </div>
  );
}
