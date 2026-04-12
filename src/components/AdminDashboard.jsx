import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { API_BASE_URL } from '../config/api';
import { fetchJson, fetchJsonWithStatus, getJson, uploadAdminImage } from '../lib/apiClient';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './AdminDashboard.css';

const EMPTY_PROJECT = {
  title: '',
  subtitle: '',
  year: '',
  link: '',
  mediaType: 'image',
  mediaPath: '',
};

const EMPTY_TESTIMONIAL = {
  name: '',
  role: '',
  location: '',
  image: '',
  quote: '',
  tag: '',
};

const NAV = [
  { id: 'projects', label: 'Projects', title: 'Portfolio entries' },
  { id: 'messages', label: 'Inbox', title: 'Contact form' },
  { id: 'testimonials', label: 'Testimonials', title: 'Homepage quotes' },
  { id: 'settings', label: 'Settings', title: 'Account & resume' },
];

const PAGE_COPY = {
  projects: {
    title: 'Projects',
    subtitle: 'Add, edit, or remove portfolio items.',
  },
  messages: {
    title: 'Inbox',
    subtitle: 'Messages from your contact form.',
  },
  testimonials: {
    title: 'Testimonials',
    subtitle: 'Quotes and photos on the site.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Password, username, and resume link.',
  },
};

function Field({ id, label, hint, className = '', children }) {
  return (
    <div className={`admin-field ${className}`.trim()}>
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      {hint ? <p className="admin-hint">{hint}</p> : null}
      {children}
    </div>
  );
}

/** Text field + local image upload; `setPath(value, { source: 'upload' })` after a successful upload. */
function AdminImagePathInput({ id, value, setPath, token }) {
  const [busy, setBusy] = useState(false);
  const onText = (e) => setPath(e.target.value, { source: 'type' });
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;
    setBusy(true);
    try {
      const { path } = await uploadAdminImage(file, token);
      setPath(path, { source: 'upload' });
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-media-path-row">
      <input
        id={id}
        className="admin-input admin-media-path-input"
        type="text"
        value={value}
        onChange={onText}
        placeholder="/assets/photo.jpg or https://…"
        autoComplete="off"
      />
      <label className={`admin-btn-upload${busy ? ' is-busy' : ''}`}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="admin-sr-file"
          onChange={onFile}
          disabled={busy}
        />
        {busy ? 'Uploading…' : 'Upload image'}
      </label>
    </div>
  );
}

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

  const [projectForm, setProjectForm] = useState({ ...EMPTY_PROJECT });
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [newTestimonial, setNewTestimonial] = useState({ ...EMPTY_TESTIMONIAL });
  const [editTestimonial, setEditTestimonial] = useState({ ...EMPTY_TESTIMONIAL });
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    const [rProj, rMsg, rTest, rSet] = await Promise.allSettled([
      getJson('/projects'),
      fetchJson(`${API_BASE_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      getJson('/testimonials'),
      getJson('/settings/resume'),
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
        body: JSON.stringify({ username, password }),
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

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProjectId) {
        await fetchJson(`${API_BASE_URL}/projects/${editingProjectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(projectForm),
        });
        setEditingProjectId(null);
      } else {
        await fetchJson(`${API_BASE_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(projectForm),
        });
      }
      setProjectForm({ ...EMPTY_PROJECT });
      fetchData();
    } catch {
      alert(editingProjectId ? 'Failed to update project' : 'Failed to add project');
    }
  };

  const startEditProject = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title || '',
      subtitle: p.subtitle || '',
      year: p.year || '',
      link: p.link || '',
      mediaType: p.mediaType || 'image',
      mediaPath: p.mediaPath || '',
    });
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setProjectForm({ ...EMPTY_PROJECT });
  };

  const handleDeleteProject = (id, title) => {
    const label = title ? `"${title}"` : 'this project';
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    void (async () => {
      try {
        await fetchJson(`${API_BASE_URL}/projects/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        /* still refresh */
      }
      if (editingProjectId === id) cancelEditProject();
      fetchData();
    })();
  };

  const handleDeleteMessage = (id, name) => {
    if (!window.confirm(`Delete message from ${name || 'sender'}?`)) return;
    void (async () => {
      try {
        await fetchJson(`${API_BASE_URL}/messages/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        /* still refresh */
      }
      fetchData();
    })();
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    try {
      await fetchJson(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTestimonial),
      });
      setNewTestimonial({ ...EMPTY_TESTIMONIAL });
      fetchData();
    } catch {
      alert('Failed to add testimonial');
    }
  };

  const handleUpdateTestimonial = async (e) => {
    e.preventDefault();
    try {
      await fetchJson(`${API_BASE_URL}/testimonials/${editingTestimonialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editTestimonial),
      });
      setEditingTestimonialId(null);
      setEditTestimonial({ ...EMPTY_TESTIMONIAL });
      fetchData();
    } catch {
      alert('Failed to update testimonial');
    }
  };

  const startEditTestimonial = (t) => {
    setEditingTestimonialId(t.id);
    setEditTestimonial({
      name: t.name || '',
      role: t.role || '',
      location: t.location || '',
      image: t.image || '',
      quote: t.quote || '',
      tag: t.tag || '',
    });
  };

  const cancelEditTestimonial = () => {
    setEditingTestimonialId(null);
    setEditTestimonial({ ...EMPTY_TESTIMONIAL });
  };

  const handleDeleteTestimonial = (id, name) => {
    const label = name ? `"${name}"` : 'this testimonial';
    if (!window.confirm(`Delete ${label}?`)) return;
    void (async () => {
      try {
        await fetchJson(`${API_BASE_URL}/testimonials/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        /* still refresh */
      }
      if (editingTestimonialId === id) cancelEditTestimonial();
      fetchData();
    })();
  };

  const handleUpdateResume = async (e) => {
    e.preventDefault();
    try {
      await fetchJson(`${API_BASE_URL}/settings/resume`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: resumeUrl }),
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
      <div className="admin-app">
        <div className="admin-login-container">
          <div className="admin-login-card">
            <h1>Admin</h1>
            <p>Sign in to manage projects, testimonials, messages, and settings.</p>
            <form className="admin-login-form" onSubmit={handleLogin}>
              <Field id="login-user" label="Username">
                <input
                  id="login-user"
                  className="admin-input"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field>
              <Field id="login-pass" label="Password">
                <input
                  id="login-pass"
                  className="admin-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <div className="admin-form-actions admin-form-actions--bare">
                <button type="submit" className="admin-btn-primary">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const page = PAGE_COPY[activeTab] || PAGE_COPY.projects;

  return (
    <div className="admin-app">
      <div className="admin-shell">
        <aside className="admin-nav" aria-label="Admin navigation">
          <div className="admin-nav-brand">
            <span className="admin-nav-brand-mark">Admin</span>
            <span className="admin-nav-brand-sub">Portfolio CMS</span>
          </div>
          <nav className="admin-nav-list">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.title}
                className={`admin-nav-item ${activeTab === item.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="admin-nav-footer">
            <button type="button" className="admin-btn-logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-toolbar">
            <div className="admin-toolbar-text">
              <h1>{page.title}</h1>
              <p>{page.subtitle}</p>
            </div>
            <button type="button" className="admin-btn-ghost" onClick={() => fetchData()}>
              Refresh
            </button>
          </header>

          <div className="admin-scroll">
            <div className="admin-page">
              {activeTab === 'projects' && (
                <>
                  <details className="admin-help">
                    <summary>How media and upload work</summary>
                    <p>
                      Use <strong>Upload image</strong> to send a JPEG, PNG, WebP, or GIF to the API (saved under{' '}
                      <code>/assets/</code>). You can still type <code>/assets/…</code> or any <code>https://</code> link.
                      On hosts without a persistent disk (e.g. Render free), uploads can be lost on redeploy — keep copies
                      or use external URLs for production.
                    </p>
                  </details>

                  <div className="admin-stack">
                    <div className={`admin-card${editingProjectId ? ' admin-card--accent' : ''}`}>
                      <div className="admin-card-header">
                        <h2 className="admin-card-title">{editingProjectId ? 'Edit project' : 'New project'}</h2>
                        {editingProjectId ? (
                          <span className="admin-badge">ID {editingProjectId}</span>
                        ) : (
                          <span className="admin-badge admin-badge--muted">Create</span>
                        )}
                      </div>
                      <form onSubmit={handleSaveProject}>
                        <div className="admin-form-grid">
                          <Field id="pf-title" label="Title" className="admin-field--full">
                            <input
                              id="pf-title"
                              className="admin-input"
                              value={projectForm.title}
                              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                              required
                            />
                          </Field>
                          <Field id="pf-year" label="Year">
                            <input
                              id="pf-year"
                              className="admin-input"
                              value={projectForm.year}
                              onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                            />
                          </Field>
                          <Field id="pf-link" label="Project URL" className="admin-field--full">
                            <input
                              id="pf-link"
                              className="admin-input"
                              type="url"
                              placeholder="https://…"
                              value={projectForm.link}
                              onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                            />
                          </Field>
                          <Field id="pf-sub" label="Subtitle / description" className="admin-field--full">
                            <input
                              id="pf-sub"
                              className="admin-input"
                              value={projectForm.subtitle}
                              onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                              required
                            />
                          </Field>
                          <Field id="pf-type" label="Media type">
                            <select
                              id="pf-type"
                              className="admin-select"
                              value={projectForm.mediaType}
                              onChange={(e) => setProjectForm({ ...projectForm, mediaType: e.target.value })}
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                              <option value="placeholder">Placeholder</option>
                            </select>
                          </Field>
                          <Field
                            id="pf-media"
                            label="Media path or URL"
                            hint="Type a path / URL or upload — files go to /assets on the API server; upload sets type to Image."
                            className="admin-field--full"
                          >
                            <AdminImagePathInput
                              id="pf-media"
                              value={projectForm.mediaPath}
                              token={token}
                              setPath={(path, meta) =>
                                setProjectForm((p) => ({
                                  ...p,
                                  mediaPath: path,
                                  ...(meta?.source === 'upload' ? { mediaType: 'image' } : {}),
                                }))
                              }
                            />
                          </Field>
                        </div>
                        <div className="admin-form-actions">
                          <button type="submit" className="admin-btn-primary">
                            {editingProjectId ? 'Save changes' : 'Add project'}
                          </button>
                          {editingProjectId ? (
                            <button type="button" className="admin-btn-secondary" onClick={cancelEditProject}>
                              Cancel editing
                            </button>
                          ) : null}
                        </div>
                      </form>
                    </div>
                  </div>

                  <h3 className="admin-section-title">All projects · {projects.length}</h3>
                  <div className="admin-list">
                    {projects.length === 0 ? (
                      <div className="admin-empty">No projects yet. Add one above.</div>
                    ) : (
                      projects.map((p) => (
                        <div key={p.id} className="admin-row-card">
                          {(p.mediaType === 'image' || p.mediaType === 'video') && p.mediaPath ? (
                            <div className="admin-row-thumb">
                              {p.mediaType === 'image' ? (
                                <img src={resolveMediaUrl(p.mediaPath)} alt="" />
                              ) : (
                                <video src={resolveMediaUrl(p.mediaPath)} muted playsInline />
                              )}
                            </div>
                          ) : (
                            <div className="admin-row-thumb admin-thumb-placeholder">No media</div>
                          )}
                          <div className="admin-row-body">
                            <p className="admin-row-title">{p.title}</p>
                            <p className="admin-row-meta">
                              {p.year ? `${p.year} · ` : ''}
                              {p.subtitle || '—'}
                            </p>
                          </div>
                          <div className="admin-row-actions">
                            <button type="button" className="admin-btn-edit" onClick={() => startEditProject(p)}>
                              Edit
                            </button>
                            <button type="button" className="admin-btn-delete" onClick={() => handleDeleteProject(p.id, p.title)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {activeTab === 'messages' && (
                <>
                  <h3 className="admin-section-title">Messages · {messages.length}</h3>
                  {messages.length === 0 ? (
                    <div className="admin-empty">No messages yet.</div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="admin-message-card">
                        <div className="admin-message-head">
                          <strong>{m.name}</strong>
                          <span>{m.email}</span>
                          <span>{m.date ? new Date(m.date).toLocaleString() : ''}</span>
                        </div>
                        <p className="admin-message-body">{m.message}</p>
                        <button type="button" className="admin-btn-delete" onClick={() => handleDeleteMessage(m.id, m.name)}>
                          Delete message
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'testimonials' && (
                <>
                  <details className="admin-help">
                    <summary>Photos and upload</summary>
                    <p>
                      Same as projects: <strong>Upload image</strong> or enter <code>/assets/…</code> / a public{' '}
                      <code>https://</code> URL.
                    </p>
                  </details>

                  <div className="admin-stack">
                    {editingTestimonialId ? (
                      <div className="admin-card admin-card--accent">
                        <div className="admin-card-header">
                          <h2 className="admin-card-title">Edit testimonial</h2>
                          <span className="admin-badge">ID {editingTestimonialId}</span>
                        </div>
                        <form onSubmit={handleUpdateTestimonial}>
                          <div className="admin-form-grid">
                            <Field id="et-name" label="Name">
                              <input
                                id="et-name"
                                className="admin-input"
                                value={editTestimonial.name}
                                onChange={(e) => setEditTestimonial({ ...editTestimonial, name: e.target.value })}
                                required
                              />
                            </Field>
                            <Field id="et-role" label="Role">
                              <input
                                id="et-role"
                                className="admin-input"
                                value={editTestimonial.role}
                                onChange={(e) => setEditTestimonial({ ...editTestimonial, role: e.target.value })}
                                required
                              />
                            </Field>
                            <Field id="et-loc" label="Location" className="admin-field--full">
                              <input
                                id="et-loc"
                                className="admin-input"
                                value={editTestimonial.location}
                                onChange={(e) => setEditTestimonial({ ...editTestimonial, location: e.target.value })}
                              />
                            </Field>
                            <Field
                              id="et-img"
                              label="Photo path or URL"
                              hint="Type a path / URL or upload a headshot (JPEG, PNG, WebP, GIF)."
                              className="admin-field--full"
                            >
                              <AdminImagePathInput
                                id="et-img"
                                value={editTestimonial.image}
                                token={token}
                                setPath={(path) => setEditTestimonial((t) => ({ ...t, image: path }))}
                              />
                            </Field>
                            <Field id="et-tag" label="Tag (optional)">
                              <input
                                id="et-tag"
                                className="admin-input"
                                value={editTestimonial.tag}
                                onChange={(e) => setEditTestimonial({ ...editTestimonial, tag: e.target.value })}
                              />
                            </Field>
                            <Field id="et-quote" label="Quote" className="admin-field--full">
                              <textarea
                                id="et-quote"
                                className="admin-textarea"
                                value={editTestimonial.quote}
                                onChange={(e) => setEditTestimonial({ ...editTestimonial, quote: e.target.value })}
                                required
                              />
                            </Field>
                          </div>
                          <div className="admin-form-actions">
                            <button type="submit" className="admin-btn-primary">
                              Save testimonial
                            </button>
                            <button type="button" className="admin-btn-secondary" onClick={cancelEditTestimonial}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : null}

                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h2 className="admin-card-title">Add testimonial</h2>
                        <span className="admin-badge admin-badge--muted">Create</span>
                      </div>
                      <form onSubmit={handleAddTestimonial}>
                        <div className="admin-form-grid">
                          <Field id="nt-name" label="Name">
                            <input
                              id="nt-name"
                              className="admin-input"
                              value={newTestimonial.name}
                              onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                              required
                            />
                          </Field>
                          <Field id="nt-role" label="Role">
                            <input
                              id="nt-role"
                              className="admin-input"
                              value={newTestimonial.role}
                              onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                              required
                            />
                          </Field>
                          <Field id="nt-loc" label="Location" className="admin-field--full">
                            <input
                              id="nt-loc"
                              className="admin-input"
                              value={newTestimonial.location}
                              onChange={(e) => setNewTestimonial({ ...newTestimonial, location: e.target.value })}
                            />
                          </Field>
                          <Field
                            id="nt-img"
                            label="Photo path or URL"
                            hint="Type a path / URL or upload a headshot (JPEG, PNG, WebP, GIF)."
                            className="admin-field--full"
                          >
                            <AdminImagePathInput
                              id="nt-img"
                              value={newTestimonial.image}
                              token={token}
                              setPath={(path) => setNewTestimonial((t) => ({ ...t, image: path }))}
                            />
                          </Field>
                          <Field id="nt-tag" label="Tag (optional)">
                            <input
                              id="nt-tag"
                              className="admin-input"
                              value={newTestimonial.tag}
                              onChange={(e) => setNewTestimonial({ ...newTestimonial, tag: e.target.value })}
                            />
                          </Field>
                          <Field id="nt-quote" label="Quote" className="admin-field--full">
                            <textarea
                              id="nt-quote"
                              className="admin-textarea"
                              value={newTestimonial.quote}
                              onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                              required
                            />
                          </Field>
                        </div>
                        <div className="admin-form-actions">
                          <button type="submit" className="admin-btn-primary">
                            Add testimonial
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <h3 className="admin-section-title">All testimonials · {testimonials.length}</h3>
                  <div className="admin-list">
                    {testimonials.length === 0 ? (
                      <div className="admin-empty">No testimonials yet.</div>
                    ) : (
                      testimonials.map((t) => (
                        <div key={t.id} className="admin-row-card">
                          {t.image ? (
                            <div className="admin-row-thumb admin-row-thumb--round">
                              <img src={resolveMediaUrl(t.image)} alt="" />
                            </div>
                          ) : (
                            <div className="admin-row-thumb admin-row-thumb--round admin-thumb-placeholder">—</div>
                          )}
                          <div className="admin-row-body">
                            <p className="admin-row-title">{t.name}</p>
                            <p className="admin-row-meta">{t.role}</p>
                          </div>
                          <div className="admin-row-actions">
                            <button type="button" className="admin-btn-edit" onClick={() => startEditTestimonial(t)}>
                              Edit
                            </button>
                            <button type="button" className="admin-btn-delete" onClick={() => handleDeleteTestimonial(t.id, t.name)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {activeTab === 'settings' && (
                <div className="admin-settings-stack">
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h2 className="admin-card-title">Account</h2>
                    </div>
                    <p className="admin-hint admin-hint--block">
                      Signed in as <strong className="admin-hint-strong">{adminUsername || '—'}</strong>.
                    </p>

                    <form className="admin-form-grid admin-form-grid--spaced" onSubmit={handleChangeUsername}>
                      <h3 className="admin-subcard-title admin-field--full">Change username</h3>
                      <Field id="su-name" label="New username" className="admin-field--full">
                        <input
                          id="su-name"
                          className="admin-input"
                          autoComplete="username"
                          value={userNew}
                          onChange={(e) => setUserNew(e.target.value)}
                          minLength={2}
                          maxLength={64}
                          required
                        />
                      </Field>
                      <Field id="su-pwd" label="Current password" className="admin-field--full">
                        <input
                          id="su-pwd"
                          className="admin-input"
                          type="password"
                          autoComplete="current-password"
                          value={userCurrentPwd}
                          onChange={(e) => setUserCurrentPwd(e.target.value)}
                          required
                        />
                      </Field>
                      <div className="admin-field admin-field--full">
                        <button type="submit" className="admin-btn-primary">
                          Update username
                        </button>
                      </div>
                    </form>

                    <form className="admin-form-grid" onSubmit={handleChangePassword}>
                      <h3 className="admin-subcard-title admin-field--full">Change password</h3>
                      <Field id="cp-cur" label="Current password" className="admin-field--full">
                        <input
                          id="cp-cur"
                          className="admin-input"
                          type="password"
                          autoComplete="current-password"
                          value={pwdCurrent}
                          onChange={(e) => setPwdCurrent(e.target.value)}
                          required
                        />
                      </Field>
                      <Field id="cp-new" label="New password (min. 8)">
                        <input
                          id="cp-new"
                          className="admin-input"
                          type="password"
                          autoComplete="new-password"
                          value={pwdNew}
                          onChange={(e) => setPwdNew(e.target.value)}
                          minLength={8}
                          required
                        />
                      </Field>
                      <Field id="cp-conf" label="Confirm new password">
                        <input
                          id="cp-conf"
                          className="admin-input"
                          type="password"
                          autoComplete="new-password"
                          value={pwdConfirm}
                          onChange={(e) => setPwdConfirm(e.target.value)}
                          minLength={8}
                          required
                        />
                      </Field>
                      <div className="admin-field admin-field--full">
                        <button type="submit" className="admin-btn-primary">
                          Update password
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h2 className="admin-card-title">Resume link</h2>
                    </div>
                    <p className="admin-hint admin-hint--block">
                      Path on the site (e.g. <code className="admin-inline-code">/Serge_Ishimwe_Resume.pdf</code>) or external URL.
                    </p>
                    <form onSubmit={handleUpdateResume}>
                      <Field id="resume" label="Resume URL or path" className="admin-field--full">
                        <input
                          id="resume"
                          className="admin-input"
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                          required
                        />
                      </Field>
                      <div className="admin-form-actions admin-form-actions--bare">
                        <button type="submit" className="admin-btn-primary">
                          Save resume link
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
