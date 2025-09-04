import Todo from "../models/todo.model.js";

// GET /api/todos
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (err) {
    console.error("getTodos error:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

// POST /api/todos
export const addTodo = async (req, res) => {
  try {
    const { text, completeBy } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Text is required" });

    const todoData = {
      userId: req.user._id,
      text: text.trim(),
    };

    if (completeBy) {
      todoData.completeBy = new Date(completeBy);
    }

    const todo = await Todo.create(todoData);
    res.status(201).json(todo);
  } catch (err) {
    console.error("addTodo error:", err);
    res.status(500).json({ error: "Failed to add todo" });
  }
};

// PATCH /api/todos/:id
// Update text, completed, and/or completeBy (all are optional; only provided fields are updated)
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    
    if (typeof req.body.text === "string") updates.text = req.body.text.trim();
    if (typeof req.body.completed === "boolean") updates.completed = req.body.completed;
    if (req.body.completeBy !== undefined) {
      updates.completeBy = req.body.completeBy ? new Date(req.body.completeBy) : null;
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.status(200).json(todo);
  } catch (err) {
    console.error("updateTodo error:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
};

// PATCH /api/todos/:id/toggle  (optional convenience route)
export const toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOne({ _id: id, userId: req.user._id });
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    todo.completed = !todo.completed;
    await todo.save();
    res.status(200).json(todo);
  } catch (err) {
    console.error("toggleTodo error:", err);
    res.status(500).json({ error: "Failed to toggle todo" });
  }
};

// DELETE /api/todos/:id
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("deleteTodo error:", err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
};