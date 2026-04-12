import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { API_BASE_URL } from '../config/api';
import { fetchJson, fetchJsonWithStatus, getJson } from '../lib/apiClient';
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
  const [adminUsername, setAdminUsername] = useState('');

  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');

  const [userNew, setUserNew] = useState('');
  const [userCurrentPwd, setUserCurrentPwd] = useState('');

  const [newProject, setNewProject] = useState({
    title: '', subtitle: '', year: '', link: '', mediaType: 'image', mediaPath: ''
  });

  const [newTestimonial, setNewTestimonial] = useState({
    name: '', role: '', location: '', image: '', quote: '', tag: ''
  });

  const fetchData = useCallback(async () => {
    if (!token) return;
    const [rProj, rMsg, rTest, rSet] = await Promise.allSettled([
      getJson('/projects'),
      fetchJson(`${API_BASE_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      getJson('/testimonials'),
      getJson('/settings/resume')
    ]);

    if (rProj.status === 'fulfilled' && Array.isArray(rProj.value)) setProjects(rProj.value);
    else {
      setProjects([]);
      if (rProj.status === 'rejected') console.error('Admin: projects', rProj.reason);
    }
    if (rMsg.status === 'fulfilled' && Array.isArray(rMsg.value)) setMessages(rMsg.value);
    else {
      setMessages([]);
      if (rMsg.status === 'rejected') console.error('Admin: messages', rMsg.reason);
    }
    if (rTest.status === 'fulfilled' && Array.isArray(rTest.value)) setTestimonials(rTest.value);
    else {
      setTestimonials([]);
      if (rTest.status === 'rejected') console.error('Admin: testimonials', rTest.reason);
    }
    if (rSet.status === 'fulfilled' && rSet.value && typeof rSet.value.value === 'string') {
      setResumeUrl(rSet.value.value);
    } else if (rSet.status === 'rejected') {
      console.error('Admin: resume setting', rSet.reason);
    }
  }, [token]);

  useEffect(() => {
    startTransition(() => {
      void fetchData();
    });
  }, [fetchData]);

  const fetchAdminProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchJson(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.username) setAdminUsername(data.username);
    } catch {
      setAdminUsername('');
    }
  }, [token]);

  useEffect(() => {
    startTransition(() => {
      void fetchAdminProfile();
    });
  }, [fetchAdminProfile]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { ok, data } = await fetchJsonWithStatus(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (ok && data?.token) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        alert(data?.error || 'Login failed');
      }
    } catch {
      alert('Login failed');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await fetchJson(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });
      setNewProject({ title: '', subtitle: '', year: '', link: '', mediaType: 'image', mediaPath: '' });
      fetchData();
    } catch {
      alert('Failed to add project');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await fetchJson(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      /* still refresh list */
    }
    fetchData();
  };

  const handleDeleteMessage = async (id) => {
    try {
      await fetchJson(`${API_BASE_URL}/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      /* still refresh */
    }
    fetchData();
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    try {
      await fetchJson(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTestimonial)
      });
      setNewTestimonial({ name: '', role: '', location: '', image: '', quote: '', tag: '' });
      fetchData();
    } catch {
      alert('Failed to add testimonial');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    try {
      await fetchJson(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      /* still refresh */
    }
    fetchData();
  };

  const handleUpdateResume = async (e) => {
    e.preventDefault();
    try {
      await fetchJson(`${API_BASE_URL}/settings/resume`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ value: resumeUrl })
      });
      alert('Resume updated successfully!');
    } catch {
      alert('Error updating resume');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdNew !== pwdConfirm) {
      alert('New password and confirmation do not match');
      return;
    }
    try {
      const { ok, data } = await fetchJsonWithStatus(`${API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: pwdCurrent, newPassword: pwdNew }),
      });
      if (ok) {
        setPwdCurrent('');
        setPwdNew('');
        setPwdConfirm('');
        alert('Password updated successfully.');
      } else {
        alert(data?.error || 'Could not update password');
      }
    } catch {
      alert('Could not update password');
    }
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    const name = userNew.trim();
    if (!name) {
      alert('Enter a new username');
      return;
    }
    try {
      const { ok, data } = await fetchJsonWithStatus(`${API_BASE_URL}/auth/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: userCurrentPwd, newUsername: name }),
      });
      if (ok && data?.token) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setAdminUsername(data.username || name);
        setUserNew('');
        setUserCurrentPwd('');
        alert('Username updated. You stay signed in with a new session token.');
      } else {
        alert(data?.error || 'Could not update username');
      }
    } catch {
      alert('Could not update username');
    }
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

            <div className="admin-settings-section">
              <h3>Account</h3>
              <p className="admin-settings-hint">
                Signed in as <strong>{adminUsername || '…'}</strong>. Change your username or password here; use a
                strong password on any public site.
              </p>

              <form className="admin-form admin-form--compact" onSubmit={handleChangeUsername}>
                <h4>Change username</h4>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="New username"
                  value={userNew}
                  onChange={(e) => setUserNew(e.target.value)}
                  minLength={2}
                  maxLength={64}
                  required
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Current password (to confirm)"
                  value={userCurrentPwd}
                  onChange={(e) => setUserCurrentPwd(e.target.value)}
                  required
                />
                <button type="submit">Update username</button>
              </form>

              <form className="admin-form admin-form--compact" onSubmit={handleChangePassword}>
                <h4>Change password</h4>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Current password"
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="New password (min. 8 characters)"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  minLength={8}
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  minLength={8}
                  required
                />
                <button type="submit">Update password</button>
              </form>
            </div>

            <form className="admin-form" onSubmit={handleUpdateResume}>
              <h3>Resume Link</h3>
              <p className="admin-settings-hint">
                Update the link to your resume. This can be a file path (e.g.{' '}
                <code>/Serge_Ishimwe_Resume.pdf</code>) or an external URL.
              </p>
              <input
                type="text"
                placeholder="Resume URL or Path"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
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
