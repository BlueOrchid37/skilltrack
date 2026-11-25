
import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect


app = Flask(__name__)

CORS(app)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///skilltrack.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Database model
class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    # Nullable so existing goals can remain unassigned
    device_id = db.Column(db.String(64), nullable=True)


# Get device ID from each frontend request
def get_device_id():
    return request.headers.get("X-Device-ID")


# Database initialization and safe migration
def initialize_database():
    with app.app_context():
        db.create_all()

        columns = [
            column["name"]
            for column in inspect(db.engine).get_columns("goal")
        ]

        if "device_id" not in columns:
            db.session.execute(
                db.text(
                    "ALTER TABLE goal ADD COLUMN device_id VARCHAR(64)"
                )
            )
            db.session.commit()


# Add a new goal
@app.route("/api/goals", methods=["POST"])
def add_goal():
    device_id = get_device_id()

    if not device_id:
        return jsonify({"error": "Device ID is required"}), 400

    data = request.get_json()

    if not data or not data.get("title", "").strip():
        return jsonify({"error": "Title is required"}), 400

    new_goal = Goal(
        title=data["title"].strip(),
        completed=False,
        device_id=device_id
    )

    db.session.add(new_goal)
    db.session.commit()

    return jsonify({
        "message": "Goal added",
        "goal": {
            "id": new_goal.id,
            "title": new_goal.title,
            "completed": new_goal.completed
        }
    }), 201


# Get goals belonging only to this device
@app.route("/api/goals", methods=["GET"])
def get_goals():
    device_id = get_device_id()

    if not device_id:
        return jsonify({"error": "Device ID is required"}), 400

    goals = Goal.query.filter_by(device_id=device_id).all()

    result = []

    for goal in goals:
        result.append({
            "id": goal.id,
            "title": goal.title,
            "completed": goal.completed
        })

    return jsonify(result)


# Update a goal belonging to this device
@app.route("/api/goals/<int:goal_id>", methods=["PUT"])
def update_goal(goal_id):
    device_id = get_device_id()

    if not device_id:
        return jsonify({"error": "Device ID is required"}), 400

    goal = Goal.query.filter_by(
        id=goal_id,
        device_id=device_id
    ).first()

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    data = request.get_json() or {}

    goal.completed = data.get("completed", goal.completed)

    db.session.commit()

    return jsonify({
        "message": "Goal updated",
        "goal": {
            "id": goal.id,
            "title": goal.title,
            "completed": goal.completed
        }
    })


# Delete a goal belonging to this device
@app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    device_id = get_device_id()

    if not device_id:
        return jsonify({"error": "Device ID is required"}), 400

    goal = Goal.query.filter_by(
        id=goal_id,
        device_id=device_id
    ).first()

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    db.session.delete(goal)
    db.session.commit()

    return jsonify({"message": "Goal deleted"})


if __name__ == "__main__":
    initialize_database()

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
