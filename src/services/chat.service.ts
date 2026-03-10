import { apiSlice } from "./base-query";
import type {
  ChatRoom,
  ChatMessage,
  ChatMessagePaginated,
  ChatRoomMember,
} from "@/types/chat";

interface GetMessagesParams {
  roomId: number;
  page?: number;
  per_page?: number;
}

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChatRooms: builder.query<ChatRoom[], void>({
      query: () => ({ url: "/chat/rooms", method: "GET" }),
      transformResponse: (response: { code: number; data: ChatRoom[] }) =>
        response.data,
      providesTags: ["ChatRooms"],
    }),

    getChatMessages: builder.query<ChatMessagePaginated, GetMessagesParams>({
      query: ({ roomId, page = 1, per_page = 50 }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        method: "GET",
        params: { page, per_page },
      }),
      transformResponse: (response: {
        code: number;
        data: ChatMessagePaginated;
      }) => response.data,
    }),

    sendMessage: builder.mutation<
      ChatMessage,
      { roomId: number; body: FormData }
    >({
      query: ({ roomId, body }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { code: number; data: ChatMessage }) =>
        response.data,
    }),

    deleteMessage: builder.mutation<void, number>({
      query: (messageId) => ({
        url: `/chat/messages/${messageId}`,
        method: "DELETE",
      }),
    }),

    getChatRoomMembers: builder.query<ChatRoomMember[], number>({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}/members`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        data: ChatRoomMember[];
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChatRoomsQuery,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useGetChatRoomMembersQuery,
} = chatApi;
