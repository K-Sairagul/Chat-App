// controllers/note.controller.js
import Note from "../models/note.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

/**
 * Helper: emit to both users (if connected)
 */
const emitToNoteUsers = (userA, userB, event, payload) => {
  // creator (userA) is connected through their own socket room? You already use direct socketId mapping.
  const aSock = getReceiverSocketId(userA?.toString());
  if (aSock) io.to(aSock).emit(event, payload);

  const bSock = getReceiverSocketId(userB?.toString());
  if (bSock) io.to(bSock).emit(event, payload);
};

// ✅ Get notes between you and a friend
export const getNotes = async (req, res) => {
  try {
    const { friendId } = req.params;
    const notes = await Note.find({
      userIds: { $all: [req.user._id, friendId] },
    }).sort({ createdAt: 1 });

    res.json(notes);
  } catch (err) {
    console.error("getNotes error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// ✅ Add a new note
export const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    const { friendId } = req.params;

    const newNote = await Note.create({
      userIds: [req.user._id, friendId],
      text,
      createdBy: req.user._id,
    });

    // Re-fetch with timestamps populated (already fine) and emit
    emitToNoteUsers(req.user._id, friendId, "notes:added", newNote);

    res.status(201).json(newNote);
  } catch (err) {
    console.error("addNote error:", err);
    res.status(500).json({ error: "Failed to add note" });
  }
};

// ✅ Update a note (only creator can edit)
export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { text } = req.body;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ error: "Note not found" });

    // Only creator can edit
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not allowed to update this note" });
    }

    note.text = text;
    await note.save();

    emitToNoteUsers(note.userIds[0], note.userIds[1], "notes:updated", note);

    res.json(note);
  } catch (err) {
    console.error("updateNote error:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
};

// ✅ Delete a note (only creator can delete)
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ error: "Note not found" });

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not allowed to delete this note" });
    }

    await note.deleteOne();

    emitToNoteUsers(note.userIds[0], note.userIds[1], "notes:deleted", { _id: noteId });

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("deleteNote error:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
};
