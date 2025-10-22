import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

// ✅ API base (change this if needed)
const API_BASE = process.env.REACT_APP_API_URL || "https://raaz-notes-backend.onrender.com";

// ✅ Login credentials (simple frontend check)
const USERNAME = "raaz";
const PASSWORD = "12345";

function App() {
  // ---------------- STATE ----------------
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [reminder, setReminder] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  // image
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // ---------------- FETCH NOTES ----------------
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/notes`);
      setNotes(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Backend se connect nahi ho pa raha!");
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchNotes();
  }, [isLoggedIn]);

  // ---------------- IMAGE UPLOAD ----------------
 const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await axios.post(`${API_BASE}/api/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setImageUrl(res.data.imageUrl);
    alert("✅ Image uploaded successfully!");
  } catch (err) {
    console.error("Upload failed:", err);
    alert("❌ Image upload failed!");
  }
};

  // ---------------- SAVE NOTE ----------------
  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title aur Content dono chahiye!");
      return;
    }

    const noteData = { title, content, tag, color, reminder, image };

    try {
      if (editId) {
        await axios.put(`${API_BASE}/api/notes/${editId}`, noteData);
        setEditId(null);
      } else {
        await axios.post(`${API_BASE}/api/notes`, noteData);
      }
      resetForm();
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Error saving note!");
    }
  };

  // ---------------- DELETE NOTE ----------------
  const deleteNote = async (id) => {
    if (!window.confirm("Kya aap sach me delete karna chahte ho?")) return;
    try {
      await axios.delete(`${API_BASE}/api/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Error deleting note!");
    }
  };

  // ---------------- EDIT NOTE ----------------
  const editNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setTag(note.tag || "");
    setColor(note.color || "#ffffff");
    setReminder(note.reminder || "");
    setImage(note.image || null);
    setEditId(note._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- RESET FORM ----------------
  const resetForm = () => {
    setTitle("");
    setContent("");
    setTag("");
    setColor("#ffffff");
    setReminder("");
    setImage(null);
    setImagePreview("");
  };

  // ---------------- LOGIN ----------------
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === USERNAME && loginPass === PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem("raazNotesLogin", "true");
    } else {
      alert("❌ Username ya password galat hai!");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("raazNotesLogin") === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("raazNotesLogin");
    setIsLoggedIn(false);
  };

  // ---------------- FILTERED NOTES ----------------
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tag?.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- LOGIN SCREEN ----------------
  if (!isLoggedIn) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card p-4 shadow-lg" style={{ maxWidth: 400 }}>
          <h3 className="text-center mb-3">
            <i className="bi bi-journal-text text-primary"></i> Raaz Notes Login
          </h3>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-primary">
          <i className="bi bi-journal-richtext"></i> Raaz Notes
        </h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>

      {/* CREATE NOTE */}
      <div className="card p-3 shadow-sm mb-4">
        <h5 className="mb-3">{editId ? "✏️ Edit Note" : "📝 Create Note"}</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="color"
              className="form-control form-control-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              title="Choose note color"
            />
          </div>
          <div className="col-md-6">
            <input
              type="datetime-local"
              className="form-control"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleImageUpload}
            />
          </div>
          {imagePreview && (
            <div className="text-center">
              <img
                src={imagePreview}
                alt="preview"
                className="img-fluid rounded shadow-sm mt-2"
                style={{ maxHeight: 200 }}
              />
            </div>
          )}
          <div className="col-12">
            <textarea
              className="form-control"
              placeholder="Write your note here..."
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
          <div className="col-12 text-center">
            <button className="btn btn-success px-4" onClick={saveNote}>
              <i className="bi bi-save"></i> {editId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="input-group mb-3 shadow-sm">
        <span className="input-group-text bg-primary text-white">
          <i className="bi bi-search"></i>
        </span>
        <input
          className="form-control"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* NOTES DISPLAY */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p>Loading notes...</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div className="col-md-4" key={note._id}>
                <div
                  className="card shadow-sm h-100"
                  style={{ backgroundColor: note.color || "#fff" }}
                >
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{note.title}</h5>
                    {note.tag && <span className="badge bg-secondary">{note.tag}</span>}
                    {note.image && (
                      <img
                        src={note.image}
                        alt="note"
                        className="img-fluid rounded mt-2"
                        style={{ maxHeight: 200 }}
                      />
                    )}
                    <p className="card-text mt-2">{note.content}</p>
                    {note.reminder && (
                      <p className="text-muted small">
                        <i className="bi bi-alarm"></i> {new Date(note.reminder).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="card-footer d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => editNote(note)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteNote(note._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No notes found...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
