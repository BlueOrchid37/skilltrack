
import os
from flask_cors import CORS
from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy

app = Flask(
    __name__,
    static_folder="frontend/build",
    static_url_path=""
)

CORS(app)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///skilltrack.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)


# Serve React frontend
@app.route("/")
def home():
    return send_from_directory("frontend/build", "index.html")


# API routes
@app.route("/api/goals", methods=["POST"])
def add_goal():
    data = request.get_json()

    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    new_goal = Goal(title=data["title"])
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


@app.route("/api/goals", methods=["GET"])
def get_goals():
    goals = Goal.query.all()

    return jsonify([
        {
            "id": g.id,
            "title": g.title,
            "completed": g.completed
        }
        for g in goals
    ])


@app.route("/api/goals/<int:goal_id>", methods=["PUT"])
def update_goal(goal_id):
    goal = Goal.query.get(goal_id)

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    data = request.get_json()
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


@app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    goal = Goal.query.get(goal_id)

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    db.session.delete(goal)
    db.session.commit()

    return jsonify({"message": "Goal deleted"})


# Serve React static files
@app.route("/<path:path>")
def serve_react_files(path):
    file_path = os.path.join("frontend/build", path)

    if os.path.isfile(file_path):
        return send_from_directory("frontend/build", path)

    return send_from_directory("frontend/build", "index.html")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
