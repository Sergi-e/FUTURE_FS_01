import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [newProject, setNewProject] = useState({
    title: '', subtitle: '', year: '', link: '', mediaType: 'image', mediaPath: ''
  });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const projRes = await fetch(`${API_URL}/projects`);
      const projData = await projRes.json();
      setProjects(projData);

      const msgRes = await fetch(`${API_URL}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      setMessages(msgData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setNewProject({ title: '', subtitle: '', year: '', link: '', mediaType: 'image', mediaPath: '' });
        fetchData();
      }
    } catch (err) {
      alert("Failed to add project");
    }
  };

  const handleDeleteProject = async (id) => {
    await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleDeleteMessage = async (id) => {
    await fetch(`${API_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  if (!token) {
    return (
      <div className="admin-login-container">
        <form className="admin-login-form" onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">SERGE ADMIN</div>
        <button className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}>Projects</button>
        <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>Contact Messages</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="admin-content">
        {activeTab === 'projects' && (
          <div className="admin-panel">
            <h2>Manage Projects</h2>
            <form className="admin-form" onSubmit={handleAddProject}>
              <h3>Add New Project</h3>
              <input type="text" placeholder="Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
              <input type="text" placeholder="Subtitle" value={newProject.subtitle} onChange={e => setNewProject({...newProject, subtitle: e.target.value})} required />
              <input type="text" placeholder="Year" value={newProject.year} onChange={e => setNewProject({...newProject, year: e.target.value})} />
              <input type="text" placeholder="Link URL" value={newProject.link} onChange={e => setNewProject({...newProject, link: e.target.value})} />
              <select value={newProject.mediaType} onChange={e => setNewProject({...newProject, mediaType: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="placeholder">Placeholder</option>
              </select>
              <input type="text" placeholder="Media Path (e.g. /assets/image.png)" value={newProject.mediaPath} onChange={e => setNewProject({...newProject, mediaPath: e.target.value})} />
              <button type="submit">Add Project</button>
            </form>

            <div className="admin-list">
              {projects.map(p => (
                <div key={p.id} className="admin-list-item">
                  <div>
                    <strong>{p.title}</strong> - {p.year}
                  </div>
                  <button onClick={() => handleDeleteProject(p.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="admin-panel">
            <h2>Contact Messages</h2>
            <div className="admin-messages-list">
              {messages.length === 0 ? <p>No messages found.</p> : messages.map(m => (
                <div key={m.id} className="message-card">
                  <div className="msg-header">
                    <strong>{m.name}</strong> ({m.email}) <span>{new Date(m.date).toLocaleString()}</span>
                  </div>
                  <p>{m.message}</p>
                  <button onClick={() => handleDeleteMessage(m.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
