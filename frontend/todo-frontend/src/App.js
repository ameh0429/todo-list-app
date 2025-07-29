import React, { useState, useEffect } from 'react';
import { login, getTasks, addTask } from './api';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    if (data.token) {
      setToken(data.token);
      fetchTasks(data.token);
    } else {
      alert('Login failed');
    }
  };

  const fetchTasks = async (tk) => {
    const data = await getTasks(tk);
    setTasks(data.tasks || []);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask) return;
    await addTask(token, { title: newTask });
    setNewTask('');
    fetchTasks(token);
  };

  useEffect(() => {
    if (token) fetchTasks(token);
  }, [token]);

  if (!token) {
    return (
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    );
  }

  return (
    <div>
      <h2>Todo List</h2>
      <form onSubmit={handleAddTask}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="New Task" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map(t => <li key={t._id}>{t.title}</li>)}
      </ul>
    </div>
  );
}

export default App;