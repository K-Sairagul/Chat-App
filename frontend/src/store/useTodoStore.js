import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useTodoStore = create((set, get) => ({
  todos: [],
  isLoading: false,

  getTodos: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/todos");
      set({ todos: res.data });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to fetch todos");
    } finally {
      set({ isLoading: false });
    }
  },

  addTodo: async (text) => {
    try {
      const res = await axiosInstance.post("/todos", { text });
      set({ todos: [res.data, ...get().todos] });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add todo");
    }
  },

  updateTodo: async (id, data) => {
    try {
      const res = await axiosInstance.patch(`/todos/${id}`, data);
      set({
        todos: get().todos.map((t) => (t._id === id ? res.data : t)),
      });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update todo");
    }
  },

  toggleTodo: async (id) => {
    try {
      const res = await axiosInstance.patch(`/todos/${id}/toggle`);
      set({
        todos: get().todos.map((t) => (t._id === id ? res.data : t)),
      });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to toggle todo");
    }
  },

  deleteTodo: async (id) => {
    try {
      await axiosInstance.delete(`/todos/${id}`);
      set({ todos: get().todos.filter((t) => t._id !== id) });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete todo");
    }
  },
}));
