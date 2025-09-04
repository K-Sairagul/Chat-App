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
    lastEditedAt: { type: Date },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;