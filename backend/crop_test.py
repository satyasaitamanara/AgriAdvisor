import joblib

# Load the saved object
model_path = r"C:\Users\sai\Documents\Custom Office Templates\DEEPSEAK\backend\ml_models\crop_model.joblib"
saved_data = joblib.load(model_path)

# Extract pipeline and label encoder
pipeline = saved_data["pipeline"]
le = saved_data["label_encoder"]
features = saved_data["features"]

print("Model loaded with features:", features)

# Example input data (N, P, K, temperature, humidity, pH, rainfall)
# ⚠️ Order must match 'features'
test_input = [[80, 310, 40, 25, 160, 6.8, 350]]

# Predict class index
pred_index = pipeline.predict(test_input)[0]

# Convert index back to crop name
pred_crop = le.inverse_transform([pred_index])[0]

print("Recommended Crop:", pred_crop)
