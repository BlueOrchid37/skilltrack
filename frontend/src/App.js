import headerImage from "./header.png";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  const fetchGoals = () => {
    fetch("http://127.0.0.1:5000/api/goals")
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const addGoal = () => {
    if (!newGoal) return alert("Title is required");

    fetch("http://127.0.0.1:5000/api/goals", {
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
    fetch(`http://127.0.0.1:5000/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !current }),
    })
      .then(() => fetchGoals())
      .catch((err) => console.error(err));
  };

  const deleteGoal = (id) => {
    fetch(`http://127.0.0.1:5000/api/goals/${id}`, {
      method: "DELETE",
    })
      .then(() => fetchGoals())
      .catch((err) => console.error(err));
  };
<img
  src={headerImage}
  alt="SkillTrack"
  style={{
    width: "100%",
    maxWidth: "300px",
    display: "block",
    margin: "0 auto 20px",
  }}
/>

return (
<>
<div className="app-header">
    <img src="/header.png" alt="Header" />
  </div>
  
  <div className="container">
    <h1>SkillTrack Goals</h1>

    <div className="input-row">
      <input
        type="text"
        placeholder="Enter new goal"
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
      />
      <button onClick={addGoal}>Add</button>
    </div>
<p>
  Completed:{" "}
  {goals.filter((goal) => goal.completed).length} / {goals.length}
</p>

    <ul>
      {goals.map((goal) => (
        <li key={goal.id}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={goal.completed}
              onChange={() => toggleCompleted(goal.id, goal.completed)}
            />
            <span className={goal.completed ? "completed" : ""}>
              {goal.title}
            </span>
          </div>

          <button onClick={() => deleteGoal(goal.id)}>❌</button>
        </li>
      ))}
    </ul>
  </div>
  </>
);
}

export default App;
