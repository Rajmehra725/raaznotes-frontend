import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

// ✅ Backend API URL (Render)
const API_BASE = process.env.REACT_APP_API_URL;

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

  // ✅ Fetch notes from backend
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/notes`);
      console.log("✅ Backend response:", res.data);
      setNotes(res.data);
      localStorage.setItem("notes", JSON.stringify(res.data));
    } catch (err) {
      console.error("❌ Backend error:", err);
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

  useEffect(() => {
    localStorage.setItem("draft", JSON.stringify({ title, content }));
  }, [title, content]);

  // ✅ Add or update note
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
      setTitle(""); setContent(""); setTag(""); setReminder(""); setColor("#ffffff");
      fetchNotes();
    } catch (err) {
      console.error("Backend error:", err);
      alert("Backend se connect nahi ho pa raha.");
    }
  };

  // ✅ Delete note
  const deleteNote = async (id) => {
    if (!window.confirm("Kya aap delete karna chahte hain?")) return;
    try {
      await axios.delete(`${API_BASE}/api/notes/${id}`, {
        headers: { "Content-Type": "application/json" }
      });
      fetchNotes();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed!");
    }
  };

  // ✅ Edit note
  const editNote = (n) => {
    setTitle(n.title); setContent(n.content); setTag(n.tag || "");
    setReminder(n.reminder || ""); setColor(n.color || "#ffffff"); setEditId(n._id);
  };

  // ✅ Share note
  const shareNote = (note) => {
    if (navigator.share) navigator.share({ title: note.title, text: note.content });
    else { navigator.clipboard.writeText(`${note.title}\n\n${note.content}`); alert("Copied!"); }
  };

  const showSavedMsg = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2000); };

  // ✅ Filter & sort notes
  const filteredNotes = notes
    .filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.tag || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sort === "newest"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : sort === "oldest"
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : (b.pinned === true) - (a.pinned === true)
    );

  return (
    <div className={`page ${dark ? "dark" : ""}`}>
      <header className="header">
        <h1>📝 Raaz Notes Pro</h1>
        <p className="sub">Your Smart MERN Notes App</p>
        <div className="toolbar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search..." />
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="pinned">Pinned First</option>
          </select>
          <button onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </header>

      <main className="container">
        {/* ✅ Loading overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading notes...</p>
          </div>
        )}

        <section className="card form-card">
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..." />
          <label>Content ({content.length}/300)</label>
          <textarea value={content} onChange={e => setContent(e.target.value.slice(0, 300))} placeholder="Write your note..." />
          <label>Tag</label>
          <input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. Study, Work, Personal" />
          <label>Reminder (optional)</label>
          <input type="datetime-local" value={reminder} onChange={e => setReminder(e.target.value)} />
          <label>Color</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: "50px", height: "30px", cursor: "pointer" }} />
          <button onClick={addOrUpdateNote}>{editId ? "Update Note" : "Add Note"}</button>
          {savedMsg && <div className="saved-msg">{savedMsg}</div>}
        </section>

        <section className="notes">
          <h2>📚 Saved Notes</h2>
          {filteredNotes.length === 0 && !loading && <p>No notes found.</p>}
          <div className="notes-grid">
            {filteredNotes.map(n => (
              <article key={n._id} style={{ background: n.color || "#fff" }}>
                <div className="note-header">
                  <h3>{n.title}</h3>
                  <div className="note-actions">
                    <button onClick={() => editNote(n)} disabled={loading}>✏️</button>
                    <button onClick={() => deleteNote(n._id)} disabled={loading}>🗑️</button>
                    <button onClick={() => shareNote(n)}>📤</button>
                  </div>
                </div>
                <p>{n.content}</p>
                {n.tag && <span>🏷️ {n.tag}</span>}
                {n.reminder && <small>⏰ {new Date(n.reminder).toLocaleString()}</small>}
                <small>📅 {new Date(n.createdAt).toLocaleString()}</small>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>✨ Made by Raaz • Advanced MERN Notes • 2025</p>
      </footer>
    </div>
  );
}

export default App;
