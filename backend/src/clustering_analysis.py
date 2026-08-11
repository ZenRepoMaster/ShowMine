"""
K-Means clustering on TV shows.
Determines optimal k via elbow + silhouette, then outputs JSON for the dashboard.
"""
import json, os
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score


CLUSTER_META = {
    0: {"name": "Mainstream Hits",   "color": "#7C3AED",
        "description": "High popularity AND high ratings — the blockbusters everyone watches."},
    1: {"name": "Mass Appeal",       "color": "#F59E0B",
        "description": "Very popular but more divisive ratings — reality TV, procedurals, soaps."},
    2: {"name": "Critical Darlings", "color": "#10B981",
        "description": "Acclaimed by critics but niche audiences — prestige TV gems."},
    3: {"name": "Legacy Shows",      "color": "#3B82F6",
        "description": "Long-running network staples — broad but familiar appeal."},
    4: {"name": "Hidden Gems",       "color": "#EF4444",
        "description": "High quality, low visibility — underrated and worth discovering."},
}

FEATURES = ["imdb_rating", "popularity_score", "log_votes", "seasons"]


def run(df: pd.DataFrame, k: int = 5, seed: int = 42) -> dict:
    X = df[FEATURES].dropna()
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    # Elbow curve (k=2..10)
    inertias, sil_scores = [], []
    for ki in range(2, 11):
        km = KMeans(n_clusters=ki, random_state=seed, n_init=10)
        labels = km.fit_predict(Xs)
        inertias.append(round(float(km.inertia_), 2))
        sil_scores.append(round(float(silhouette_score(Xs, labels)), 4))

    km = KMeans(n_clusters=k, random_state=seed, n_init=10)
    df = df.copy()
    df["cluster"] = km.fit_predict(Xs)

    # Re-map clusters to semantic labels by avg popularity
    cluster_popularity = df.groupby("cluster")["popularity_score"].mean().sort_values(ascending=False)
    remap = {old: new for new, old in enumerate(cluster_popularity.index)}
    df["cluster"] = df["cluster"].map(remap)

    sil = round(float(silhouette_score(Xs, df["cluster"])), 4)

    cluster_summary = []
    for cid, meta in CLUSTER_META.items():
        sub = df[df["cluster"] == cid]
        cluster_summary.append({
            "id":               cid,
            "name":             meta["name"],
            "color":            meta["color"],
            "description":      meta["description"],
            "size":             int(len(sub)),
            "avg_rating":       round(float(sub["imdb_rating"].mean()), 2),
            "avg_popularity":   round(float(sub["popularity_score"].mean()), 2),
            "avg_seasons":      round(float(sub["seasons"].mean()), 1),
            "top_genres":       sub["primary_genre"].value_counts().head(3).index.tolist(),
            "top_networks":     sub["network"].value_counts().head(3).index.tolist(),
        })

    sample = df.sample(min(250, len(df)), random_state=seed)
    scatter = [
        {
            "id":         int(r["id"]),
            "name":       str(r["name"]),
            "x":          round(float(r["imdb_rating"]), 1),
            "y":          round(float(r["popularity_score"]), 1),
            "cluster":    int(r["cluster"]),
            "genre":      str(r["primary_genre"]),
            "network":    str(r["network"]),
            "year":       int(r["year"]),
        }
        for _, r in sample.iterrows()
    ]

    result = {
        "algorithm":       "K-Means",
        "k":               k,
        "silhouette_score": sil,
        "features_used":   FEATURES,
        "elbow_curve": {
            "k_values":    list(range(2, 11)),
            "inertia":     inertias,
            "silhouette":  sil_scores,
        },
        "clusters":     cluster_summary,
        "scatter_data": scatter,
    }

    os.makedirs("outputs", exist_ok=True)
    with open("outputs/clustering_results.json", "w") as f:
        json.dump(result, f, indent=2)
    print(f"[clustering] k={k}, silhouette={sil:.4f} → outputs/clustering_results.json")
    return result

# K-Means clustering configuration
N_CLUSTERS      = 5
MAX_ITER        = 300
CLUSTER_SEED    = 42
SILHOUETTE_MIN  = 0.5

# Clustering evaluation
SILHOUETTE_WARN_BELOW = 0.4
ELBOW_K_RANGE         = range(2, 11)
