import { apiSlice } from "./base-query";
import type {
  Contact,
  ContactListFilters,
  CreateContactPayload,
  UpdateContactPayload,
} from "@/types/contact";
import type { PaginatedResponse, ItemResponse } from "@/types/user";

function toQueryContacts(filters: ContactListFilters = {}): string {
  const q = new URLSearchParams();
  if (filters.paginate != null) q.set("paginate", String(filters.paginate));
  if (filters.s) q.set("s", filters.s.trim());
  if (filters.searchBy) q.set("searchBy", filters.searchBy);
  if (filters.orderBy) q.set("orderBy", filters.orderBy);
  if (filters.order) q.set("order", filters.order);
  if (filters.page != null) q.set("page", String(filters.page));
  return q.toString();
}

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContactsList: builder.query<
      {
        data: Contact[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      ContactListFilters | void
    >({
      query: (filters) => {
        const qs = toQueryContacts({ page: 1, paginate: 10, ...filters });
        return { url: `/contacts?${qs}`, method: "GET" };
      },
      transformResponse: (res: PaginatedResponse<Contact>) => ({
        data: res.data.data,
        last_page: res.data.last_page,
        current_page: res.data.current_page,
        total: res.data.total,
        per_page: res.data.per_page,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((c) => ({
                type: "Contact" as const,
                id: c.id,
              })),
              { type: "Contact" as const, id: "LIST" },
            ]
          : [{ type: "Contact" as const, id: "LIST" }],
    }),

    getContactById: builder.query<Contact, number>({
      query: (id) => ({ url: `/contacts/${id}`, method: "GET" }),
      transformResponse: (res: ItemResponse<Contact>) => res.data,
      providesTags: (_res, _err, id) => [{ type: "Contact", id }],
    }),

    createContact: builder.mutation<Contact, CreateContactPayload>({
      query: (payload) => ({
        url: `/contacts`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (res: ItemResponse<Contact>) => res.data,
      invalidatesTags: [{ type: "Contact", id: "LIST" }],
    }),

    updateContact: builder.mutation<
      Contact,
      { id: number; payload: UpdateContactPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/contacts/${id}`,
        method: "PUT",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (res: ItemResponse<Contact>) => res.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "Contact", id: arg.id },
        { type: "Contact", id: "LIST" },
      ],
    }),

    deleteContact: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({ url: `/contacts/${id}`, method: "DELETE" }),
      transformResponse: (res: {
        code: number;
        message: string;
        data: null;
      }) => ({
        code: res.code,
        message: res.message,
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Contact", id },
        { type: "Contact", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContactsListQuery,
  useGetContactByIdQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
