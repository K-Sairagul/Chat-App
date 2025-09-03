import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getTodos, addTodo, updateTodo, toggleTodo, deleteTodo } from "../controllers/todo.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getTodos);
router.post("/", addTodo);
router.patch("/:id", updateTodo);        // update text and/or completed
router.patch("/:id/toggle", toggleTodo); // optional, quick toggle
router.delete("/:id", deleteTodo);

export default router;
