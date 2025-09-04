// routes/note.routes.js
import express from "express";
import { protectRoute as verifyToken } from "../middleware/auth.middleware.js";
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";

const router = express.Router();

// All routes require auth
router.get("/:friendId", verifyToken, getNotes);
router.post("/:friendId", verifyToken, addNote);
router.put("/:noteId", verifyToken, updateNote);
router.delete("/:noteId", verifyToken, deleteNote);

export default router;
