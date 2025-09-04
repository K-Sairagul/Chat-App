import { X, NotebookPen } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Link } from "react-router-dom";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Right: Notes + Close */}
        <div className="flex items-center gap-2">
          <Link
            to={`/notes/${selectedUser._id}`}
            className="btn btn-sm btn-ghost gap-1"
            title="Shared Notes"
          >
            <NotebookPen className="w-4 h-4" />
            <span className="hidden sm:inline">Notes</span>
          </Link>

          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-sm btn-ghost"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
