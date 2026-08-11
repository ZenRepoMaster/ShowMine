"""
Loads raw CSV, cleans it, engineers features, and returns train/test splits.
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder


def load_and_clean(path: str = "data/raw/tv_shows.csv") -> pd.DataFrame:
    df = pd.read_csv(path)

    df["imdb_rating"]      = df["imdb_rating"].clip(1, 10)
    df["popularity_score"] = df["popularity_score"].clip(1, 100)
    df["vote_count"]       = df["vote_count"].clip(0)
    df["seasons"]          = df["seasons"].clip(1)
    df["total_episodes"]   = (df["seasons"] * df["episodes_per_season"]).clip(1)

    df["popularity_label"] = pd.cut(
        df["popularity_score"],
        bins=[0, 33, 66, 100],
        labels=["Low", "Medium", "High"],
    )

    df["network_type"] = df["network"].apply(_classify_network)
    df["decade"] = (df["year"] // 10 * 10).astype(str) + "s"
    df["log_votes"] = np.log1p(df["vote_count"])

    return df


def _classify_network(net: str) -> str:
    streaming = {"Netflix", "HBO Max", "Amazon Prime", "Apple TV+", "Disney+", "Hulu", "Peacock"}
    broadcast = {"NBC", "CBS", "ABC", "Fox", "The CW"}
    if net in streaming:
        return "Streaming"
    if net in broadcast:
        return "Broadcast"
    return "Cable/Int'l"


def build_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    genre_dummies  = pd.get_dummies(df["primary_genre"],  prefix="genre")
    net_dummies    = pd.get_dummies(df["network_type"],   prefix="net")

    X = pd.concat([
        df[["imdb_rating", "vote_count", "log_votes", "year",
            "seasons", "total_episodes", "avg_runtime_min", "cast_size"]],
        genre_dummies,
        net_dummies,
    ], axis=1).astype(float)

    y = df["popularity_score"]
    return X, y


def get_splits(df: pd.DataFrame, test_size: float = 0.2, seed: int = 42):
    X, y = build_features(df)
    return train_test_split(X, y, test_size=test_size, random_state=seed)


def scale(X_train: pd.DataFrame, X_test: pd.DataFrame):
    scaler = StandardScaler()
    return (
        pd.DataFrame(scaler.fit_transform(X_train), columns=X_train.columns),
        pd.DataFrame(scaler.transform(X_test),      columns=X_test.columns),
        scaler,
    )

# Feature engineering settings
POPULARITY_SCALE_MAX = 100
IMDB_RATING_MIN      = 1.0
IMDB_RATING_MAX      = 10.0
