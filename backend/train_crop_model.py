# train_crop_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Config
CSV_PATH = "data/crop_data.csv"        # path to your CSV
OUT_DIR = "ml_models"
OUT_PIPE = os.path.join(OUT_DIR, "crop_model_pipeline.joblib")
RANDOM_STATE = 42

os.makedirs(OUT_DIR, exist_ok=True)

# 1. Load dataset
df = pd.read_csv(CSV_PATH)
# Expected columns: N,P,K,temperature,humidity,ph,rainfall,label
print("Rows:", len(df), "Columns:", df.columns.tolist())

# 2. Basic cleaning
# Drop any rows with essential missing values (or you can impute)
features = ["N","P","K","temperature","humidity","ph","rainfall"]
df = df.dropna(subset=features + ["label"])

# option: simple outlier clamp (optional)
for col in ["N","P","K","temperature","humidity","ph","rainfall"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")
df = df.dropna(subset=features)  # ensure numeric

X = df[features].values
y = df["label"].values

# 3. Encode labels
le = LabelEncoder()
y_enc = le.fit_transform(y)

# 4. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=RANDOM_STATE, stratify=y_enc
)

# 5. Build pipeline (scaler + classifier)
pipeline = Pipeline(
    [
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1)),
    ]
)

# 6. Train
pipeline.fit(X_train, y_train)

# 7. Evaluate
y_pred = pipeline.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print("Test accuracy:", acc)
print(classification_report(y_test, y_pred, target_names=le.classes_))

# 8. Save pipeline + label encoder inside dict
obj = {
    "pipeline": pipeline,
    "label_encoder": le,
    "features": features
}
joblib.dump(obj, OUT_PIPE)
print("Saved model pipeline to:", OUT_PIPE)
