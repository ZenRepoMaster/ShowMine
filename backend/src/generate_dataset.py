"""
Generates a synthetic but realistic TV show dataset (847 shows).
Run directly to produce data/raw/tv_shows.csv.
"""
import numpy as np
import pandas as pd
import os

RNG = np.random.default_rng(42)

GENRES = ["Drama", "Comedy", "Thriller", "Sci-Fi", "Fantasy", "Crime",
          "Action", "Romance", "Horror", "Documentary", "Animation",
          "Mystery", "Reality", "Historical", "Medical", "Legal", "Superhero"]

NETWORKS = {
    "Streaming": ["Netflix", "HBO Max", "Amazon Prime", "Apple TV+", "Disney+", "Hulu", "Peacock"],
    "Broadcast": ["NBC", "CBS", "ABC", "Fox", "The CW"],
    "Cable":     ["AMC", "FX", "Showtime", "HBO", "USA", "TNT", "Bravo", "MTV", "Syfy"],
    "Int'l":     ["BBC", "BBC Two", "Channel 4", "Sky Atlantic", "ARD"],
}

ALL_NETWORKS = [n for nets in NETWORKS.values() for n in nets]

STATUSES = ["Ended", "Ongoing", "Cancelled", "Limited Series"]

SHOW_NAMES = [
    "The Last Signal", "Crimson Protocol", "Dark Matter Rising", "Iron Shore", "The Void Protocol",
    "Shadow Protocol", "Neon District", "The Override", "Quantum Breach", "Starfall Chronicles",
    "The Heist Masters", "Zero Day", "Apex Predator", "Parallel Lives", "Storm Code",
    "The Operative", "Signal Break", "Dark Frequency", "Cascade Theory", "Night Protocol",
    "The Alliance Pact", "Force Vector", "Echo State", "Prime Suspect", "The Reckoning Day",
    "Iron Circuit", "Dark Horizon", "Cipher Game", "The Collapse", "Override Protocol",
    "Static Signal", "Threshold Line", "The Last Hour", "Cold Start", "Dead Signal",
    "Glass House", "Layer Zero", "Blacksite", "Terminal Code", "The Network",
    "Wrong Floor", "The Good Side", "Family Business", "Neighborly", "Weekend Warriors",
    "Fresh Grounds", "Totally Fine", "That's the Deal", "The Morning Shift", "Oops Again",
    "The Precinct", "Dark Blue Line", "Case 47", "The Detective Files", "Underground City",
    "Clean Hands", "Crime Scene Alpha", "The Verdict", "Shadow Badge", "Iron Fist Law",
    "The Realm Chronicles", "Dragon Court", "Mystic Vale", "Crystal Crown", "Blood Oath",
    "Elemental Wars", "The Ancient Ones", "Shadow Kingdom", "The Covenant", "Arcane Trails",
    "The Haunting Hours", "Dark Corners", "Whisper Woods", "Night Terrors", "The Curse Lingers",
    "Pale Light", "The Presence", "Shadows Rising", "The Forsaken", "Dark Rite",
    "Outer Reach", "The Fold", "Binary Stars", "Eclipse Station", "Nexus Point",
    "Signal Lost", "Quantum Edge", "Starfall Base", "Dark Transit", "The Expanse Code",
    "Second Chances", "Love Protocol", "The Match Made", "Heart Rate", "Closer Than Close",
    "The Proposal Room", "All In Love", "Sweet Nothings", "Summer Bloom", "First Dates",
    "Strike Force Alpha", "The Mercenary Files", "Code Red Alert", "Iron Guard", "Frontline Unit",
    "Special Ops Team", "Thunder Unit", "Rapid Response", "The Agency Files", "Code Black",
    "Grey Matter", "Code Blue ICU", "The Ward Rounds", "Vital Signs Monitor", "The Surgeon",
    "Critical Care Unit", "Night Shift MD", "The Diagnosis", "Emergency Room", "ER Nights",
    "The Defense Rests", "Case Closed Files", "Opening Arguments", "Legal Eagle", "The Jury",
    "Beyond Doubt", "Sidebar Stories", "Objection Sustained", "In Session Now", "The Brief",
    "Empire's Edge", "The Kingdom Falls", "Ancient Wars", "Blood and Throne", "The Conquerors",
    "Fall of Rome", "The Explorers", "War and Valor", "Golden Age", "The Viking Code",
    "Robot Planet", "Adventure Squad", "Cosmic Kids", "Future World Series", "Pixel Heroes",
    "Monster Academy", "Space Racers", "The Legend of Kael", "Tiny Titans", "Star Paws",
    "The Truth Project", "Behind the Curtain", "Deep Dive Series", "Untold Stories", "Hidden Lives",
    "Nature's Way", "Our Planet Now", "The Last Wild", "Ocean Depths", "Above the Clouds",
    "The Challenge", "Survival Island", "Dream House", "Love Island Reloaded", "Top Chef Wars",
    "Last One Standing", "The Search for Stars", "Who Wants It More", "Extreme Makeover", "The Race",
    "The Shield Bearer", "Dark Force Rising", "Power Squad", "The Masked City", "Vigilante Watch",
    "Super Nova", "Force Field", "The Defenders Pact", "Power Grid", "The Alliance",
    "The Unsolved Files", "Cold Trail", "Murder in the Dark", "Hidden Truth", "Dead Ends",
    "Missing Persons", "The Secret Room", "Whodunit Week", "Mystery Hour", "The Puzzle Box",
    "The Senate Floor", "Power Play", "Dark Corridors", "The Insider Track", "Classified Files",
    "State Secrets", "The Campaign Trail", "Power Broker", "The Ambassador Files", "West Block",
    "Northern Lights", "The Gulf", "City on the Edge", "Small Town Big Lies", "Midnight in Oslo",
    "Red River", "Blue Mountain", "The Valley", "Desert Sun", "Island Life",
    "The Family Secret", "Blood Lines", "Deep Roots", "Distant Shores", "The Long Game",
    "Rising Stars", "Fallen Angels", "The Last Dance", "New Horizons", "Full Circle",
    "Broken Wings", "Ghost Protocol", "The Setup", "Into the Deep", "Razor's Edge",
    "Sleeper Cell", "The Pursuit", "Red Line Run", "Cold Case Revived", "Dark Passage",
    "The Interior", "Silent Watch", "The Wire 2.0", "Urban Legend", "Back Alley",
    "The Lab Series", "Silicon Dreams", "Code and Chaos", "Startup Culture", "The Algorithm",
    "Data Breach", "The Developer", "Hack the System", "Digital Ghost", "The Protocol",
    "Season of Rain", "A Perfect Life", "The Other Side", "Between the Lines", "Lost in Transit",
    "The Comeback", "Second Wind", "Rock Bottom", "Starting Over", "The New Chapter",
    "Midnight Run", "After Dark", "Night Owls", "The Late Shift", "Prime Time",
    "The Outsider", "Off Grid", "Back to Basics", "Simple Life", "The Minimalist",
    "Royal Secrets", "Palace Intrigue", "The Coronation", "Crown Affairs", "Noble Blood",
    "The Inheritance", "Old Money", "Silver Spoon", "The Estate", "Manor House",
    "Street Level", "The Block", "Neighborhood Watch", "Community First", "The Commons",
    "Sports Night", "Game Day", "The Championship", "Final Round", "Overtime",
    "The Coach", "Bench Warmers", "Starting Lineup", "The Draft", "Training Camp",
    "The Chef's Table", "Kitchen Wars", "Recipe for Disaster", "Food Court", "Dining Out",
    "The Road Trip", "Cross Country", "Mile Marker", "The Journey", "Wanderlust",
    "Art House", "The Studio", "Creative Block", "The Muse", "Blank Canvas",
    "The Professor", "Academic Fraud", "Campus Life", "Lecture Hall", "The Thesis",
    "Wild Hearts", "Animal Kingdom", "Nature's Edge", "The Sanctuary", "Paw Patrol Plus",
    "The Museum", "Artifact", "The Curator", "Lost Relics", "Ancient Find",
    "Space Oddity", "The Astronaut", "Mission Control", "Launch Sequence", "Orbit",
    "Deep Blue Sea", "The Diver", "Underwater World", "Ocean Quest", "Tide Watch",
    "The Firefighter", "Engine 9", "First Responders", "Rescue Unit", "The Blaze",
    "Crime Lab", "Forensics First", "Evidence Room", "The Analyst", "Trace",
    "The Pilot Season", "Gate 9", "Altitude", "The Runway", "Final Approach",
    "Desert Rose", "The Oasis", "Sand and Stone", "Mirage", "Dust Storm",
    "The Garden", "Grow Up", "Roots and Wings", "Bloom", "Seeds of Change",
]

LANGUAGES = (["English"] * 12 + ["Korean"] * 2 + ["Spanish"] * 2 +
             ["Japanese"] + ["French"] + ["German"] + ["Turkish"])

COUNTRIES = (["USA"] * 10 + ["UK"] * 3 + ["South Korea"] * 2 + ["Spain"] +
             ["Canada"] + ["Japan"] + ["Germany"] + ["Australia"])


def pick_popularity_for_genre(genre: str) -> tuple[float, float]:
    """Returns (mean, std) for popularity score given genre."""
    high   = ("Drama", "Thriller", "Crime", "Sci-Fi", "Superhero")
    medium = ("Comedy", "Fantasy", "Action", "Mystery", "Horror")
    low    = ("Documentary", "Historical", "Animation", "Legal", "Medical", "Romance", "Reality")
    if genre in high:
        return 68.0, 18.0
    if genre in medium:
        return 52.0, 20.0
    return 36.0, 18.0


def generate():
    n = 847
    names = RNG.choice(SHOW_NAMES, size=n, replace=True)
    # Make names unique by appending season suffix where needed
    seen: dict[str, int] = {}
    unique_names = []
    for name in names:
        if name in seen:
            seen[name] += 1
            unique_names.append(f"{name}: Season {seen[name]}")
        else:
            seen[name] = 1
            unique_names.append(name)

    primary_genre   = RNG.choice(GENRES, size=n)
    secondary_genre = RNG.choice(GENRES + [None] * 8, size=n)  # type: ignore

    network  = RNG.choice(ALL_NETWORKS, size=n)
    year     = RNG.integers(2000, 2025, size=n)
    seasons  = np.clip(RNG.integers(1, 15, size=n), 1, 14)
    eps_per  = np.clip(RNG.integers(4, 28, size=n), 4, 26)
    runtime  = RNG.choice([22, 30, 44, 50, 60], size=n,
                          p=[0.20, 0.15, 0.35, 0.15, 0.15])
    status   = RNG.choice(STATUSES, size=n,
                          p=[0.45, 0.30, 0.15, 0.10])
    language = RNG.choice(LANGUAGES, size=n)
    country  = RNG.choice(COUNTRIES, size=n)
    cast_size = np.clip(RNG.integers(4, 20, size=n), 4, 18)

    imdb_rating = np.clip(RNG.normal(7.0, 1.1, size=n), 1.0, 10.0)

    popularity = np.zeros(n)
    for i in range(n):
        mu, sigma = pick_popularity_for_genre(primary_genre[i])
        popularity[i] = np.clip(RNG.normal(mu, sigma), 1.0, 100.0)

    # Add network boost
    streaming = {"Netflix", "HBO Max", "Amazon Prime", "Apple TV+", "Disney+", "Hulu"}
    for i in range(n):
        if network[i] in streaming:
            popularity[i] = np.clip(popularity[i] + RNG.normal(8, 4), 1, 100)

    # Correlation boost: high rating → higher popularity
    popularity = np.clip(popularity + (imdb_rating - 6.5) * 3 + RNG.normal(0, 2, n), 1, 100)

    vote_count = (popularity / 10 * RNG.normal(120_000, 50_000, n)).astype(int)
    vote_count = np.clip(vote_count, 500, 2_500_000)

    df = pd.DataFrame({
        "id":               range(1, n + 1),
        "name":             unique_names,
        "primary_genre":    primary_genre,
        "secondary_genre":  [g if g else "" for g in secondary_genre],
        "network":          network,
        "year":             year,
        "seasons":          seasons,
        "episodes_per_season": eps_per,
        "total_episodes":   seasons * eps_per,
        "avg_runtime_min":  runtime,
        "imdb_rating":      imdb_rating.round(1),
        "popularity_score": popularity.round(1),
        "vote_count":       vote_count,
        "status":           status,
        "language":         language,
        "country":          country,
        "cast_size":        cast_size,
    })

    os.makedirs("data/raw", exist_ok=True)
    df.to_csv("data/raw/tv_shows.csv", index=False)
    print(f"[generate] Wrote {n} shows → data/raw/tv_shows.csv")
    return df


if __name__ == "__main__":
    generate()

# Dataset configuration
DATASET_SIZE = 847
RANDOM_SEED  = 42
TRAIN_SPLIT  = 0.8

# Supported genres and networks for synthetic generation
GENRE_COUNT   = 17
NETWORK_COUNT = 21
