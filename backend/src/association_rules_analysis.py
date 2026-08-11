"""
Apriori-based association rule mining.
Discovers which genre/network/popularity combinations frequently co-occur.
"""
import json, os
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder


def _build_transactions(df: pd.DataFrame) -> list[list[str]]:
    transactions = []
    for _, row in df.iterrows():
        items: list[str] = []

        items.append(f"genre:{row['primary_genre']}")
        if row.get("secondary_genre"):
            items.append(f"genre:{row['secondary_genre']}")

        net_type = row.get("network_type", "Cable/Int'l")
        items.append(f"net:{net_type}")
        items.append(f"network:{row['network']}")

        items.append(f"pop:{row['popularity_label']}")

        items.append(f"decade:{row['decade']}")

        if row["seasons"] >= 5:
            items.append("longevity:Long-Running")
        elif row["seasons"] == 1:
            items.append("longevity:One-Season")

        transactions.append(items)
    return transactions


def run(df: pd.DataFrame,
        min_support: float = 0.05,
        min_confidence: float = 0.55) -> dict:

    transactions = _build_transactions(df)
    te = TransactionEncoder()
    te_arr = te.fit(transactions).transform(transactions)
    basket = pd.DataFrame(te_arr, columns=te.columns_)

    freq_items = apriori(basket, min_support=min_support, use_colnames=True)
    rules = association_rules(freq_items, metric="confidence",
                              min_threshold=min_confidence, num_itemsets=len(freq_items))

    rules = rules.sort_values("lift", ascending=False).head(30)

    rule_list = []
    for _, r in rules.iterrows():
        ant = sorted([str(x) for x in r["antecedents"]])
        con = sorted([str(x) for x in r["consequents"]])
        rule_list.append({
            "antecedent":  ant,
            "consequent":  con,
            "support":     round(float(r["support"]),    4),
            "confidence":  round(float(r["confidence"]), 4),
            "lift":        round(float(r["lift"]),        4),
        })

    # Frequent itemsets summary (top 20 by support)
    top_items = freq_items.nlargest(20, "support")
    itemset_list = [
        {
            "itemset": sorted([str(x) for x in row["itemsets"]]),
            "support": round(float(row["support"]), 4),
        }
        for _, row in top_items.iterrows()
    ]

    result = {
        "algorithm":      "Apriori",
        "min_support":    min_support,
        "min_confidence": min_confidence,
        "total_rules":    len(rules),
        "rules":          rule_list,
        "frequent_itemsets": itemset_list,
    }

    os.makedirs("outputs", exist_ok=True)
    with open("outputs/association_rules.json", "w") as f:
        json.dump(result, f, indent=2)
    print(f"[assoc_rules] {len(rules)} rules → outputs/association_rules.json")
    return result

# Apriori association rule parameters
MIN_SUPPORT    = 0.05
MIN_CONFIDENCE = 0.6
MIN_LIFT       = 1.0
MAX_RULES      = 50
