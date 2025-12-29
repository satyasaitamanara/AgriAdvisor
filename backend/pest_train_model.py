import tensorflow as tf
import numpy as np
from PIL import Image
import os
import matplotlib.pyplot as plt
import random

# Load the trained model
model = tf.keras.models.load_model("plant_disease_model_final.h5")

# Class names (should match your training classes)
CLASS_NAMES = [
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

def predict_image(image_path):
    """
    Predict the plant disease from an image
    """
    # Load and preprocess image
    img = Image.open(image_path).convert("RGB")
    img = img.resize((160, 160))  # Match training size
    
    # Display the image
    plt.figure(figsize=(6, 6))
    plt.imshow(img)
    plt.axis('off')
    
    # Preprocess for model
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Run prediction
    prediction = model.predict(img_array, verbose=0)
    predicted_class = int(np.argmax(prediction, axis=1)[0])
    confidence = float(np.max(prediction))
    
    predicted_label = CLASS_NAMES[predicted_class]
    
    # Get top 3 predictions
    top3_indices = np.argsort(prediction[0])[-3:][::-1]
    top3_predictions = [(CLASS_NAMES[i], prediction[0][i]) for i in top3_indices]
    
    # Display results
    title = f"Predicted: {predicted_label}\nConfidence: {confidence*100:.2f}%"
    plt.title(title, fontsize=12)
    plt.show()
    
    print("Top 3 Predictions:")
    for i, (cls, conf) in enumerate(top3_predictions, 1):
        print(f"{i}. {cls}: {conf*100:.2f}%")
    
    return predicted_label, confidence, top3_predictions

def test_on_multiple_images(image_folder, num_images=5):
    """
    Test the model on multiple random images from a folder
    """
    # Get all image files from the folder
    image_extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
    image_files = []
    
    for file in os.listdir(image_folder):
        if any(file.endswith(ext) for ext in image_extensions):
            image_files.append(os.path.join(image_folder, file))
    
    if not image_files:
        print(f"No images found in {image_folder}")
        return
    
    # Select random images
    selected_images = random.sample(image_files, min(num_images, len(image_files)))
    
    print(f"Testing on {len(selected_images)} images from {image_folder}")
    print("=" * 50)
    
    results = []
    for img_path in selected_images:
        print(f"\nTesting: {os.path.basename(img_path)}")
        try:
            predicted_label, confidence, top3 = predict_image(img_path)
            results.append((img_path, predicted_label, confidence))
        except Exception as e:
            print(f"Error processing {img_path}: {e}")
    
    return results

def test_on_specific_images(image_paths):
    """
    Test the model on specific image paths
    """
    results = []
    for img_path in image_paths:
        if os.path.exists(img_path):
            print(f"\nTesting: {os.path.basename(img_path)}")
            try:
                predicted_label, confidence, top3 = predict_image(img_path)
                results.append((img_path, predicted_label, confidence))
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
        else:
            print(f"Image not found: {img_path}")
    
    return results

# Example usage
if __name__ == "__main__":
    print("Plant Disease Detection Model Testing")
    print("=" * 40)
    
    # Option 1: Test on a folder of images
    # test_folder = r"C:\path\to\your\test\images"
    # results = test_on_multiple_images(test_folder, num_images=5)
    
    # Option 2: Test on specific images
    test_images = [
        r"C:\Users\sai\Documents\Custom Office Templates\DEEPSEAK\backend\images\corn.jpg",
        r"C:\Users\sai\Documents\Custom Office Templates\DEEPSEAK\backend\images\tomato.jpg",
        r"C:\Users\sai\Documents\Custom Office Templates\DEEPSEAK\backend\images\potato.jpg",
           r"C:\Users\sai\Documents\Custom Office Templates\DEEPSEAK\backend\images\tamato1.jpg",
              r"C:\Users\sai\Documents\Custom Office Templates\DEEPSEAK\backend\images\corn1.jpg",
        # Add more specific image paths as needed
    ]
    
    # Replace with actual paths to your test images
    # If you don't have specific images, you can use images from your validation set
    results = test_on_specific_images(test_images)
    
    # Print summary
    if results:
        print("\n" + "=" * 50)
        print("TESTING SUMMARY")
        print("=" * 50)
        for img_path, label, confidence in results:
            print(f"{os.path.basename(img_path)}: {label} ({confidence*100:.2f}%)")