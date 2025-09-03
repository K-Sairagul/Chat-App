import { useEffect, useState } from "react";
import { useTodoStore } from "../store/useTodoStore";

const TodoList = () => {
  const { todos, getTodos, addTodo, updateTodo, toggleTodo, deleteTodo, isLoading } =
    useTodoStore();
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    getTodos();
  }, [getTodos]);

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addTodo(text.trim());
    setText("");
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditingText(todo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingText.trim()) return;
    await updateTodo(editingId, { text: editingText.trim() });
    cancelEdit();
  };

  return (
    <div className="max-w-xl">
      {/* Add */}
      <form onSubmit={submitAdd} className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task..."
          className="input input-bordered flex-1"
        />
        <button className="btn btn-primary">Add</button>
      </form>

      {/* List */}
      {isLoading ? (
        <p>Loading...</p>
      ) : todos.length === 0 ? (
        <p className="text-base-content/60">No tasks yet. Add your first one! 🎉</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t._id}
              className="p-3 bg-base-100 border border-base-300 rounded flex items-center gap-3"
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTodo(t._id)}
                className="checkbox"
                title="Toggle complete"
              />

              {editingId === t._id ? (
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
                  <span
                    className={`flex-1 ${
                      t.completed ? "line-through text-base-content/50" : ""
                    }`}
                    title={new Date(t.createdAt).toLocaleString()}
                  >
                    {t.text}
                  </span>

                  <button
                    onClick={() => startEdit(t)}
                    className="btn btn-info btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(t._id)}
                    className="btn btn-error btn-sm"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
