// models/note.model.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: v => Array.isArray(v) && v.length === 2, // exactly 2 users
    },
    text: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;
