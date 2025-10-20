import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/notes`);
      setNotes(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Backend se connect nahi ho pa raha. URL check karo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  const addNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title aur Content dono chahiye");
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/notes`, { title, content });
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (err) {
      console.error("Add error:", err);
      alert("Note add karne me error. Backend check karo.");
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>📝 Raaz Notes</h1>
        <p className="sub">Simple MERN Notes app — Plain CSS version</p>
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

          <button className="btn" onClick={addNote}>Add Note</button>
        </section>

        <section className="notes">
          <h2 className="notes-title">Saved Notes</h2>
          {loading ? (
            <p>Loading...</p>
          ) : notes.length === 0 ? (
            <p>No notes saved.</p>
          ) : (
            <div className="notes-grid">
              {notes.map((n) => (
                <article key={n._id} className="note-card">
                  <h3 className="note-title">{n.title}</h3>
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
        <p>Built by Raaz • Simple CSS • MERN</p>
      </footer>
    </div>
  );
}

export default App;
