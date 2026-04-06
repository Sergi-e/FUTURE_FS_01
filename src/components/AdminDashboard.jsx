import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { API_BASE_URL } from '../config/api';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [resumeUrl, setResumeUrl] = useState('');
  
  const [newProject, setNewProject] = useState({
    title: '', subtitle: '', year: '', link: '', mediaType: 'image', mediaPath: ''
  });

  const [newTestimonial, setNewTestimonial] = useState({
    name: '', role: '', location: '', image: '', quote: '', tag: ''
  });

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const projRes = await fetch(`${API_BASE_URL}/projects`);
      const projData = await projRes.json();
      setProjects(Array.isArray(projData) ? projData : []);

      const msgRes = await fetch(`${API_BASE_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      setMessages(Array.isArray(msgData) ? msgData : []);

      const testRes = await fetch(`${API_BASE_URL}/testimonials`);
      const testData = await testRes.json();
      setTestimonials(Array.isArray(testData) ? testData : []);

      const setRes = await fetch(`${API_BASE_URL}/settings/resume`);
      const setData = await setRes.json();
      if (setData && typeof setData.value === 'string') setResumeUrl(setData.value);
    } catch {
      console.error('Failed to fetch admin data');
    }
  }, [token]);

  useEffect(() => {
    startTransition(() => {
      void fetchData();
    });
  }, [fetchData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
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
    } catch {
      alert("Login failed");
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
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
    } catch {
      alert("Failed to add project");
    }
  };

  const handleDeleteProject = async (id) => {
    await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleDeleteMessage = async (id) => {
    await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTestimonial)
      });
      if (res.ok) {
        setNewTestimonial({ name: '', role: '', location: '', image: '', quote: '', tag: '' });
        fetchData();
      }
    } catch {
      alert("Failed to add testimonial");
    }
  };

  const handleDeleteTestimonial = async (id) => {
    await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleUpdateResume = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/settings/resume`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value: resumeUrl })
      });
      if (res.ok) {
        alert("Resume updated successfully!");
      } else {
        alert("Failed to update resume");
      }
    } catch {
      alert("Error updating resume");
    }
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
        <button className={activeTab === 'testimonials' ? 'active' : ''} onClick={() => setActiveTab('testimonials')}>Testimonials</button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</button>
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
              <input type="text" placeholder="Media: /assets/name.png on API, or full https://… URL" value={newProject.mediaPath} onChange={e => setNewProject({...newProject, mediaPath: e.target.value})} />
              <button type="submit">Add Project</button>
            </form>

            <div className="admin-list">
              {projects.map((p) => (
                <div key={p.id} className="admin-list-item">
                  <div className="admin-list-item-main">
                    {(p.mediaType === 'image' || p.mediaType === 'video') && p.mediaPath ? (
                      <div className="admin-media-thumb-wrap">
                        {p.mediaType === 'image' ? (
                          <img src={resolveMediaUrl(p.mediaPath)} alt="" className="admin-media-thumb" />
                        ) : (
                          <video src={resolveMediaUrl(p.mediaPath)} muted playsInline className="admin-media-thumb" />
                        )}
                      </div>
                    ) : null}
                    <div className="admin-list-text">
                      <strong>{p.title}</strong> — {p.year}
                      {p.subtitle ? <div className="admin-list-meta">{p.subtitle}</div> : null}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDeleteProject(p.id)}>Delete</button>
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

        {activeTab === 'testimonials' && (
          <div className="admin-panel">
            <h2>Manage Testimonials</h2>
            <form className="admin-form" onSubmit={handleAddTestimonial}>
              <h3>Add New Testimonial</h3>
              <input type="text" placeholder="Name" value={newTestimonial.name} onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})} required />
              <input type="text" placeholder="Role" value={newTestimonial.role} onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})} required />
              <input type="text" placeholder="Location" value={newTestimonial.location} onChange={e => setNewTestimonial({...newTestimonial, location: e.target.value})} />
              <input type="text" placeholder="Image: /assets/photo.png on API, or full https://… URL" value={newTestimonial.image} onChange={e => setNewTestimonial({...newTestimonial, image: e.target.value})} />
              <textarea placeholder="Quote" value={newTestimonial.quote} onChange={e => setNewTestimonial({...newTestimonial, quote: e.target.value})} required />
              <input type="text" placeholder="Tag (e.g. IMG_ID: 01)" value={newTestimonial.tag} onChange={e => setNewTestimonial({...newTestimonial, tag: e.target.value})} />
              <button type="submit">Add Testimonial</button>
            </form>

            <div className="admin-list">
              {testimonials.map((t) => (
                <div key={t.id} className="admin-list-item">
                  <div className="admin-list-item-main">
                    {t.image ? (
                      <div className="admin-media-thumb-wrap admin-media-thumb-round">
                        <img src={resolveMediaUrl(t.image)} alt="" className="admin-media-thumb" />
                      </div>
                    ) : null}
                    <div className="admin-list-text">
                      <strong>{t.name}</strong> — {t.role}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDeleteTestimonial(t.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="admin-panel">
            <h2>Website Settings</h2>
            <form className="admin-form" onSubmit={handleUpdateResume}>
              <h3>Resume Link</h3>
              <p style={{marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>Update the link to your resume. This can be a file path (e.g. <code>/Serge_Ishimwe_Resume.pdf</code>) or an external URL.</p>
              <input 
                type="text" 
                placeholder="Resume URL or Path" 
                value={resumeUrl} 
                onChange={e => setResumeUrl(e.target.value)} 
                required 
              />
              <button type="submit">Update Resume</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
