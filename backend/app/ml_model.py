import os
import time
from functools import wraps

import joblib
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/xgboost_fraud_model.pkl')
model = joblib.load(MODEL_PATH)

def log_inference_time(func):
    """Decorator to measure how long the ML model takes to predict."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        latency_ms = (time.time() - start_time) * 1000
        return result, latency_ms # Return both the prediction and the speed
    return wrapper


@log_inference_time
def predict_fraud(features : dict):
    df = pd.DataFrame([features])

    prediction = int(model.predict(df)[0])
    probability = float(model.predict_proba(df)[0][1])

    return prediction, probability