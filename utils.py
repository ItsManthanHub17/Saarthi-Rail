# utils.py
import logging
from datetime import datetime, timedelta
import json

# Setup logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Set to INFO or WARNING in production

# Log format
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

# Console handler
ch = logging.StreamHandler()
ch.setFormatter(formatter)
logger.addHandler(ch)

BUFFER_MINUTES = 5


def parse_time(time_str):
    return datetime.strptime(time_str, "%H:%M")


def assign_platform(train_id, arrival, departure, direction, redis_conn, platforms):
    arrival_dt = parse_time(arrival)
    departure_dt = parse_time(departure)

    for platform in platforms:
        key = f"platform:{platform}:schedule"
        scheduled_trains = redis_conn.lrange(key, 0, -1)

        conflict = False
        for entry in scheduled_trains:
            try:
                train = json.loads(entry)
                existing_arr = parse_time(train["arrival"])
                existing_dep = parse_time(train["departure"])

                if arrival_dt < existing_dep + timedelta(
                    minutes=BUFFER_MINUTES
                ) and departure_dt > existing_arr - timedelta(minutes=BUFFER_MINUTES):
                    conflict = True
                    break

            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON found in Redis on key {key}: {entry}")
                continue

        if not conflict:
            new_train = {
                "train_id": train_id,
                "arrival": arrival,
                "departure": departure,
                "direction": direction,
                "platform": platform,
            }
            redis_conn.rpush(key, json.dumps(new_train))
            logger.info(f"Assigned Train {train_id} to Platform {platform}")
            return platform

    logger.info(f"No available platform found for Train {train_id}")
    return None
