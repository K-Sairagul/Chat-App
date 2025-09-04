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

  addTodo: async (text, completeBy = null) => {
    try {
      const res = await axiosInstance.post("/todos", { text, completeBy });
      set({ todos: [res.data, ...get().todos] });
      return res.data;
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add todo");
      throw err;
    }
  },

  updateTodo: async (id, data) => {
    try {
      const res = await axiosInstance.patch(`/todos/${id}`, data);
      set({
        todos: get().todos.map((t) => (t._id === id ? res.data : t)),
      });
      return res.data;
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update todo");
      throw err;
    }
  },

  toggleTodo: async (id) => {
    try {
      const res = await axiosInstance.patch(`/todos/${id}/toggle`);
      set({
        todos: get().todos.map((t) => (t._id === id ? res.data : t)),
      });
      return res.data;
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to toggle todo");
      throw err;
    }
  },

  deleteTodo: async (id) => {
    try {
      await axiosInstance.delete(`/todos/${id}`);
      set({ todos: get().todos.filter((t) => t._id !== id) });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete todo");
      throw err;
    }
  },
}));