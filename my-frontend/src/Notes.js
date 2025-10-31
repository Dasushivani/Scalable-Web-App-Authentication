import { useEffect, useState } from "react";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ New search state
  const token = localStorage.getItem("token");

  // Fetch notes on load
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setNotes)
      .catch((err) => console.error("Error fetching notes:", err));
  }, [token]);

  // Create or update note
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId
      ? `http://localhost:5000/api/notes/${editingId}`
      : "http://localhost:5000/api/notes";

    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || "Error");

    const updatedNotes = editingId
      ? notes.map((n) => (n._id === editingId ? data.note : n))
      : [...notes, data.note];

    setNotes(updatedNotes);
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  // Delete note
  const handleDelete = async (id) => {
    const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || "Error");

    setNotes(notes.filter((n) => n._id !== id));
  };

  // Start editing
  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note._id);
  };

  // Filter notes by search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-2xl mx-auto bg-yellow-50 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-yellow-700">Your Notes 📝</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          {editingId ? "Update Note" : "Add Note"}
        </button>
      </form>

      {/* ✅ Search bar */}
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 mb-4 border rounded"
      />

      <ul className="space-y-4">
        {filteredNotes.map((note) => (
          <li key={note._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-lg">{note.title}</h3>
            <p className="text-gray-700">{note.content}</p>
            {note.createdAt && (
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(note.createdAt).toLocaleString()}
              </p>
            )}
            {note.updatedAt && (
              <p className="text-sm text-gray-500">
                Updated: {new Date(note.updatedAt).toLocaleString()}
              </p>
            )}
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleEdit(note)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;