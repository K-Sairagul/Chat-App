import { Link } from "react-router-dom";
import TodoList from "../components/TodoList";
import Sidebar from "../components/Sidebar"; // optional, if you use this layout

const TodoPage = () => {
  return (
    <div className="flex h-screen">
      {/* Optional sidebar to keep Settings & To-Do together */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-base-300 bg-base-100 flex items-center justify-between">
          <h1 className="text-xl font-bold">📝 To-Do List</h1>
          <div className="flex items-center gap-3">
            <Link to="/settings" className="link link-primary">
              ⚙️ Settings
            </Link>
            <Link to="/" className="link link-primary">
              ← Back to Chat
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 bg-base-200 overflow-y-auto">
          <TodoList />
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
