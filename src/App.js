import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://raaznotes-backend.onrender.com";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [reminder, setReminder] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [editId, setEditId] = useState(null);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/notes`);
      setNotes(res.data);
      localStorage.setItem("notes", JSON.stringify(res.data));
    } catch {
      const local = localStorage.getItem("notes");
      if (local) setNotes(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    const draft = localStorage.getItem("draft");
    if (draft) {
      const { title, content } = JSON.parse(draft);
      setTitle(title);
      setContent(content);
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem("draft", JSON.stringify({ title, content }));
  }, [title, content]);

  const addOrUpdateNote = async () => {
    if (!title.trim() || !content.trim()) return alert("Title aur Content dono chahiye");

    const noteData = { title, content, tag, reminder, color };

    try {
      if (editId) {
        await axios.put(`${API_BASE}/api/notes/${editId}`, noteData);
        setEditId(null);
        showSavedMsg("Note Updated!");
      } else {
        await axios.post(`${API_BASE}/api/notes`, noteData);
        showSavedMsg("Note Added!");
      }
      setTitle("");
      setContent("");
      setTag("");
      setReminder("");
      setColor("#ffffff");
      fetchNotes();
    } catch {
      alert("Backend se connect nahi ho pa raha.");
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Kya aap delete karna chahte hain?")) return;
    await axios.delete(`${API_BASE}/api/notes/${id}`);
    fetchNotes();
  };

  const editNote = (n) => {
    setTitle(n.title);
    setContent(n.content);
    setTag(n.tag || "");
    setReminder(n.reminder || "");
    setColor(n.color || "#ffffff");
    setEditId(n._id);
  };

  const shareNote = (note) => {
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.content,
      });
    } else {
      navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      alert("Copied to clipboard!");
    }
  };

  const showSavedMsg = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const filteredNotes = notes
    .filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        (n.tag || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return (b.pinned === true) - (a.pinned === true);
    });

  return (
    <div className={`page ${dark ? "dark" : ""}`}>
      <header className="header">
        <h1>📝 Raaz Notes Pro</h1>
        <p className="sub">Your Smart MERN Notes App</p>

        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search..."
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="pinned">Pinned First</option>
          </select>
          <button className="toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="container">
        <section className="card form-card">
          <label>Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
          />

          <label>Content ({content.length}/300)</label>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 300))}
            placeholder="Write your note..."
          />

          <label>Tag</label>
          <input
            className="input"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. Study, Work, Personal"
          />

          <label>Reminder (optional)</label>
          <input
            type="datetime-local"
            className="input"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
          />

          <label>Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: "50px", height: "30px", cursor: "pointer" }}
          />

          <button className="btn" onClick={addOrUpdateNote}>
            {editId ? "Update Note" : "Add Note"}
          </button>

          {savedMsg && <div className="saved-msg">{savedMsg}</div>}
        </section>

        <section className="notes">
          <h2>📚 Saved Notes</h2>
          {loading ? (
            <p>Loading...</p>
          ) : filteredNotes.length === 0 ? (
            <p>No notes found.</p>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((n) => (
                <article
                  key={n._id}
                  className="note-card fade-in"
                  style={{ background: n.color || "#fff" }}
                >
                  <div className="note-header">
                    <h3>{n.title}</h3>
                    <div className="note-actions">
                      <button onClick={() => editNote(n)}>✏️</button>
                      <button onClick={() => deleteNote(n._id)}>🗑️</button>
                      <button onClick={() => shareNote(n)}>📤</button>
                    </div>
                  </div>
                  <p>{n.content}</p>
                  {n.tag && <span className="note-tag">🏷️ {n.tag}</span>}
                  {n.reminder && (
                    <small className="note-date">
                      ⏰ {new Date(n.reminder).toLocaleString()}
                    </small>
                  )}
                  <small className="note-date">
                    📅 {new Date(n.createdAt).toLocaleString()}
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>✨ Made by Raaz • Advanced MERN Notes • 2025</p>
      </footer>
    </div>
  );
}

export default App;
