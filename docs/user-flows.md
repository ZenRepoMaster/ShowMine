# User Flows — ShowMine Dashboard

This document describes the key journeys a user takes through the ShowMine application, from first landing to deep analytical exploration.

---

## Flow 1: First Visit — Understanding the Project

**Entry point:** `/` (Home page)

**Goal:** A new visitor (classmate, lecturer, recruiter) understands what ShowMine does and why it matters before touching the data.

```
Land on Home (/)
    │
    ├── Read hero headline: "What makes a TV show truly popular?"
    │       ↳ Subtitle explains the three techniques and dataset size
    │
    ├── See animated stats bar
    │       847 shows · 2000–2024 · 17 genres · 21+ networks · 124K episodes · 3 algorithms
    │
    ├── Scroll → Technique cards
    │       ┌─────────────────────────────────────────────────┐
    │       │  K-Means Clustering   k=5 · Silhouette 0.623    │
    │       │  Apriori Rules        47 rules · min_sup=0.05   │
    │       │  Random Forest        R²=0.871 · 5-fold CV      │
    │       └─────────────────────────────────────────────────┘
    │
    ├── Scroll → Dataset section
    │       Shows stack badges (pandas, sklearn, mlxtend, React …)
    │       6 feature highlight cards
    │
    └── Click "Explore Dashboard" → navigate to /dashboard
```

**Exit:** User arrives at Dashboard with context already set.

---

## Flow 2: Analyst — Exploring Clusters

**Entry point:** `/dashboard` → Cluster Analysis section

**Goal:** Understand how shows group by quality and popularity, and which cluster a specific show falls into.

```
Dashboard loads
    │
    ├── KPI cards give instant context
    │       847 shows · avg 7.18 IMDb · avg 52.4 popularity · 124K episodes
    │
    └── Scroll to "Cluster Analysis"
            │
            ├── Read: K-Means · k=5 · Silhouette: 0.6231
            │
            ├── See 5 toggle buttons (one per cluster with count)
            │       ● Mainstream Hits (162)   ● Mass Appeal (198)
            │       ● Critical Darlings (142) ● Legacy Shows (234)
            │       ● Hidden Gems (111)
            │
            ├── Interact: Click a cluster button to HIDE it
            │       → Scatter plot updates live; remaining clusters clearer
            │
            ├── Hover a scatter point → tooltip
            │       Show name · Genre · Network · Year
            │       IMDb: 9.2 · Popularity: 98.4 · Cluster: Mainstream Hits
            │
            └── Read cluster summary cards below the chart
                    Each shows: avg rating, avg popularity, top genres, top networks
```

**Key question answered:** *"Are there really different 'types' of popular shows, or is it a single spectrum?"*
**Answer:** Five statistically distinct clusters exist (silhouette > 0.6 indicates good separation).

---

## Flow 3: Researcher — Reading Association Rules

**Entry point:** `/dashboard` → Association Rules section

**Goal:** Discover which genre-network-popularity combinations are non-obvious and strongly predictive.

```
Scroll to "Association Rule Mining"
    │
    ├── Note algorithm metadata: Apriori · 47 rules · min_sup=0.05 · min_conf=0.55
    │
    ├── Scan the default view (sorted by lift descending)
    │       Row 1: Drama + Streaming → High    conf=0.781  lift=2.344×  [gold badge]
    │       Row 2: Sci-Fi + Netflix  → High    conf=0.752  lift=2.257×  [gold badge]
    │       …
    │
    ├── Click "Confidence" column header → sort by confidence ascending/descending
    │
    ├── Click "Support" column header → sort by support (frequency)
    │       ↳ Reveals which rules are common vs. rare-but-strong
    │
    ├── Click "Show all 47 rules" button
    │       → Expands to full rule list
    │
    └── Read color-coded tags per row
            Purple = Genre   Blue = Network/Type   Gold = Popularity level
```

**Key question answered:** *"What combinations of features reliably predict popularity?"*
**Insight:** Drama+Streaming is the highest-lift pairing. Reality+Broadcast also shows strong rules, but with lower confidence — more variance in outcome.

---

## Flow 4: Data Scientist — Evaluating the Regression Model

**Entry point:** `/dashboard` → Popularity Regression section

**Goal:** Assess whether the Random Forest model is trustworthy and understand which features drive predictions.

```
Scroll to "Popularity Regression"
    │
    ├── Read 4 metric cards
    │       R² = 0.8712        → model explains 87% of variance
    │       RMSE = 8.24        → average error ≈ 8 points on 0–100 scale
    │       MAE = 6.11         → median absolute error
    │       CV R² = 0.8634 ±0.0213  → consistent across 5 folds (low std dev)
    │
    ├── Feature Importance chart (left panel)
    │       Horizontal bars, sorted by importance descending
    │       Top features:
    │           Vote Count (log)    0.284  ← dominant
    │           IMDb Rating         0.223
    │           Network: Streaming  0.112
    │           Release Year        0.091
    │           Seasons             0.073
    │       ↳ Hover a bar for exact importance value
    │
    └── Actual vs Predicted scatter (right panel)
            Points clustered tightly along the diagonal reference line
            ↳ Diagonal = perfect prediction
            ↳ Spread around diagonal = residual error
            ↳ No obvious curvature → model is not systematically biased
```

**Key question answered:** *"Can we predict popularity from show metadata alone — and what matters most?"*
**Insight:** Audience engagement (vote count) is almost as predictive as quality (IMDb rating), suggesting popularity is self-reinforcing.

---

## Flow 5: Casual Explorer — Browsing Shows

**Entry point:** `/dashboard` → Show Explorer section

**Goal:** Find specific shows, filter by genre or network, compare stats.

```
Scroll to "Show Explorer"
    │
    ├── Default view: 100 shows sorted by popularity desc, 12 per page
    │
    ├── Type in search box: "Dark"
    │       → Live filter: shows "Dark Horizon", "Dark Frequency", "Dark Corners" …
    │
    ├── Select Genre dropdown: "Sci-Fi"
    │       → Table narrows to Sci-Fi shows only
    │
    ├── Select Network dropdown: "HBO"
    │       → Compound filter: Sci-Fi shows on HBO
    │
    ├── Click "Rating" column header → sort by IMDb rating
    │       → See which Sci-Fi HBO shows are highest rated
    │
    ├── Click "Seasons" column header → sort by seasons
    │       → Identify long-running vs limited series
    │
    └── Navigate pages with Prev / Next
            Footer shows: "N results · page X of Y"
```

**Key question answered:** *"Where does [show] sit in the dataset? How does it compare?"*

---

## Flow 6: Trend Watcher — Reading the Year Trend

**Entry point:** `/dashboard` → Genre & Trend Overview section

**Goal:** Understand how average popularity has changed over time and which genres dominate.

```
Scroll to "Genre & Trend Overview"
    │
    ├── Genre donut chart (left)
    │       Drama leads with 118 shows
    │       Crime, Comedy follow
    │       Hover segments for exact counts
    │
    ├── Popularity Trend area chart (right)
    │       X-axis: 2000–2024
    │       Y-axis: Average popularity score
    │       Rising curve from ~41 (2000) to ~69 (2024)
    │       ↳ Inflection point around 2015 (streaming era begins)
    │       Hover for exact year values
    │
    └── Network bars (bottom row)
            15 networks shown with proportional bars
            Netflix leads (132 shows), HBO second (97), NBC third (84)
```

**Key question answered:** *"Is TV getting more popular over time, and who is driving that?"*

---

## Navigation Map

```
  http://localhost:5173/
  │
  ├── /  (Home)
  │     Hero → Technique Cards → Dataset Info → CTA
  │     Navbar: [Home ✓] [Dashboard]
  │
  └── /dashboard
        Sticky Navbar
        │
        ├── KPI Cards (4)
        ├── Cluster Analysis      ← ClusteringChart.tsx
        ├── Genre & Trend         ← GenreChart.tsx
        ├── Association Rules     ← AssociationRulesTable.tsx
        ├── Popularity Regression ← RegressionChart.tsx
        ├── Top Shows             ← inline in Dashboard.tsx
        ├── Show Explorer         ← ShowExplorer.tsx
        └── Footer
```
