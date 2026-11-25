
import "./App.css";
import { useEffect, useState } from "react";

const API_URL = "https://skilltrack-backend-u9kg.onrender.com/api/goals";

// Generate and save a unique ID for this browser
function getDeviceId() {
  let deviceId = localStorage.getItem("skilltrack_device_id");

  if (!deviceId) {
    deviceId = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : "device-" + Date.now() + "-" + Math.random().toString(36).slice(2);

    localStorage.setItem("skilltrack_device_id", deviceId);
  }

  return deviceId;
}

const DEVICE_ID = getDeviceId();

function App() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  // Common headers for device-specific requests
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "X-Device-ID": DEVICE_ID
  });

  // Fetch only this browser's goals
  const fetchGoals = () => {
    fetch(API_URL, {
      method: "GET",
      headers: getHeaders()
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to fetch goals");
        return res.json();
      })
      .then((data) => setGoals(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Add a goal
  const addGoal = () => {
    if (!newGoal.trim()) {
      return alert("Title is required");
    }

    fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title: newGoal })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to add goal");

        setNewGoal("");
        fetchGoals();
      })
      .catch((err) => console.error(err));
  };

  // Mark a goal as completed or incomplete
  const toggleCompleted = (id, current) => {
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ completed: !current })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to update goal");
        fetchGoals();
      })
      .catch((err) => console.error(err));
  };

  // Delete a goal
  const deleteGoal = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to delete goal");
        fetchGoals();
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <div className="app-header">
        <img src="/header.png" alt="SkillTrack" />
      </div>

      <div className="container">
        <h1>SkillTrack Goals</h1>

        <div className="input-row">
          <input
            className="goal-input"
            type="text"
            placeholder="Enter your next goal..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addGoal();
            }}
          />

          <button className="add-button" onClick={addGoal}>
            Add
          </button>
        </div>

        <p className="progress">
          Completed: {goals.filter((goal) => goal.completed).length} /{" "}
          {goals.length}
        </p>

        <ul className="goal-list">
          {goals.map((goal) => (
            <li className="goal-item" key={goal.id}>
              <div className="goal-content">
                <input
                  className="goal-checkbox"
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() =>
                    toggleCompleted(goal.id, goal.completed)
                  }
                />

                <span
                  className={`goal-text ${
                    goal.completed ? "completed" : ""
                  }`}
                >
                  {goal.title}
                </span>
              </div>

              <button
                className="delete-button"
                onClick={() => deleteGoal(goal.id)}
                aria-label={`Delete ${goal.title}`}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
