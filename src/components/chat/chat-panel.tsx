"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  Users,
  Image as ImageIcon,
  Reply,
  Trash2,
  ChevronDown,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  useGetChatRoomsQuery,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useGetChatRoomMembersQuery,
} from "@/services/chat.service";
import { useGetMeQuery } from "@/services/auth.service";
import { getEcho, destroyEcho } from "@/lib/echo";
import type { ChatRoom, ChatMessage, ChatRoomMember } from "@/types/chat";

// --------------- Helpers ---------------

function timeAgo(dateStr: string) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-orange-500",
];

function avatarColor(userId: number) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

// --------------- Sub-components ---------------

const RoomListItem = memo(function RoomListItem({
  room,
  onClick,
}: {
  room: ChatRoom;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
        {room.type === "program" ? "P" : "D"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {room.name.replace(/^(Program|Domain): /, "")}
          </p>
          {room.latest_message && (
            <span className="text-[10px] text-gray-400 shrink-0">
              {timeAgo(room.latest_message.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-gray-400 truncate">
            {room.latest_message
              ? `${room.latest_message.user.name}: ${room.latest_message.message}`
              : "Belum ada pesan"}
          </p>
          <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-0.5">
            <Users size={10} /> {room.users_count}
          </span>
        </div>
      </div>
    </motion.button>
  );
});

const MessageBubble = memo(function MessageBubble({
  msg,
  isOwn,
  onReply,
  onDelete,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  onReply: (msg: ChatMessage) => void;
  onDelete: (id: number) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Avatar */}
      {!isOwn && (
        <div
          className={`w-8 h-8 rounded-lg ${avatarColor(msg.user_id)} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1`}
        >
          {getInitials(msg.user.name)}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[75%] relative ${isOwn ? "items-end" : ""}`}
        onMouseEnter={() => { if (!confirmDelete) setShowActions(true); }}
        onMouseLeave={() => { if (!confirmDelete) setShowActions(false); }}
      >
        {/* Username */}
        {!isOwn && (
          <p className="text-[10px] font-semibold text-gray-500 mb-0.5 ml-1">
            {msg.user.name}
          </p>
        )}

        <div
          className={`rounded-2xl px-3.5 py-2.5 relative ${
            isOwn
              ? "bg-indigo-500 text-white rounded-tr-md"
              : "bg-white text-gray-800 rounded-tl-md border border-gray-100 shadow-sm"
          }`}
          onTouchStart={() => setShowActions(true)}
        >
          {/* Reply preview */}
          {msg.reply_to && (
            <div
              className={`text-[10px] mb-1.5 pb-1.5 border-b ${
                isOwn
                  ? "border-white/20 text-white/70"
                  : "border-gray-100 text-gray-400"
              }`}
            >
              <span className="font-semibold">{msg.reply_to.user.name}</span>
              <p className="truncate">{msg.reply_to.message}</p>
            </div>
          )}

          {/* Image */}
          {msg.image_path && (
            <a
              href={msg.image_path}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-1.5"
            >
              <img
                src={msg.image_path}
                alt=""
                className="max-w-full rounded-xl max-h-48 object-cover"
                loading="lazy"
              />
            </a>
          )}

          {/* Text */}
          {msg.message && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {msg.message}
            </p>
          )}

          {/* Time */}
          <p
            className={`text-[9px] mt-1 ${
              isOwn ? "text-white/60 text-right" : "text-gray-400"
            }`}
          >
            {formatMessageTime(msg.created_at)}
          </p>

          {/* Actions */}
          <AnimatePresence>
            {showActions && !confirmDelete && (
              <motion.div
                className={`absolute top-1 flex items-center gap-0.5 ${
                  isOwn ? "-left-16" : "-right-16"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onReply(msg);
                    setShowActions(false);
                  }}
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Reply size={12} className="text-gray-500" />
                </button>
                {isOwn && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(true);
                      setShowActions(false);
                    }}
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete confirmation - inline below bubble */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              className={`flex items-center gap-2 mt-1.5 ${isOwn ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-[11px] text-gray-500 font-medium">Hapus?</p>
              <button
                type="button"
                onClick={() => {
                  onDelete(msg.id);
                  setConfirmDelete(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold transition-colors"
              >
                Ya, Hapus
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-bold transition-colors"
              >
                Batal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// --------------- Members drawer ---------------

function MembersDrawer({
  roomId,
  open,
  onClose,
}: {
  roomId: number;
  open: boolean;
  onClose: () => void;
}) {
  const { data: members, isLoading } = useGetChatRoomMembersQuery(roomId, {
    skip: !open,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-30 bg-white flex flex-col rounded-t-3xl sm:rounded-3xl"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-500" />
            </button>
            <h3 className="text-sm font-bold text-gray-800">Anggota</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-300" />
              </div>
            ) : (
              members?.map((m: ChatRoomMember) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${avatarColor(m.id)} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {getInitials(m.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {m.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --------------- Chat Room View ---------------

function ChatRoomView({
  room,
  userId,
  token,
  onBack,
  onClose,
}: {
  room: ChatRoom;
  userId: number;
  token: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialLoad = useRef(true);

  // RTK Query
  const { data: initialData, isLoading } = useGetChatMessagesQuery({
    roomId: room.id,
    page: 1,
    per_page: 50,
  });
  const [fetchMore] = useLazyGetChatMessagesQuery();
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  // Load initial messages
  useEffect(() => {
    if (initialData) {
      setMessages(initialData.data.slice().reverse());
      setHasMore(initialData.current_page < initialData.last_page);
      setPage(1);
      isInitialLoad.current = true;
    }
  }, [initialData]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      isInitialLoad.current = false;
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView();
      });
    }
  }, [messages]);

  // WebSocket subscription
  useEffect(() => {
    if (!token) return;

    const echo = getEcho(token);
    echo
      .join(`chat.room.${room.id}`)
      .here((users: { id: number; name: string }[]) => {
        console.log("[Chat] Online users:", users);
      })
      .joining((user: { id: number; name: string }) => {
        console.log("[Chat] User joined:", user);
      })
      .leaving((user: { id: number; name: string }) => {
        console.log("[Chat] User left:", user);
      })
      .listen("Chat\\MessageSent", (newMsg: ChatMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Auto-scroll if near bottom
        requestAnimationFrame(() => {
          const el = scrollContainerRef.current;
          if (el) {
            const nearBottom =
              el.scrollHeight - el.scrollTop - el.clientHeight < 150;
            if (nearBottom || newMsg.user_id === userId) {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
          }
        });
      })
      .listen("Chat\\MessageDeleted", (data: { id: number }) => {
        setMessages((prev) => prev.filter((m) => m.id !== data.id));
      });

    return () => {
      echo.leave(`chat.room.${room.id}`);
    };
  }, [room.id, token, userId]);

  // Infinite scroll - load older messages
  const handleScroll = useCallback(async () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Show/hide scroll-down button
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollDown(!nearBottom);

    // Load more when scrolling to top
    if (el.scrollTop < 60 && hasMore && !loadingMore) {
      setLoadingMore(true);
      const prevHeight = el.scrollHeight;
      const nextPage = page + 1;

      try {
        const result = await fetchMore({
          roomId: room.id,
          page: nextPage,
          per_page: 50,
        }).unwrap();

        const older = result.data.slice().reverse();
        setMessages((prev) => [...older, ...prev]);
        setPage(nextPage);
        setHasMore(result.current_page < result.last_page);

        // Maintain scroll position
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevHeight;
        });
      } catch {
        // ignore
      } finally {
        setLoadingMore(false);
      }
    }
  }, [hasMore, loadingMore, page, room.id, fetchMore]);

  // Send handler
  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed && !imageFile) return;

    const fd = new FormData();
    if (trimmed) fd.append("message", trimmed);
    if (imageFile) fd.append("image", imageFile);
    if (replyTo) fd.append("reply_to_id", String(replyTo.id));

    setText("");
    setImageFile(null);
    setImagePreview(null);
    setReplyTo(null);

    try {
      const newMsg = await sendMessage({ roomId: room.id, body: fd }).unwrap();
      // Add to local state immediately (WebSocket deduplicates by id)
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch {
      // Restore text on failure
      setText(trimmed);
    }

    textareaRef.current?.focus();
  }, [text, imageFile, replyTo, room.id, sendMessage]);

  const handleDelete = useCallback(
    async (msgId: number) => {
      try {
        await deleteMessage(msgId).unwrap();
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      } catch {
        // ignore
      }
    },
    [deleteMessage]
  );

  // Image select
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // Enter to send (shift+enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    for (const msg of messages) {
      const date = new Date(msg.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ date, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
        <motion.button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </motion.button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">
            {room.name.replace(/^(Program|Domain): /, "")}
          </p>
          <p className="text-[10px] text-gray-400">
            {room.users_count} anggota
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => setShowMembers(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Users size={16} className="text-gray-500" />
        </motion.button>
        <motion.button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <X size={16} className="text-gray-400" />
        </motion.button>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1 bg-gray-50/50"
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 size={16} className="animate-spin text-gray-300" />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <MessageCircle size={32} className="mb-2 text-gray-300" />
            <p className="text-sm font-medium">Belum ada pesan</p>
            <p className="text-xs">Mulai percakapan!</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex justify-center my-3">
                <span className="text-[10px] bg-gray-200/80 text-gray-500 px-3 py-1 rounded-full font-medium">
                  {group.date}
                </span>
              </div>
              <div className="space-y-2">
                {group.messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.user_id === userId}
                    onReply={setReplyTo}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-28 right-4 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronDown size={16} className="text-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Reply bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-t border-indigo-100 shrink-0"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Reply size={14} className="text-indigo-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-indigo-500">
                {replyTo.user.name}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {replyTo.message || "Gambar"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="p-1 rounded hover:bg-indigo-100 transition-colors"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-t border-gray-100 shrink-0"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <img
              src={imagePreview}
              alt=""
              className="w-14 h-14 object-cover rounded-xl border border-gray-200"
            />
            <p className="text-xs text-gray-500 flex-1 truncate">
              {imageFile?.name}
            </p>
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
            >
              <XCircle size={16} className="text-gray-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="px-3 py-2.5 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors shrink-0 mb-0.5"
            whileTap={{ scale: 0.9 }}
          >
            <ImageIcon size={20} className="text-gray-400" />
          </motion.button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan..."
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all max-h-[120px]"
          />

          <motion.button
            type="button"
            onClick={handleSend}
            disabled={sending || (!text.trim() && !imageFile)}
            className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 text-white disabled:text-gray-400 transition-colors shrink-0 mb-0.5"
            whileTap={{ scale: 0.9 }}
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Members drawer */}
      <MembersDrawer
        roomId={room.id}
        open={showMembers}
        onClose={() => setShowMembers(false)}
      />
    </div>
  );
}

// --------------- Main Chat Panel ---------------

interface ChatPanelProps {
  programId?: number;
}

export default function ChatPanel({ programId }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const { data: session } = useSession();
  const { data: userData } = useGetMeQuery(undefined, { skip: !session });
  const userId = userData?.id ?? null;
  const token = (session?.user as { token?: string })?.token ?? "";

  const { data: rooms, isLoading: roomsLoading } = useGetChatRoomsQuery(
    undefined,
    { skip: !session }
  );

  // Filter rooms for this program if programId provided
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    if (programId) {
      return rooms.filter(
        (r) =>
          (r.type === "program" && r.program_id === programId) ||
          r.type === "domain"
      );
    }
    return rooms;
  }, [rooms, programId]);

  // Auto-select program room
  useEffect(() => {
    if (open && !selectedRoom && programId && filteredRooms.length > 0) {
      const programRoom = filteredRooms.find(
        (r) => r.type === "program" && r.program_id === programId
      );
      if (programRoom) setSelectedRoom(programRoom);
    }
  }, [open, selectedRoom, programId, filteredRooms]);

  // Cleanup echo on unmount
  useEffect(() => {
    return () => destroyEcho();
  }, []);

  if (!session) return null;

  const hasUnread = false; // Can be enhanced with unread tracking

  return (
    <>
      {/* FAB */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-300/40 flex items-center justify-center"
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0 }}
        animate={{ scale: open ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <MessageCircle size={24} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/20 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpen(false);
                setSelectedRoom(null);
              }}
            />

            {/* Chat window */}
            <motion.div
              className="fixed z-50 bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[380px] h-[100dvh] sm:h-[560px] sm:rounded-3xl bg-white shadow-2xl shadow-black/10 overflow-hidden flex flex-col border border-gray-200/50"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {selectedRoom && userId ? (
                <ChatRoomView
                  room={selectedRoom}
                  userId={userId}
                  token={token}
                  onBack={() => setSelectedRoom(null)}
                  onClose={() => {
                    setOpen(false);
                    setSelectedRoom(null);
                  }}
                />
              ) : (
                <>
                  {/* Room list header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <MessageCircle size={16} className="text-white" />
                      </div>
                      <h2 className="text-base font-bold text-gray-800">
                        Chat
                      </h2>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setSelectedRoom(null);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={18} className="text-gray-400" />
                    </motion.button>
                  </div>

                  {/* Room list */}
                  <div className="flex-1 overflow-y-auto p-2">
                    {roomsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2
                          size={24}
                          className="animate-spin text-gray-300"
                        />
                      </div>
                    ) : filteredRooms.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <MessageCircle
                          size={32}
                          className="mb-2 text-gray-300"
                        />
                        <p className="text-sm font-medium">
                          Belum ada chat room
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {filteredRooms.map((room, i) => (
                          <motion.div
                            key={room.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <RoomListItem
                              room={room}
                              onClick={() => setSelectedRoom(room)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
