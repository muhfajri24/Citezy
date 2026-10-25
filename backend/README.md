# Citezy Backend (AI & Verification Engine)

FastAPI-powered evidence-grounded research backend for **Citezy** (Nebius x NVIDIA Track 2: Best Apps and Agents).

## 1. Features
- **Deterministic Quote & Numeric Verification:** Substring matching and numerical consistency checks ensuring evidence integrity.
- **Nebius Token Factory:** Integrates NVIDIA Nemotron for planning, semantic entailment classification, and synthesis.
- **Tavily Search API:** Live discovery and extraction of accessible scientific and technical sources.
- **Full Frontend Contract Compliance:** Native compatibility with `frontend/src/types/research.ts` and runtime validation.

## 2. Requirements & Setup
Python 3.10+ is required.

```bash
# In backend/ directory
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

## 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your API keys:
- `NEBIUS_API_KEY`: Your Nebius Token Factory API key.
- `TAVILY_API_KEY`: Your Tavily Search API key.

## 4. Run Tests
```bash
pytest
```

## 5. Start Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Open interactive documentation at: [http://localhost:8000/docs](http://localhost:8000/docs)
