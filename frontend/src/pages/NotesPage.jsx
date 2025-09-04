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
    loadNotes(friendId);
    subscribeToNotes(friendId);
    return () => unsubscribeFromNotes(friendId);
  }, [friendId, loadNotes, subscribeToNotes, unsubscribeFromNotes]);

  if (!authUser) return <Navigate to="/login" replace />;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Shared Notes</h1>
            <p className="text-xs text-gray-500">Collaborate with your friend</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          📝
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Notes list */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-1">No notes yet</p>
              <p className="text-sm">Start a conversation with notes!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className={`p-3 rounded-lg max-w-xs md:max-w-md ${
                  note.createdBy._id === authUser._id
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {editingId === note._id ? (
                  <form
                    onSubmit={submitEdit}
                    className="flex flex-col gap-2"
                  >
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className={`input input-sm w-full ${
                        note.createdBy._id === authUser._id
                          ? 'bg-blue-400 text-white placeholder-blue-200'
                          : 'bg-gray-50'
                      }`}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button"
                        onClick={cancelEdit}
                        className="btn btn-xs btn-ghost"
                      >
                        Cancel
                      </button>
                      <button className="btn btn-xs btn-success">
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mb-2">{note.text}</div>
                    
                    {/* Timestamps */}
                    <div className={`text-xs flex justify-between items-center ${
                      note.createdBy._id === authUser._id ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      <span>
                        {note.lastEditedAt ? 'Edited • ' : ''}
                        {formatDate(note.lastEditedAt || note.createdAt)}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    {note.createdBy._id === authUser._id && (
                      <div className="flex gap-1 mt-2 justify-end">
                        <button
                          onClick={() => startEdit(note)}
                          className="btn btn-xs btn-ghost btn-circle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteNote(note._id)}
                          className="btn btn-xs btn-ghost btn-circle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add form */}
        <form onSubmit={submitAdd} className="flex gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note..."
            className="input input-bordered flex-1"
          />
          <button 
            className="btn btn-primary"
            disabled={!text.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotesPage;