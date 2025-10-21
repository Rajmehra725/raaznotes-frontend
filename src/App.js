import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://raaz-notes-backend.onrender.com";

// Static Login Credentials
const USERNAME = "raaz";
const PASSWORD = "12345";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [reminder, setReminder] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [dark, setDark] = useState(false);
  const [expanded, setExpanded] = useState({}); // ✅ added
  const [loading, setLoading] = useState(false);

  // Fetch Notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/notes`);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
      const local = localStorage.getItem("notes");
      if (local) setNotes(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) fetchNotes();
    const draft = localStorage.getItem("draft");
    if (draft) {
      const d = JSON.parse(draft);
      setTitle(d.title || "");
      setContent(d.content || "");
    }
  }, [loggedIn]);

  useEffect(() => {
    localStorage.setItem("draft", JSON.stringify({ title, content }));
  }, [title, content]);

  // ✅ Login
  const handleLogin = () => {
    if (loginUser === USERNAME && loginPass === PASSWORD) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password!");
    }
  };

  // ✅ Add or Update Note
  const saveNote = async () => {
    if (!title.trim() || !content.trim())
      return alert("Title aur Content dono chahiye!");

    const noteData = { title, content, tag, reminder, color };
    try {
      if (editId) {
        await axios.put(`${API_BASE}/api/notes/${editId}`, noteData);
        setEditId(null);
      } else {
        await axios.post(`${API_BASE}/api/notes`, noteData);
      }
      setTitle("");
      setContent("");
      setTag("");
      setReminder("");
      setColor("#ffffff");
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Backend se connect nahi ho pa raha.");
    }
  };

  // ✅ Delete
  const deleteNote = async (id) => {
    if (!window.confirm("Kya aap delete karna chahte hain?")) return;
    try {
      await axios.delete(`${API_BASE}/api/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  // ✅ Edit
  const editNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setTag(note.tag || "");
    setReminder(note.reminder || "");
    setColor(note.color || "#ffffff");
    setEditId(note._id);
  };

  // ✅ Share
  const shareNote = (note) => {
    if (navigator.share) {
      navigator.share({ title: note.title, text: note.content });
    } else {
      navigator.clipboard.writeText(`${note.title}\n${note.content}`);
      alert("Copied to clipboard!");
    }
  };

  // ✅ Toggle Expand
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Filter + Sort
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.tag || "").toLowerCase().includes(search.toLowerCase())
  );

  // ========================== LOGIN PAGE ==============================
  if (!loggedIn) {
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light"
        style={{ background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" }}
      >
        <div
          className="card shadow-lg p-4 text-center animate__animated animate__fadeIn"
          style={{ width: "350px", borderRadius: "20px" }}
        >
          <h3 className="mb-3 fw-bold text-primary">🔐 Raaz Notes Login</h3>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Username"
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
          />
          <button className="btn btn-primary w-100 mb-2" onClick={handleLogin}>
            <i className="bi bi-box-arrow-in-right"></i> Login
          </button>
          {loginError && <p className="text-danger small">{loginError}</p>}
          <p className="small mt-3 text-secondary">© 2025 Raaz Notes Pro</p>
        </div>
      </div>
    );
  }

  // ========================= MAIN APP ================================
  return (
    <div className={`container-fluid py-3 ${dark ? "bg-dark text-light" : "bg-light"}`}>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">
          <i className="bi bi-journal-text me-2"></i>Raaz Notes
        </h2>
        <div className="d-flex gap-2">
          <input
            type="text"
            placeholder="🔍 Search..."
            className="form-control"
            style={{ maxWidth: "200px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary" onClick={() => setDark(!dark)}>
            {dark ? <i className="bi bi-sun"></i> : <i className="bi bi-moon"></i>}
          </button>
        </div>
      </header>

      <div className="card shadow p-3 mb-4" style={{ borderRadius: "15px" }}>
        <h5 className="mb-3 fw-bold text-secondary">
          <i className="bi bi-plus-circle me-2"></i>{editId ? "Update Note" : "Create Note"}
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Tag (optional)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <div className="col-12">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Write your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
          <div className="col-md-4">
            <input
              type="datetime-local"
              className="form-control"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="color"
              className="form-control form-control-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              title="Choose color"
            />
          </div>
          <div className="col-md-4 text-end">
            <button className="btn btn-success px-4" onClick={saveNote}>
              <i className="bi bi-check2-circle me-1"></i>
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary"></div>
          <p>Loading notes...</p>
        </div>
      )}

      <div className="row g-3">
        {filteredNotes.map((note) => (
          <div className="col-md-4 col-sm-6" key={note._id}>
            <div
              className="card shadow-sm border-0 h-100"
              style={{
                backgroundColor: note.color || "#fff",
                borderRadius: "15px",
                overflow: "hidden",
              }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="card-title fw-bold">{note.title}</h5>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => editNote(note)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteNote(note._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => shareNote(note)}>
                      <i className="bi bi-share"></i>
                    </button>
                  </div>
                </div>
                <p className={`mt-2 ${expanded[note._id] ? "" : "text-truncate"}`}>{note.content}</p>

                {note.tag && <span className="badge bg-info me-2">🏷️ {note.tag}</span>}
                {note.reminder && (
                  <small className="text-muted d-block mt-1">
                    ⏰ {new Date(note.reminder).toLocaleString()}
                  </small>
                )}
                <small className="text-muted d-block">
                  📅 {new Date(note.createdAt).toLocaleString()}
                </small>

                <button
                  className="btn btn-link mt-2 p-0"
                  onClick={() => toggleExpand(note._id)}
                >
                  {expanded[note._id] ? "Show Less" : "Show More"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="text-center mt-4 py-3 text-secondary">
        <p>✨ Made by Raaz • MERN Notes Pro 2025</p>
      </footer>
    </div>
  );
}

export default App;
