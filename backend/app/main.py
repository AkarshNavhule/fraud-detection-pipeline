import random
import threading
import time

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from .ml_model import predict_fraud
from .database import supabase

app = FastAPI(title="Fraud Detection MLOps API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (React frontend)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS and POST
    allow_headers=["*"],
)



# We use these variables to control our background worker
is_streaming = False
stream_thread = None


# Define the expected JSON payload using Pydantic
class TransactionPayload(BaseModel):
    tx_amount: float
    dist_from_home: float
    dist_from_last_tx: float
    ratio_to_median: float
    pin_used: bool


# Python Concept 2: Lambda Function
# A quick inline function to cap extremely high transaction amounts (outlier handling)
cap_outliers = lambda x: 10000.0 if x > 10000.0 else x


@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/predict")
async def score_transaction(tx: TransactionPayload):
    try:
        # 1. Preprocess using the lambda function
        cleaned_amount = cap_outliers(tx.tx_amount)

        features = {
            "tx_amount": cleaned_amount,
            "dist_from_home": tx.dist_from_home,
            "dist_from_last_tx": tx.dist_from_last_tx,
            "ratio_to_median": tx.ratio_to_median,
            "pin_used": int(tx.pin_used)
        }

        # 2. Run Inference (Decorator automatically calculates latency!)
        (prediction, confidence), latency = predict_fraud(features)
        is_fraud = bool(prediction)

        # 3. Save Transaction to Supabase
        db_tx = supabase.table("transactions").insert({
            "tx_amount": features["tx_amount"],
            "dist_from_home": features["dist_from_home"],
            "dist_from_last_tx": features["dist_from_last_tx"],
            "ratio_to_median": features["ratio_to_median"],
            "pin_used": features["pin_used"],
            "model_prediction": is_fraud,
            "prediction_confidence": confidence
        }).execute()

        tx_id = db_tx.data[0]['id']

        # 4. Save MLOps Latency Log to Supabase
        supabase.table("model_logs").insert({
            "transaction_id": tx_id,
            "latency_ms": latency
        }).execute()

        return {
            "status": "success",
            "transaction_id": tx_id,
            "is_fraud": is_fraud,
            "confidence": confidence,
            "latency_ms": latency
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/recent-transactions")
async def get_recent_transactions():
    try:
        # Fetch the last 50 transactions from Supabase
        response = supabase.table("transactions").select("*").order("created_at", desc=True).limit(50).execute()

        # Python Concept 3: List Comprehension
        # Cleanly format the database rows into a frontend-friendly list of dictionaries
        formatted_data = [
            {
                "id": row["id"],
                "amount": f"${row['tx_amount']:.2f}",
                "fraud_flag": "🚨 FRAUD" if row["model_prediction"] else "✅ CLEAN",
                "time": row["created_at"],
                "dist_from_home": row["dist_from_home"],
                "dist_from_last_tx":row["dist_from_last_tx"],
                "ratio_to_median":row["ratio_to_median"],
                "pin_used":row["pin_used"],
            }
            for row in response.data
        ]

        return {"count": len(formatted_data), "data": formatted_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Python Concept 4: Threading Target Function
def background_transaction_generator():
    """
    This function runs continuously in a separate thread.
    It simulates a live stream of incoming transactions.
    """
    global is_streaming
    print("Background stream started...")

    while is_streaming:
        # 1. Generate a random "synthetic" transaction
        features = {
            "tx_amount": cap_outliers(random.uniform(5.0, 7000.0)),
            "dist_from_home": random.uniform(0.1, 100.0),
            "dist_from_last_tx": random.uniform(0.1, 50.0),
            "ratio_to_median": random.uniform(0.5, 10.0),
            "pin_used": random.choice([0, 1])
        }

        # Force an occasional obvious fraud case for our dashboard
        if random.random() < 0.05:  # 5% chance
            features["tx_amount"] = 8000.0
            features["dist_from_home"] = 2000.0
            features["pin_used"] = 0
            features['ratio_to_median'] = 10

        try:
            # 2. Score it using our ML model
            (prediction, confidence), latency = predict_fraud(features)
            is_fraud = bool(prediction)

            # 3. Save to Supabase
            db_tx = supabase.table("transactions").insert({
                **features,  # Unpack dictionary directly
                "pin_used": bool(features["pin_used"]),
                "model_prediction": is_fraud,
                "prediction_confidence": confidence
            }).execute()

            tx_id = db_tx.data[0]['id']

            supabase.table("model_logs").insert({
                "transaction_id": tx_id,
                "latency_ms": latency
            }).execute()

            print(f"Streamed TX: {'🚨 FRAUD' if is_fraud else '✅ CLEAN'} | Amount: ${features['tx_amount']:.2f}")

        except Exception as e:
            print(f"Background thread error: {e}")

        # Pause for 2 seconds before the next transaction to simulate real traffic
        time.sleep(2)

    print("Background stream stopped.")


@app.post("/pipeline/start")
async def start_pipeline():
    """Endpoint to kick off the background worker thread."""
    global is_streaming, stream_thread

    if is_streaming:
        return {"status": "warning", "message": "Pipeline is already running."}

    is_streaming = True
    # Initialize and start the background thread
    stream_thread = threading.Thread(target=background_transaction_generator)
    stream_thread.daemon = True  # Daemon threads close automatically if the main API shuts down
    stream_thread.start()

    return {"status": "success", "message": "Real-time transaction stream started in background."}


@app.post("/pipeline/stop")
async def stop_pipeline():
    """Endpoint to gracefully halt the background worker thread."""
    global is_streaming

    if not is_streaming:
        return {"status": "warning", "message": "Pipeline is not currently running."}

    # Setting this to False will cause the while loop in the thread to exit
    is_streaming = False
    return {"status": "success", "message": "Stopping real-time stream..."}