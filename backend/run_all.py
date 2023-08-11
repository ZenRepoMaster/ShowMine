"""
Master pipeline: generate data → clean → cluster → mine rules → regress → export JSON.
Run from the backend/ directory: python run_all.py
"""
import sys, json, os
sys.path.insert(0, "src")

from src.generate_dataset     import generate
from src.data_pipeline        import load_and_clean, build_features
from src.clustering_analysis  import run as run_clustering
from src.association_rules_analysis import run as run_association_rules
from src.regression_analysis  import run as run_regression

FRONTEND_DATA = "../frontend/src/data"


def export_overview(df):
    import numpy as np

    genre_dist = (
        df["primary_genre"].value_counts()
          .reset_index()
          .rename(columns={"primary_genre": "genre", "count": "count"})
          .to_dict(orient="records")
    )

    net_dist = (
        df["network"].value_counts()
          .head(15)
          .reset_index()
          .rename(columns={"network": "network", "count": "count"})
          .to_dict(orient="records")
    )

    year_trend = (
        df.groupby("year")
          .agg(count=("id","count"), avg_rating=("imdb_rating","mean"), avg_popularity=("popularity_score","mean"))
          .reset_index()
          .round(2)
          .to_dict(orient="records")
    )

    rating_dist = []
    for bin_start in np.arange(1, 10, 0.5):
        count = int(((df["imdb_rating"] >= bin_start) & (df["imdb_rating"] < bin_start + 0.5)).sum())
        rating_dist.append({"rating": round(float(bin_start), 1), "count": count})

    top_shows = (
        df.nlargest(10, "popularity_score")
          [["name","primary_genre","network","year","imdb_rating","popularity_score","vote_count"]]
          .rename(columns={"primary_genre":"genre","imdb_rating":"rating","popularity_score":"popularity"})
          .to_dict(orient="records")
    )

    stats = {
        "total_shows":       int(len(df)),
        "avg_rating":        round(float(df["imdb_rating"].mean()), 2),
        "avg_popularity":    round(float(df["popularity_score"].mean()), 2),
        "total_genres":      int(df["primary_genre"].nunique()),
        "total_networks":    int(df["network"].nunique()),
        "year_range":        [int(df["year"].min()), int(df["year"].max())],
        "total_episodes":    int(df["total_episodes"].sum()),
        "genre_distribution": genre_dist,
        "network_distribution": net_dist,
        "year_trend":        year_trend,
        "rating_distribution": rating_dist,
        "top_shows":         top_shows,
    }

    os.makedirs("outputs", exist_ok=True)
    with open("outputs/overview_stats.json", "w") as f:
        json.dump(stats, f, indent=2)
    print(f"[overview]   total={len(df)}, avg_rating={stats['avg_rating']} → outputs/overview_stats.json")
    return stats


def export_shows_sample(df):
    sample = df.sample(min(150, len(df)), random_state=42)
    records = sample[[
        "id","name","primary_genre","network","year","seasons",
        "total_episodes","imdb_rating","popularity_score","vote_count","status",
    ]].rename(columns={"primary_genre":"genre","imdb_rating":"rating","popularity_score":"popularity"}).to_dict(orient="records")

    os.makedirs("outputs", exist_ok=True)
    with open("outputs/shows_sample.json", "w") as f:
        json.dump(records, f, indent=2)
    print(f"[shows]      {len(records)} sample rows → outputs/shows_sample.json")
    return records


def copy_to_frontend():
    import shutil
    os.makedirs(FRONTEND_DATA, exist_ok=True)
    for fname in ["overview_stats.json", "clustering_results.json",
                  "association_rules.json", "regression_results.json",
                  "shows_sample.json"]:
        src  = f"outputs/{fname}"
        dest = f"{FRONTEND_DATA}/{fname}"
        if os.path.exists(src):
            shutil.copy(src, dest)
            print(f"[copy]       {src} → {dest}")


if __name__ == "__main__":
    print("=" * 60)
    print("  ShowMine — Data Mining Pipeline")
    print("=" * 60)

    print("\n[1/5] Generating dataset …")
    generate()

    print("\n[2/5] Cleaning & feature engineering …")
    df = load_and_clean("data/raw/tv_shows.csv")

    print("\n[3/5] Exporting overview stats …")
    export_overview(df)
    export_shows_sample(df)

    print("\n[4/5] Running clustering …")
    run_clustering(df)

    print("\n[5/5] Running association rules …")
    run_association_rules(df)

    print("\n[6/6] Running regression …")
    run_regression(df)

    print("\n[sync] Copying outputs to frontend …")
    copy_to_frontend()

    print("\n✓  Pipeline complete. Outputs in backend/outputs/ and frontend/src/data/")
