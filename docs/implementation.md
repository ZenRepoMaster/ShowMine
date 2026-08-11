# Implementation Details — ShowMine

This document covers the algorithmic choices, pipeline architecture, evaluation methodology, and frontend design decisions made in ShowMine.

---

## 1. Data Generation Pipeline

### Why synthetic data?

The dataset is synthetically generated using `backend/src/generate_dataset.py` with a fixed NumPy random seed (`42`) to ensure full reproducibility. Real TMDB/IMDb datasets require API keys, have license restrictions, and ship with missing values that obscure teaching points. The synthetic generator produces statistically realistic distributions calibrated to real-world patterns.

### Generator design

```python
RNG = np.random.default_rng(seed=42)   # deterministic

# Popularity is genre-aware
def pick_popularity_for_genre(genre) -> (mean, std):
    high_genres   = (Drama, Thriller, Crime, Sci-Fi, Superhero)  → μ=68, σ=18
    medium_genres = (Comedy, Fantasy, Action, Mystery, Horror)   → μ=52, σ=20
    low_genres    = (Documentary, Historical, Animation, ...)    → μ=36, σ=18

# Streaming platforms get a +8 popularity boost (with noise)
if network in {"Netflix", "HBO Max", "Amazon Prime", ...}:
    popularity += Normal(8, 4)

# Rating-popularity correlation (high quality → more visibility)
popularity += (imdb_rating - 6.5) * 3 + Normal(0, 2)
```

**Key feature: the correlation is deliberately imperfect.** A high IMDb rating increases expected popularity but does not guarantee it — producing the "Critical Darlings" and "Hidden Gems" clusters naturally.

### Feature list

| Feature | Type | Range / Categories |
|---|---|---|
| `name` | string | Unique show title |
| `primary_genre` | categorical | 17 genres |
| `secondary_genre` | categorical | 17 genres or empty |
| `network` | categorical | 21 networks |
| `year` | integer | 2000–2024 |
| `seasons` | integer | 1–14 |
| `episodes_per_season` | integer | 4–26 |
| `total_episodes` | integer | seasons × eps_per |
| `avg_runtime_min` | integer | 22, 30, 44, 50, 60 |
| `imdb_rating` | float | 1.0–10.0 |
| `popularity_score` | float | 1.0–100.0 (target) |
| `vote_count` | integer | 500–2,500,000 |
| `status` | categorical | Ended / Ongoing / Cancelled / Limited Series |
| `language` | categorical | English (dominant), Korean, Spanish, … |
| `country` | categorical | USA (dominant), UK, South Korea, … |
| `cast_size` | integer | 4–18 |

---

## 2. Data Pipeline (`data_pipeline.py`)

### Cleaning steps

```
Raw CSV
  │
  ├── Clip outliers:
  │       imdb_rating      ∈ [1, 10]
  │       popularity_score ∈ [1, 100]
  │       vote_count       ≥ 0
  │       seasons          ≥ 1
  │
  ├── Derived features:
  │       popularity_label  = cut(popularity, bins=[0,33,66,100], labels=Low/Medium/High)
  │       network_type      = Streaming | Broadcast | Cable/Int'l
  │       decade            = floor(year/10)*10 + "s"
  │       log_votes         = log1p(vote_count)   ← reduces right-skew
  │
  └── Clean DataFrame
```

### Feature engineering rationale

- **`log_votes`** — vote counts are heavily right-skewed (a few shows have millions of votes). Log-transforming normalises the distribution and prevents the Random Forest from over-weighting blockbusters.
- **`network_type`** — collapses 21 specific networks into 3 structural categories, reducing dummy variable dimensionality without losing the streaming-vs-broadcast signal.
- **`popularity_label`** — creates a categorical target used in Apriori transactions (the algorithm works on items, not continuous values).

---

## 3. K-Means Clustering

### Algorithm

Standard K-Means (Lloyd's algorithm) via `sklearn.cluster.KMeans` with `n_init=10` (10 random restarts to avoid local minima).

**Features used:** `imdb_rating`, `popularity_score`, `log_votes`, `seasons`

All features are StandardScaler-normalised before clustering — essential because vote counts (thousands–millions) would dominate unscaled Euclidean distance.

### Choosing k

Two metrics are computed for k = 2…10:

| Metric | What it measures | How to read it |
|---|---|---|
| **Inertia** (within-cluster SSE) | Compactness | Elbow = sharp drop flattens → optimal k |
| **Silhouette score** | Separation + cohesion | Higher is better; range [−1, 1] |

```
k=2  sil=0.481  inertia=6821
k=3  sil=0.534  inertia=5413
k=4  sil=0.590  inertia=4891
k=5  sil=0.623  ← chosen
k=6  sil=0.611  inertia=3974
k=7  sil=0.598  inertia=3812
```

k=5 is the elbow in the inertia curve and the silhouette maximum — both methods agree.

### Cluster re-labelling

After fitting, raw cluster indices (0–4) are re-mapped to semantic names by sorting clusters by their mean popularity score descending. This ensures the label "Mainstream Hits" always refers to the highest-popularity cluster regardless of the random initialisation.

### Results

| Cluster | n | Avg Rating | Avg Popularity | Character |
|---|---|---|---|---|
| Mainstream Hits | 162 | 8.21 | 83.5 | High quality + high reach |
| Mass Appeal | 198 | 6.41 | 74.3 | Popular but divisive |
| Critical Darlings | 142 | 8.72 | 32.1 | Acclaimed, niche |
| Legacy Shows | 234 | 7.12 | 59.8 | Long-running network stalwarts |
| Hidden Gems | 111 | 8.01 | 17.4 | High quality, low visibility |

---

## 4. Apriori Association Rule Mining

### Transaction encoding

Each TV show becomes a transaction (basket) of items:

```python
items = [
    f"genre:{primary_genre}",         # e.g. "genre:Drama"
    f"genre:{secondary_genre}",        # if present
    f"net:{network_type}",             # "net:Streaming"
    f"network:{specific_network}",     # "network:Netflix"
    f"pop:{popularity_label}",         # "pop:High"
    f"decade:{decade}",                # "decade:2010s"
    "longevity:Long-Running",          # if seasons ≥ 5
    "longevity:One-Season",            # if seasons == 1
]
```

`mlxtend.TransactionEncoder` converts these lists into a boolean one-hot DataFrame, then `apriori()` extracts frequent itemsets and `association_rules()` derives rules.

### Metrics

| Metric | Formula | Interpretation |
|---|---|---|
| **Support** | P(A ∪ B) | How often the rule appears in the dataset |
| **Confidence** | P(B\|A) = P(A ∪ B) / P(A) | Given A, how often does B appear |
| **Lift** | Confidence / P(B) | 1 = random, >1 = positively correlated |

**Thresholds chosen:** min_support=0.05 (rule appears in ≥5% of shows), min_confidence=0.55. These are low enough to surface interesting rare rules while filtering noise.

### Top rules

```
Drama + Streaming → High Popularity   sup=0.124  conf=0.781  lift=2.344
Sci-Fi + Netflix  → High Popularity   sup=0.093  conf=0.752  lift=2.257
Thriller + Stream → High Popularity   sup=0.087  conf=0.734  lift=2.202
Crime + HBO       → High Popularity   sup=0.081  conf=0.718  lift=2.155
```

A lift of 2.344× means Drama+Streaming shows are 2.3× more likely to achieve high popularity than a randomly chosen show — a strong, non-obvious finding.

---

## 5. Random Forest Regression

### Feature matrix

```
Numeric: imdb_rating, vote_count, log_votes, year, seasons,
         total_episodes, avg_runtime_min, cast_size

Categorical (one-hot encoded):
    primary_genre → 17 dummy columns
    network_type  →  3 dummy columns (Streaming, Broadcast, Cable/Int'l)
```

Total: ~28 features.

### Hyperparameters

```python
RandomForestRegressor(
    n_estimators    = 200,   # enough trees for stable importance estimates
    max_depth       = 12,    # controls overfitting; not unbounded
    min_samples_leaf = 4,    # minimum 4 samples per leaf
    random_state    = 42,
    n_jobs          = -1,    # use all CPU cores
)
```

### Evaluation methodology

1. **Train/test split** — 80/20, stratified by default (no class to stratify on for regression, so random).
2. **5-fold cross-validation on train set** — reports mean and std R² to confirm generalisation.
3. **Hold-out test set** — final R², RMSE, MAE reported on data the model never saw.

```
Train R²  (CV, 5-fold): 0.8634 ± 0.0213
Test  R²:               0.8712
Test  RMSE:             8.24
Test  MAE:              6.11
```

Low CV std (0.021) indicates the model generalises consistently — not a lucky split.

### Feature importance

Random Forest importance = mean decrease in impurity across all trees, averaged and normalised to sum to 1.

```
Vote Count (log)       0.284   ← audience engagement signal
IMDb Rating            0.223   ← quality signal
Network: Streaming     0.112   ← platform effect
Release Year           0.091   ← temporal trend
Seasons                0.073   ← longevity/establishment
Genre: Drama           0.052
Genre: Sci-Fi          0.041
…
```

`log_votes` being the top feature is expected: popular shows attract more votes, creating a feedback loop. Its importance slightly exceeds IMDb rating, suggesting that social proof is marginally more predictive than quality alone.

---

## 6. Frontend Architecture

### Data flow

```
Python Pipeline (run_all.py)
    │
    └── outputs/*.json
            │
            └── Copied to frontend/src/data/*.json
                        │
                        └── Imported statically by React components
                                (bundled at build time — no API calls needed)
```

This design means the dashboard is fully static: no backend server required to demo it. Running `npm run build` produces a self-contained `dist/` folder deployable anywhere.

### Component hierarchy

```
App.tsx
├── Navbar.tsx             (sticky, glassmorphism, route-aware active state)
├── /  → Home.tsx          (Framer Motion scroll-triggered animations)
└── /dashboard → Dashboard.tsx
        ├── StatsCard.tsx × 4       (KPI row)
        ├── ClusteringChart.tsx     (Recharts ScatterChart — 5 Scatter series)
        ├── GenreChart.tsx          (PieChart + AreaChart + custom bar grid)
        ├── AssociationRulesTable.tsx  (HTML table + inline SVG-free progress bars)
        ├── RegressionChart.tsx     (BarChart horizontal + ScatterChart)
        └── ShowExplorer.tsx        (controlled search/filter + pagination)
```

### Styling system

Tailwind is extended with a custom brand token set in `tailwind.config.js`:

```js
colors: {
  brand:   { 400: '#a78bfa', 600: '#7c3aed', ... }   // purple
  surface: { 900: '#0d0b14', 700: '#1a1630', ... }   // dark navy
  gold:    { 400: '#fbbf24', 500: '#f59e0b', ... }   // amber
}
boxShadow: {
  'glow-sm': '0 0 12px rgba(124,58,237,0.35)',
  'glow-md': '0 0 24px rgba(124,58,237,0.4)',
}
```

Component-level utilities are abstracted into `@layer components` in `index.css`:
- `.card` — base card (dark surface + border)
- `.card-glow` — card with purple glow on hover
- `.btn-primary` / `.btn-ghost` — button variants
- `.badge` — inline tag chip
- `.gradient-text` — purple-to-gold gradient text clip

### Animation strategy

Framer Motion is used for:
- **Page entry** — `initial="hidden" animate="show"` on the hero section and KPI cards (fade-up stagger)
- **Scroll reveals** — `whileInView={{ opacity:1, y:0 }}` with `viewport={{ once: true }}` on each dashboard section (fires once when the section enters viewport, no re-trigger)
- **Hover micro-interactions** — `hover:-translate-y-1` via Tailwind (no JS needed for these)

### Clustering chart interactivity

Each cluster is rendered as a separate `<Scatter>` series inside a single `<ScatterChart>`. A local `Set<number>` state tracks hidden cluster IDs; toggling a cluster adds/removes it from the set and conditionally renders `null` for that series. This avoids re-filtering the full dataset on every toggle.

---

## 7. Design Decisions & Trade-offs

| Decision | Chosen | Alternative considered | Reason |
|---|---|---|---|
| Synthetic vs real data | Synthetic (seeded) | Real TMDB API | Reproducibility, no API key, controlled distributions |
| k for clustering | 5 | 4 or 6 | Best silhouette + interpretable cluster semantics |
| Regression model | Random Forest | Linear Regression, XGBoost | RF handles non-linearity and feature interactions; interpretable via importance |
| Frontend charts | Recharts | D3.js, Victory | Recharts is React-native, minimal boilerplate, good tooltip API |
| Data bundling | Static JSON imports | REST API | Simpler deployment; no backend server needed for demo |
| Animation library | Framer Motion | CSS animations | `whileInView` scroll triggers not possible in pure CSS |

## Data Pipeline

Run `python run_all.py` to regenerate the full dataset and sync outputs to the frontend.
The pipeline is deterministic — same seed produces identical results.

## Algorithm Parameters

| Algorithm | Key Parameter | Default |
|---|---|---|
| K-Means | N_CLUSTERS | 5 |
| Apriori | MIN_SUPPORT | 0.05 |
| Random Forest | N_ESTIMATORS | 100 |

## Key Findings (updated 2025)

- Streaming platform is the strongest predictor of high popularity
- Vote count (log-transformed) has feature importance of 0.284
- Five behaviorally distinct show clusters identified
