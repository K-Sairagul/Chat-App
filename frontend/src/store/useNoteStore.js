import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useNoteStore = create((set, get) => ({
  notes: [],
  isLoading: false,
  friendId: null,

  // Load notes for a friend
  loadNotes: async (friendId) => {
    set({ isLoading: true, friendId });
    try {
      const res = await axiosInstance.get(`/notes/${friendId}`);
      set({ notes: res.data });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load notes");
    } finally {
      set({ isLoading: false });
    }
  },

  // Add note (only API call — no local push, socket will handle)
  addNote: async (friendId, text) => {
    try {
      await axiosInstance.post(`/notes/${friendId}`, { text });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to add note");
    }
  },

  // Update note
  updateNote: async (noteId, text) => {
    try {
      await axiosInstance.put(`/notes/${noteId}`, { text });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to update note");
    }
  },

  // Delete note
  deleteNote: async (noteId) => {
    try {
      await axiosInstance.delete(`/notes/${noteId}`);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to delete note");
    }
  },

  // Subscribe to socket events
  subscribeToNotes: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Avoid double-binding
    socket.off("notes:added");
    socket.off("notes:updated");
    socket.off("notes:deleted");

    socket.on("notes:added", (note) => {
      const { friendId, notes } = get();

      // Only add if this note belongs to the current friend chat
      const belongs = note.userIds?.includes(friendId) || 
                     note.userIds?.some(id => id?._id === friendId || id === friendId);

      if (!belongs) return;

      // Prevent duplicates
      if (notes.find((n) => n._id === note._id)) return;

      set({ notes: [...notes, note] });
    });

    socket.on("notes:updated", (note) => {
      const { friendId } = get();

      const belongs = note.userIds?.includes(friendId) || 
                     note.userIds?.some(id => id?._id === friendId || id === friendId);

      if (!belongs) return;

      set({
        notes: get().notes.map((n) => (n._id === note._id ? note : n)),
      });
    });

    socket.on("notes:deleted", ({ _id }) => {
      set({ notes: get().notes.filter((n) => n._id !== _id) });
    });
  },

  unsubscribeFromNotes: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("notes:added");
    socket.off("notes:updated");
    socket.off("notes:deleted");
  },
}));