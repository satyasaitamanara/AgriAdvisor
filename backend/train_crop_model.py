# train_crop_model_research.py - Updated version

import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.utils.class_weight import compute_class_weight
import joblib
import os

# Config
CSV_PATH = "data/crop_data.csv"
OUT_DIR = "ml_models"
OUT_PIPE = os.path.join(OUT_DIR, "crop_model_research.joblib")
RANDOM_STATE = 42

os.makedirs(OUT_DIR, exist_ok=True)

# 1. Load dataset
df = pd.read_csv(CSV_PATH)

features = ["N","P","K","temperature","humidity","ph","rainfall"]
df = df.dropna(subset=features + ["label"])

for col in features:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df = df.dropna(subset=features)

X = df[features].values
y = df["label"].values

# 2. Encode labels
le = LabelEncoder()
y_enc = le.fit_transform(y)

print(f"📊 Dataset shape: {X.shape}")
print(f"🌱 Number of classes: {len(le.classes_)}")
print(f"🌾 Classes: {le.classes_}")

# 3. Handle Class Imbalance
classes = np.unique(y_enc)
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=classes,
    y=y_enc
)
class_weight_dict = dict(zip(classes, class_weights))

# 4. Base Random Forest (robust settings)
rf = RandomForestClassifier(
    n_estimators=400,
    max_depth=25,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight=class_weight_dict,
    random_state=RANDOM_STATE,
    n_jobs=-1
)

# 5. Create pipeline (no scaler needed for tree-based models)
pipeline = Pipeline([
    ("clf", rf)
])

# 6. Cross-validation
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
cv_scores = cross_val_score(pipeline, X, y_enc, cv=skf, scoring="accuracy")

print("Cross-Validation Accuracy Scores:", cv_scores)
print("Mean CV Accuracy:", np.mean(cv_scores))

# 7. Train final model
pipeline.fit(X, y_enc)

# 8. Calibrate probabilities for better uncertainty estimates
calibrated_rf = CalibratedClassifierCV(rf, method='sigmoid', cv=3)
calibrated_rf.fit(X, y_enc)

# 9. Save everything needed by the API
obj = {
    "pipeline": pipeline,                    # Original pipeline with RandomForest
    "calibrated_model": calibrated_rf,       # Calibrated version for better probabilities
    "base_model": rf,                         # Base RandomForest
    "label_encoder": le,
    "features": features
}

joblib.dump(obj, OUT_PIPE)
print(f"✅ Model saved to: {OUT_PIPE}")
print(f"📊 Features: {features}")
print(f"🌱 Crops: {le.classes_}")