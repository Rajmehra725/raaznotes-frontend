import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/notes`);
      setNotes(res.data);
      localStorage.setItem("notes", JSON.stringify(res.data)); // offline support
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Backend se connect nahi ho pa raha. Local notes dikha rahe hain.");
      const local = localStorage.getItem("notes");
      if (local) setNotes(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addOrUpdateNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title aur Content dono chahiye");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_BASE}/api/notes/${editId}`, { title, content });
        setEditId(null);
      } else {
        await axios.post(`${API_BASE}/api/notes`, { title, content });
      }
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (err) {
      console.error("Save error:", err);
      alert("Note save karne me error. Backend check karo.");
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete karna hai?")) return;
    try {
      await axios.delete(`${API_BASE}/api/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete karne me problem aayi.");
    }
  };

  const editNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditId(note._id);
  };

  const togglePin = async (id) => {
    try {
      await axios.patch(`${API_BASE}/api/notes/${id}/pin`);
      fetchNotes();
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  const filteredNotes = notes
    .filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.pinned === true) - (a.pinned === true));

  return (
    <div className={`page ${dark ? "dark" : ""}`}>
      <header className="header">
        <h1>📝 Raaz Notes</h1>
        <p className="sub">Advanced MERN Notes App — Plain CSS Edition</p>
        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search notes..."
          />
          <button className="toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <main className="container">
        <section className="card form-card">
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note ka title"
          />

          <label className="label">Content</label>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note ka content"
          />

          <button className="btn" onClick={addOrUpdateNote}>
            {editId ? "Update Note" : "Add Note"}
          </button>
        </section>

        <section className="notes">
          <h2 className="notes-title">Saved Notes</h2>
          {loading ? (
            <p>Loading...</p>
          ) : filteredNotes.length === 0 ? (
            <p>No notes found.</p>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((n) => (
                <article
                  key={n._id}
                  className={`note-card ${n.pinned ? "pinned" : ""}`}
                >
                  <div className="note-header">
                    <h3 className="note-title">{n.title}</h3>
                    <div className="note-actions">
                      <button onClick={() => togglePin(n._id)} title="Pin">
                        {n.pinned ? "📌" : "📍"}
                      </button>
                      <button onClick={() => editNote(n)}>✏️</button>
                      <button onClick={() => deleteNote(n._id)}>🗑️</button>
                    </div>
                  </div>
                  <p className="note-content">{n.content}</p>
                  <small className="note-date">
                    {new Date(n.createdAt).toLocaleString()}
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>✨ Built by Raaz • With Love • MERN Edition</p>
      </footer>
    </div>
  );
}

export default App;
