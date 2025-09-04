// pages/NotesPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useNoteStore } from "../store/useNoteStore";
import { useAuthStore } from "../store/useAuthStore";

const NotesPage = () => {
  const { friendId } = useParams();
  const { authUser } = useAuthStore();
  const {
    notes,
    isLoading,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    subscribeToNotes,
    unsubscribeFromNotes,
  } = useNoteStore();

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (!friendId) return;
    // load notes initially
    loadNotes(friendId);
    // setup socket subscription
    subscribeToNotes(friendId);
    return () => unsubscribeFromNotes(friendId);
  }, [friendId, loadNotes, subscribeToNotes, unsubscribeFromNotes]);

  if (!authUser) return <Navigate to="/login" replace />;

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Call API only, don't directly update local state
    await addNote(friendId, text.trim());

    setText("");
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setEditingText(note.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingText.trim()) return;

    await updateNote(editingId, editingText.trim());
    cancelEdit();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-100 flex items-center justify-between">
        <h1 className="text-xl font-bold">📝 Shared Notes</h1>
        <div className="flex items-center gap-3">
          <Link to="/" className="link link-primary">
            ← Back to Chat
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 bg-base-200 overflow-y-auto">
        {/* Add form */}
        <form onSubmit={submitAdd} className="flex gap-2 mb-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note..."
            className="input input-bordered w-full"
          />
          <button className="btn btn-primary">Add</button>
        </form>

        {/* Notes list */}
        {isLoading ? (
          <p>Loading…</p>
        ) : notes.length === 0 ? (
          <p className="opacity-70">No notes yet. Add the first one! ✨</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note._id}
                className="p-3 rounded-xl bg-base-100 border border-base-300 flex items-center gap-3"
              >
                {editingId === note._id ? (
                  <form
                    onSubmit={submitEdit}
                    className="flex flex-1 items-center gap-2"
                  >
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="input input-bordered flex-1"
                      autoFocus
                    />
                    <button className="btn btn-success btn-sm">Save</button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1">{note.text}</span>
                    <div className="flex items-center gap-2">
                      {note.createdBy === authUser._id && (
                        <>
                          <button
                            onClick={() => startEdit(note)}
                            className="btn btn-ghost btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNote(note._id)}
                            className="btn btn-error btn-sm text-white"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
