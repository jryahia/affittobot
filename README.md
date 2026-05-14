# 🏠 AffittoBot — Analisi Contratti d'Affitto con AI

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/Groq-Llama%203%2070B-orange)](https://groq.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AffittoBot** analizza automaticamente i contratti d'affitto italiani usando
l'intelligenza artificiale. In meno di 30 secondi ottieni:

- 📋 **Score del contratto** (1–10) basato su clausole, prezzo e condizioni
- ⚖️ **Clausole vessatorie** con riferimenti normativi (Art. 1341 CC, L. 431/98…)
- 💰 **Confronto prezzi** rispetto al mercato locale della tua zona
- 📸 **Analisi fotografica** delle condizioni dell'immobile
- 💡 **Consigli personalizzati** per tutelarti come inquilino

---

## ✨ Funzionalità

| Funzione | Descrizione |
|---|---|
| OCR PDF | Estrazione testo da contratto PDF con PyMuPDF |
| Analisi legale | Llama 3 70B analizza clausole secondo la legge italiana |
| Vision AI | Llama 3.2 11B Vision analizza le foto dell'appartamento |
| Confronto prezzi | Database prezzi per 12 città italiane (Roma, Milano, Napoli…) |
| Privacy-first | Nessun dato salvato sul server, cancellazione automatica dopo 1h |
| Report PDF | Esporta il report completo via stampa del browser |

---

## 🛠️ Stack tecnologico

- **Frontend**: Next.js 14, React 18, Tailwind CSS 3
- **Backend**: FastAPI, Python 3.11, PyMuPDF, Groq SDK
- **AI**: Llama 3 70B (testo), Llama 3.2 11B Vision (foto) via Groq
- **Deploy**: Docker Compose

---

## 🚀 Avvio rapido

### Prerequisiti

- Node.js ≥ 18
- Python ≥ 3.11
- Una chiave API Groq (gratuita su [console.groq.com](https://console.groq.com))

### 1. Clona il repository

```bash
git clone https://github.com/tuousername/affittobot.git
cd affittobot
```

### 2. Configura il backend

```bash
cd backend

# Crea l'ambiente virtuale
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installa le dipendenze
pip install -r requirements.txt

# Configura la chiave API
cp .env.example .env
# Modifica .env e inserisci la tua GROQ_API_KEY
```

### 3. Avvia il backend

```bash
# Dalla cartella backend/, con l'ambiente virtuale attivo
python main.py
```

Il server sarà disponibile su `http://localhost:8000`.
Verifica con: `curl http://localhost:8000/api/health`

### 4. Configura il frontend

```bash
cd frontend
npm install
```

### 5. Avvia il frontend

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`.

---

## 🐳 Avvio con Docker

```bash
# Crea il file .env nella cartella backend
echo "GROQ_API_KEY=la_tua_chiave" > backend/.env

# Avvia entrambi i servizi
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Docs API: `http://localhost:8000/docs`

---

## 📸 Screenshot

```
┌─────────────────────────────────────────┐
│  🏠 AffittoBot                          │
│                                         │
│  Analizza il tuo contratto d'affitto    │
│  in 5 minuti con l'intelligenza         │
│  artificiale                            │
│                                         │
│  [📄 Carica contratto PDF        ]      │
│  [📸 Carica foto appartamento    ]      │
│  Città: Roma    Quartiere: Trastevere   │
│  Superficie: 65 m²   Canone: €950/mese  │
│                                         │
│  [ Analizza il contratto →      ]       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Report Analisi — Score: 6.5/10         │
│                                         │
│       ╭──────────╮                      │
│       │  6.5/10  │  ← gauge animato     │
│       ╰──────────╯                      │
│                                         │
│  ⚠️ Clausole Vessatorie (2 trovate)      │
│  💰 Analisi Prezzi (sopra media +12%)   │
│  📸 Analisi Foto (condizioni discrete)  │
│  💡 5 Consigli personalizzati           │
└─────────────────────────────────────────┘
```

---

## 🔐 Privacy

> **Nessun dato salvato.** I file caricati vengono conservati temporaneamente
> in `/tmp/{uuid}/` ed eliminati automaticamente dopo **1 ora**. Non salviamo
> contratti, dati personali o risultati su database di alcun tipo.

---

## ❓ Perché questo progetto?

Il mercato degli affitti italiano è tra i più complicati d'Europa:

- **Clausole abusive** spesso nascoste in contratti standard
- **Prezzi gonfiati** in città come Milano, Roma e Firenze
- **Inquilini poco informati** sui propri diritti (L. 431/98, Art. 1341 CC)
- **Costo elevato** di una consulenza legale per verificare un contratto

AffittoBot democratizza l'accesso all'analisi legale: in 30 secondi e gratis,
ogni inquilino può capire se il suo contratto è equo e tutelarsi di conseguenza.

---

## 🤝 Contribuire

Le PR sono benvenute! Per modifiche significative, apri prima una Issue per
discutere le modifiche proposte.

---

## 📄 Licenza

MIT © 2024 — Sviluppato con ❤️ in Italia

---

🔗 **Demo live**: [affittobot.vercel.app](https://affittobot.vercel.app) *(placeholder)*
