export interface ChatUser {
  id: number;
  name: string;
  email?: string;
}

export interface ChatMessage {
  id: number;
  chat_room_id: number;
  user_id: number;
  user: ChatUser;
  message: string | null;
  image_path: string | null;
  reply_to: {
    id: number;
    message: string;
    user: { id: number; name: string };
  } | null;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  type: "program" | "domain";
  name: string;
  program_id: number | null;
  domain: string | null;
  users_count: number;
  latest_message: {
    id: number;
    message: string;
    user: { id: number; name: string };
    created_at: string;
  } | null;
}

export interface ChatRoomMember {
  id: number;
  name: string;
  email: string;
  joined_at: string;
}

export interface ChatMessagePaginated {
  current_page: number;
  data: ChatMessage[];
  last_page: number;
  total: number;
  per_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface SendMessagePayload {
  roomId: number;
  message?: string;
  image?: File;
  reply_to_id?: number;
}
