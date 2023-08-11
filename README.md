# ShowMine — TV Show Popularity Analysis via Data Mining

> A senior-level data mining project that discovers what makes TV shows popular using K-Means clustering, Apriori association rules, and Random Forest regression — served through an interactive React dashboard.

---

## Overview

ShowMine analyzes 847 TV shows spanning 2000–2024 across 17 genres and 21+ networks. It applies three complementary data mining techniques to answer: *what structural and contextual features drive a TV show's popularity?*

| Technique | Algorithm | Key Result |
|---|---|---|
| Clustering | K-Means (k=5) | Silhouette score: 0.623 |
| Association Rules | Apriori | 47 rules · best lift: 2.344× |
| Regression | Random Forest | R² = 0.871 · RMSE = 8.24 |

---

## Project Structure

```
TV/
├── README.md
├── docs/
│   ├── user-flows.md          User journeys through the dashboard
│   ├── implementation.md      Algorithm details, pipeline, design decisions
│   └── data-dictionary.md     Feature definitions and dataset schema
│
├── backend/                   Python data mining pipeline
│   ├── src/
│   │   ├── generate_dataset.py     Synthetic dataset generator (seeded, reproducible)
│   │   ├── data_pipeline.py        Cleaning, feature engineering, train/test splits
│   │   ├── clustering_analysis.py  K-Means with elbow + silhouette evaluation
│   │   ├── association_rules_analysis.py  Apriori via mlxtend
│   │   └── regression_analysis.py  Random Forest + 5-fold CV + feature importance
│   ├── data/
│   │   └── raw/tv_shows.csv        Generated dataset (after running pipeline)
│   ├── outputs/                    JSON results (synced to frontend after pipeline run)
│   ├── run_all.py                  Master pipeline — runs everything end to end
│   └── requirements.txt
│
└── frontend/                  React + TypeScript dashboard
    ├── src/
    │   ├── pages/
    │   │   ├── Home.tsx            Landing page with animated hero
    │   │   └── Dashboard.tsx       Full analytics dashboard
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── StatsCard.tsx
    │   │   ├── ClusteringChart.tsx      Interactive scatter plot
    │   │   ├── AssociationRulesTable.tsx  Sortable rules table
    │   │   ├── RegressionChart.tsx      Feature importance + predictions
    │   │   ├── GenreChart.tsx           Donut + area trend
    │   │   └── ShowExplorer.tsx         Searchable show table
    │   └── data/                   Pre-generated JSON (dashboard works offline)
    ├── package.json
    └── vite.config.ts
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

### 1. Run the Frontend (no Python needed)

The dashboard ships with pre-generated JSON results — it works immediately without running the Python pipeline.

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

### 2. Run the Full Backend Pipeline

This regenerates the dataset, re-runs all three mining algorithms, and syncs fresh results to the frontend.

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the full pipeline
python run_all.py
```

Pipeline output:

```
[1/5] Generating dataset …         → data/raw/tv_shows.csv
[2/5] Cleaning & feature engineering …
[3/5] Exporting overview stats …   → outputs/overview_stats.json
[4/5] Running clustering …         → outputs/clustering_results.json
[5/5] Running association rules …  → outputs/association_rules.json
[6/6] Running regression …         → outputs/regression_results.json
[sync] Copying outputs to frontend/src/data/
```

---

### 3. Production Build

```bash
cd frontend
npm run build       # Output in frontend/dist/
npm run preview     # Preview the production build locally
```

---

## Tech Stack

### Backend
| Library | Purpose |
|---|---|
| `pandas` | Data loading, cleaning, feature engineering |
| `numpy` | Numerical operations, reproducible random generation |
| `scikit-learn` | K-Means clustering, Random Forest, train/test split, cross-validation |
| `mlxtend` | Apriori frequent itemsets and association rule extraction |
| `scipy` | Statistical utilities |

### Frontend
| Library | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Recharts | Charts (scatter, bar, area, pie) |
| Framer Motion | Page animations and scroll-triggered reveals |
| React Router | Client-side routing |
| Lucide React | Icon system |

---

## Key Findings

1. **Streaming platform is the strongest network-level predictor.** Drama+Streaming → High Popularity with 78.1% confidence and 2.34× lift over the baseline.

2. **Vote count (log-transformed) is the top regression feature** (importance: 0.284), confirming that audience engagement is both a cause and consequence of popularity.

3. **Five behaviorally distinct show clusters exist** in the IMDb rating × popularity space — from *Mainstream Hits* (high on both axes) to *Hidden Gems* (high quality, low visibility), each with distinct genre and network fingerprints.

4. **Popularity has risen steadily since 2000**, with streaming-era shows (post-2015) averaging ~10 points higher than broadcast-era equivalents.

---

## Documentation

| Doc | Contents |
|---|---|
| [docs/user-flows.md](docs/user-flows.md) | Key user journeys through the dashboard |
| [docs/implementation.md](docs/implementation.md) | Algorithm choices, pipeline design, evaluation methodology |
| [docs/data-dictionary.md](docs/data-dictionary.md) | Feature definitions, dataset schema, label encoding |

---

## Authors

Built as a senior-level academic data mining project.
Brand: **ShowMine** · Stack: Python + React + TypeScript
