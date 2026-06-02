import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
import joblib
import os

print("Generating realistic fraud dataset...")

# Reproducibility
np.random.seed(42)

# Number of transactions
n_samples = 10000

# -----------------------------
# Generate Features
# -----------------------------

# Transaction amount (₹)
tx_amount = np.random.lognormal(
    mean=5,
    sigma=1.0,
    size=n_samples
)

# Distance from home (km)
dist_from_home = np.random.exponential(
    scale=20,
    size=n_samples
)

# Distance from previous transaction (km)
dist_from_last_tx = np.random.exponential(
    scale=10,
    size=n_samples
)

# Ratio compared to user's median spend
ratio_to_median = np.random.uniform(
    0.2,
    10,
    size=n_samples
)

# PIN usage (80% of transactions use PIN)
pin_used = np.random.choice(
    [0, 1],
    size=n_samples,
    p=[0.2, 0.8]
)

# -----------------------------
# Fraud Logic
# -----------------------------

fraud_score = (
    (tx_amount > 5000).astype(int)
    + (dist_from_home > 100).astype(int)
    + (dist_from_last_tx > 50).astype(int)
    + (ratio_to_median > 5).astype(int)
    + ((pin_used == 0) & (tx_amount > 2000)).astype(int)
)

# Mark transaction as fraud if multiple suspicious indicators exist
is_fraud = (fraud_score >= 2).astype(int)

# -----------------------------
# Create DataFrame
# -----------------------------

df = pd.DataFrame({
    "tx_amount": tx_amount,
    "dist_from_home": dist_from_home,
    "dist_from_last_tx": dist_from_last_tx,
    "ratio_to_median": ratio_to_median,
    "pin_used": pin_used,
    "is_fraud": is_fraud
})

print("\nDataset Created")
print(df.head())

print("\nFraud Distribution:")
print(df["is_fraud"].value_counts(normalize=True))

# -----------------------------
# Split Features / Labels
# -----------------------------

X = df.drop(columns=["is_fraud"])
y = df["is_fraud"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# -----------------------------
# Train XGBoost
# -----------------------------

print("\nTraining XGBoost Model...")

model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    eval_metric="logloss",
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# Evaluate Model
# -----------------------------

y_pred = model.predict(X_test)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

accuracy = model.score(X_test, y_test)

print(f"\nAccuracy: {accuracy * 100:.2f}%")

# -----------------------------
# Save Model
# -----------------------------

os.makedirs("../models", exist_ok=True)

model_path = "../models/xgboost_fraud_model.pkl"

joblib.dump(model, model_path)

print(f"\nModel saved successfully!")
print(f"Location: {model_path}")

# -----------------------------
# Quick Test Samples
# -----------------------------

print("\nTesting sample transactions...")

sample_transactions = pd.DataFrame([
    {
        "tx_amount": 200,
        "dist_from_home": 2,
        "dist_from_last_tx": 1,
        "ratio_to_median": 1.2,
        "pin_used": 1
    },
    {
        "tx_amount": 9500,
        "dist_from_home": 250,
        "dist_from_last_tx": 150,
        "ratio_to_median": 12,
        "pin_used": 0
    }
])

predictions = model.predict(sample_transactions)
probabilities = model.predict_proba(sample_transactions)

for i in range(len(sample_transactions)):
    print("\nTransaction", i + 1)
    print(sample_transactions.iloc[i].to_dict())
    print("Prediction:", "FRAUD" if predictions[i] else "CLEAN")
    print("Fraud Probability:", round(probabilities[i][1], 4))