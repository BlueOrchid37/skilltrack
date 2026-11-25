import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  const API_URL = "https://skilltrack-backend-u9kg.onrender.com/api/goals";

  const fetchGoals = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const addGoal = () => {
    if (!newGoal.trim()) return alert("Title is required");

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newGoal }),
    })
      .then(() => {
        setNewGoal("");
        fetchGoals();
      })
      .catch((err) => console.error(err));
  };

  const toggleCompleted = (id, current) => {
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !current }),
    })
      .then(() => fetchGoals())
      .catch((err) => console.error(err));
  };

  const deleteGoal = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })
      .then(() => fetchGoals())
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
            placeholder="Enter new goal"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
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

                <span className={`goal-text ${goal.completed ? "completed" : ""}`}>
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
