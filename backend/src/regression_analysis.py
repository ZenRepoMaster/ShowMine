"""
Random Forest regression to predict TV show popularity score.
Outputs metrics, feature importance, and sample predictions as JSON.
"""
import json, os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.model_selection import cross_val_score, learning_curve

from data_pipeline import build_features, get_splits


def run(df: pd.DataFrame, seed: int = 42) -> dict:
    X, y = build_features(df)
    X_train, X_test, y_train, y_test = get_splits(df, seed=seed)

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=4,
        random_state=seed,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    r2   = round(float(r2_score(y_test, y_pred)), 4)
    rmse = round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 4)
    mae  = round(float(mean_absolute_error(y_test, y_pred)), 4)

    cv_scores = cross_val_score(model, X_train, y_train, cv=5,
                                scoring="r2", n_jobs=-1)

    # Feature importance (top 15)
    importance = pd.Series(model.feature_importances_, index=X_train.columns)
    top15 = importance.nlargest(15)
    feature_importance = [
        {"feature": _clean_name(k), "importance": round(float(v), 4)}
        for k, v in top15.items()
    ]

    # Sample predictions (100 test points)
    idx = np.random.default_rng(seed).integers(0, len(y_test), size=min(100, len(y_test)))
    predictions = [
        {"actual": round(float(a), 1), "predicted": round(float(p), 1)}
        for a, p in zip(y_test.iloc[idx].values, y_pred[idx])
    ]

    # Year trend from full dataset
    year_trend = (
        df.groupby("year")["popularity_score"]
          .mean()
          .round(2)
          .reset_index()
          .rename(columns={"year": "year", "popularity_score": "avg_popularity"})
    )
    year_trend_list = year_trend.to_dict(orient="records")

    result = {
        "algorithm": "Random Forest Regressor",
        "hyperparameters": {
            "n_estimators": 200,
            "max_depth":    12,
            "min_samples_leaf": 4,
        },
        "metrics": {
            "r2":   r2,
            "rmse": rmse,
            "mae":  mae,
            "cv_r2_mean": round(float(cv_scores.mean()), 4),
            "cv_r2_std":  round(float(cv_scores.std()),  4),
        },
        "feature_importance": feature_importance,
        "predictions":        predictions,
        "year_trend":         year_trend_list,
    }

    os.makedirs("outputs", exist_ok=True)
    with open("outputs/regression_results.json", "w") as f:
        json.dump(result, f, indent=2)
    print(f"[regression] R²={r2}, RMSE={rmse}, MAE={mae} → outputs/regression_results.json")
    return result


def _clean_name(col: str) -> str:
    return col.replace("genre_", "Genre: ").replace("net_", "Network: ")

# Random Forest regression settings
N_ESTIMATORS   = 100
CV_FOLDS       = 5
MAX_FEATURES   = "sqrt"
RF_SEED        = 42

# Regression evaluation thresholds
R2_TARGET   = 0.85
RMSE_BUDGET = 10.0
