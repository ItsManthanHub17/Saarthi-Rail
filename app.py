from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import redis
import json
import pandas as pd
import joblib
import psycopg2
from psycopg2.extras import RealDictCursor
from utils import assign_platform, parse_time
import jwt
import secrets
from datetime import datetime, timedelta

JWT_SECRET = "your_secret_key"  # store in env for production
JWT_EXPIRY = 3600

app = Flask(__name__)
CORS(app, supports_credentials=True)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Redis connection
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# PostgreSQL connection
conn = psycopg2.connect(
    dbname="Saarthi Rail",
    user="postgres",
    password="Manthan@1708",
    host="localhost",
    port="5432",
    cursor_factory=RealDictCursor,
)
cursor = conn.cursor()


# Constants
PLATFORMS = [1, 2, 3, 4, 5]

# ✅ Load your trained Gradient Boosting model
model = joblib.load("gbr_delay_predictor.pkl")


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    token = "".join(
        secrets.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") for _ in range(8)
    )

    try:
        print("Signup request received:", data)  # DEBUG
        cursor.execute("SELECT * FROM users WHERE username=%s", (data["username"],))
        if cursor.fetchone():
            return jsonify({"error": "Username already exists"}), 400

        cursor.execute(
            "INSERT INTO users (username, role, token) VALUES (%s, %s, %s)",
            (data["username"], data["role"], token),
        )
        conn.commit()
        return jsonify({"message": "Signup successful", "token": token}), 200
    except Exception as e:
        print("❌ Signup error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    try:
        cursor.execute("SELECT * FROM users WHERE token=%s", (data["token"],))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "Invalid token"}), 401

        payload = {
            "id": user["id"],
            "role": user["role"],
            "exp": datetime.utcnow() + timedelta(seconds=JWT_EXPIRY),
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

        return (
            jsonify(
                {
                    "message": "Login successful",
                    "token": token,
                    "role": user["role"],
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def index():
    return "SaarthiRail backend is running!"


@app.route("/add_train", methods=["POST"])
def add_train():
    data = request.get_json()
    train_id = data["train_id"]
    arrival = data["arrival"]
    departure = data["departure"]
    direction = data["direction"]

    # Check if train already exists
    for platform in PLATFORMS:
        key = f"platform:{platform}:schedule"
        scheduled_trains = r.lrange(key, 0, -1)
        for train in scheduled_trains:
            try:
                train_obj = json.loads(train)
                if train_obj["train_id"] == train_id:
                    return (
                        jsonify(
                            {"status": "failed", "reason": "Train ID already scheduled"}
                        ),
                        409,
                    )
            except json.JSONDecodeError:
                continue

    # Try to assign platform
    platform = assign_platform(train_id, arrival, departure, direction, r, PLATFORMS)
    if platform is None:
        return jsonify({"status": "failed", "reason": "No available platform"}), 409

    train = {
        "train_id": train_id,
        "arrival": arrival,
        "departure": departure,
        "direction": direction,
        "platform": platform,
    }

    # Save to Redis and PostgreSQL
    r.rpush(f"platform:{platform}:schedule", json.dumps(train))
    cursor.execute(
        "INSERT INTO scheduled_trains (train_id, arrival, departure, direction, platform) VALUES (%s, %s, %s, %s, %s)",
        (train_id, arrival, departure, direction, platform),
    )
    conn.commit()

    socketio.emit("new_train", train)
    return jsonify({"status": "success", "train": train}), 200


@app.route("/get_trains", methods=["GET"])
def get_trains():
    all_trains = []
    for platform in PLATFORMS:
        key = f"platform:{platform}:schedule"
        trains = r.lrange(key, 0, -1)
        for train in trains:
            try:
                train_obj = json.loads(train)
                all_trains.append(train_obj)
            except json.JSONDecodeError:
                continue
    return jsonify(all_trains), 200


@app.route("/get_schedule", methods=["GET"])
def get_schedule():
    platform_data = {}
    for plat in PLATFORMS:
        key = f"platform:{plat}:schedule"
        scheduled = r.lrange(key, 0, -1)
        trains = []
        for item in scheduled:
            try:
                trains.append(json.loads(item))
            except json.JSONDecodeError:
                continue
        platform_data[f"Platform {plat}"] = trains
    return jsonify(platform_data), 200


@app.route("/predict_delay", methods=["POST"])
def predict_delay():
    try:
        data = request.get_json()
        print("📩 Received data:", data)

        # Default fallbacks
        defaults = {
            "distance_remaining_km": 0,
            "delay_so_far_min": 0,
            "weather": "clear",
            "stops_left": 0,
            "train_type": "express",
            "hour_of_day": 12,
            "day_of_week": "Monday",
            "station_congestion": "medium",
            "historical_delay_avg": 0,
        }

        for key, default in defaults.items():
            if not data.get(key):
                data[key] = default

        df = pd.DataFrame([data])
        predicted_delay = round(float(model.predict(df)[0]), 2)
        print("✅ Predicted Delay:", predicted_delay)

        # Insert prediction log
        cursor.execute(
            """
            INSERT INTO train_delays (
                train_number,
                station_code,
                reported_by,
                delay_minutes,
                reason,
                stops_left,
                previous_delay
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data.get("train_number"),  # Must exist in `trains` table
                data.get("station_code"),  # Must exist in `stations` table
                data.get("reported_by", "pilot"),  # Must be "pilot" or "station_master"
                predicted_delay,  # INT
                data.get("note", data.get("weather")),  # Reason
                data.get("stops_left", 0),  # INT
                data.get("delay_so_far_min", 0),  # INT
            ),
        )
        conn.commit()

        return jsonify({"predicted_delay": predicted_delay})

    except Exception as e:
        print("❌ Error in /predict_delay:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    try:
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print("✅ PostgreSQL connected successfully:", version)
    except Exception as e:
        print("❌ PostgreSQL connection failed:", e)

    socketio.run(app, debug=True)
