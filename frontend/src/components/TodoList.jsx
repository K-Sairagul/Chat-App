import { useEffect, useState } from "react";
import { useTodoStore } from "../store/useTodoStore";

const TodoList = () => {
  const { todos, getTodos, addTodo, updateTodo, toggleTodo, deleteTodo, isLoading } =
    useTodoStore();
  const [text, setText] = useState("");
  const [completeBy, setCompleteBy] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingCompleteBy, setEditingCompleteBy] = useState("");

  useEffect(() => {
    getTodos();
  }, [getTodos]);

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addTodo(text.trim(), completeBy || null);
    setText("");
    setCompleteBy("");
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditingText(todo.text);
    setEditingCompleteBy(todo.completeBy ? new Date(todo.completeBy).toISOString().slice(0, 16) : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingCompleteBy("");
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingText.trim()) return;
    
    const updateData = { text: editingText.trim() };
    if (editingCompleteBy) {
      updateData.completeBy = editingCompleteBy;
    } else {
      updateData.completeBy = null;
    }
    
    await updateTodo(editingId, updateData);
    cancelEdit();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (todo) => {
    if (todo.completed || !todo.completeBy) return false;
    return new Date(todo.completeBy) < new Date();
  };

  const getTimeStatus = (todo) => {
    if (todo.completed) return "completed";
    if (isOverdue(todo)) return "overdue";
    if (todo.completeBy) return "scheduled";
    return "pending";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Task Chat</h1>
              <p className="text-blue-100 text-sm">
                {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
                {todos.filter(t => !t.completed).length > 0 && 
                  ` • ${todos.filter(t => !t.completed).length} pending`}
              </p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-blue-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Task List - Chat-like interface */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-6 shadow-sm max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No tasks yet</h3>
              <p className="text-gray-500">Start by adding your first task below 👇</p>
            </div>
          </div>
        ) : (
          todos.map((t) => (
            <div
              key={t._id}
              className={`flex ${editingId === t._id ? 'items-start' : 'items-start'} gap-3`}
            >
              {/* Avatar/Checkbox */}
              <div className="flex-shrink-0 mt-1">
                {editingId === t._id ? (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                ) : (
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTodo(t._id)}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer mt-1"
                    title={t.completed ? "Mark as incomplete" : "Mark as complete"}
                  />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex-1 min-w-0 ${editingId === t._id ? '' : 'max-w-md'}`}>
                {editingId === t._id ? (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <form onSubmit={submitEdit} className="space-y-3">
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        autoFocus
                        placeholder="Edit your task..."
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 whitespace-nowrap">Due:</label>
                        <input
                          type="datetime-local"
                          value={editingCompleteBy}
                          onChange={(e) => setEditingCompleteBy(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button 
                          type="submit" 
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                          disabled={!editingText.trim()}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className={`rounded-lg p-3 ${t.completed ? 'bg-gray-100' : 'bg-white'} shadow-sm border border-gray-200`}>
                    <div className="flex justify-between items-start">
                      <p className={`text-gray-800 ${t.completed ? 'line-through text-gray-500' : ''}`}>
                        {t.text}
                      </p>
                      <div className="flex gap-1 ml-2">
                        {!t.completed && (
                          <button
                            onClick={() => startEdit(t)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                            title="Edit task"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteTodo(t._id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                          title="Delete task"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {t.completeBy && (
                      <div className={`flex items-center mt-2 text-xs ${
                        getTimeStatus(t) === 'overdue' ? 'text-red-500' : 
                        getTimeStatus(t) === 'completed' ? 'text-green-500' : 
                        'text-gray-500'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {formatDateTime(t.completeBy)}
                          {getTimeStatus(t) === 'overdue' && ' • Overdue'}
                          {getTimeStatus(t) === 'completed' && ' • Completed'}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(t.createdAt).toLocaleDateString()} • {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area - Chat style */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={submitAdd} className="flex gap-2">
          <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a new task..."
              className="w-full bg-transparent py-3 outline-none placeholder-gray-500"
            />
            <button 
              type="button"
              className="text-gray-400 hover:text-blue-600 p-1"
              onClick={() => document.getElementById('datetime-input').focus()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              id="datetime-input"
              type="datetime-local"
              value={completeBy}
              onChange={(e) => setCompleteBy(e.target.value)}
              className="hidden"
            />
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!text.trim()}
            title="Add task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>
        
        {completeBy && (
          <div className="text-xs text-blue-600 mt-2 ml-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Due: {formatDateTime(completeBy)}
            <button 
              onClick={() => setCompleteBy("")}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;