import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  const fetchGoals = () => {
    fetch("https://skilltrack-backend-u9kg.onrender.com/goals")
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const addGoal = () => {
    if (!newGoal) return alert("Title is required");

    fetch("https://skilltrack-backend-u9kg.onrender.com/goals", {
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
    fetch(`https://skilltrack-backend-u9kg.onrender.com/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !current }),
    })
      .then(() => fetchGoals())
      .catch((err) => console.error(err));
  };

  const deleteGoal = (id) => {
    fetch(`https://skilltrack-backend-u9kg.onrender.com/goals/${id}`, {
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
