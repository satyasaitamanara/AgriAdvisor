import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.optimizers import Adam
import numpy as np
import os

# Disable oneDNN warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Paths
train_dir = r"C:\Users\sai\Documents\Custom Office Templates\DEEPSEAK\backend\data\processed_color\train"
val_dir = r"C:\Users\sai\Documents\Custom Office Templates\DEEPSEAK\backend\data\processed_color\val"

# 1. Check dataset size
def count_images(directory):
    total = 0
    for root, dirs, files in os.walk(directory):
        total += len([f for f in files if f.endswith(('.jpg', '.jpeg', '.png'))])
    return total

train_count = count_images(train_dir)
val_count = count_images(val_dir)
print(f"Training images: {train_count}")
print(f"Validation images: {val_count}")

# 2. Optimized Data Generator
img_size = (160, 160)
batch_size = 32

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

val_datagen = ImageDataGenerator(rescale=1./255)

train_data = train_datagen.flow_from_directory(
    train_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True
)

val_data = val_datagen.flow_from_directory(
    val_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False
)

# 3. Calculate steps per epoch
steps_per_epoch = train_count // batch_size
validation_steps = val_count // batch_size

print(f"Steps per epoch: {steps_per_epoch}")
print(f"Validation steps: {validation_steps}")

# 4. Model Architecture
base_model = MobileNetV2(
    input_shape=(img_size[0], img_size[1], 3),
    include_top=False,
    weights="imagenet",
    pooling='avg'
)

# Freeze base model layers
base_model.trainable = False

# Add custom head
x = base_model.output
x = Dropout(0.5)(x)
predictions = Dense(train_data.num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

# 5. Compile model
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# 6. Callbacks
callbacks = [
    EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-7),
    ModelCheckpoint('best_model.h5', monitor='val_accuracy', save_best_only=True)
]

# 7. Train the model
print("Starting training...")
history = model.fit(
    train_data,
    steps_per_epoch=steps_per_epoch,
    validation_data=val_data,
    validation_steps=validation_steps,
    epochs=20,
    callbacks=callbacks,
    verbose=1
)

# 8. Fine-tuning - unfreeze some layers
print("Starting fine-tuning...")
base_model.trainable = True
# Fine-tune from this layer onwards
fine_tune_at = 100
for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False

model.compile(
    optimizer=Adam(learning_rate=0.0001),  # Lower learning rate for fine-tuning
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# Continue training
history_fine = model.fit(
    train_data,
    steps_per_epoch=steps_per_epoch,
    validation_data=val_data,
    validation_steps=validation_steps,
    epochs=10,
    initial_epoch=history.epoch[-1],
    callbacks=callbacks,
    verbose=1
)

# 9. Save the final model
model.save("plant_disease_model_final.h5")
print("Training completed and model saved!")

# 10. Evaluate the model
print("Evaluating model...")
val_loss, val_accuracy = model.evaluate(val_data, steps=validation_steps)
print(f"Validation accuracy: {val_accuracy:.4f}")