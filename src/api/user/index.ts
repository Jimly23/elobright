import api from "@/src/lib/axios";

// --- Types ---

export type UserWithStudent = {
  id: number;
  email: string;
  fullName: string | null;
  role: string;
  phoneNumber: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    studentId: string;
    userId: number;
    degreeProgram: string | null;
  } | null;
};

export type PaginatedUsers = {
  data: UserWithStudent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type GetUsersParams = {
  search?: string;
  startDate?: string;
  endDate?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
};

export type UpdatePasswordBody = {
  newPassword: string;
  confirmPassword?: string;
};

// --- Helper ---

const getConfig = (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return Object.keys(headers).length ? { headers } : undefined;
};

// --- Service ---

export const userService = {
  /**
   * GET /api/users — List users with filters and pagination
   */
  fetchUsers: async (
    token?: string,
    params?: GetUsersParams
  ): Promise<PaginatedUsers> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.isVerified !== undefined)
      qs.set("isVerified", String(params.isVerified));
    if (params?.startDate) qs.set("startDate", params.startDate);
    if (params?.endDate) qs.set("endDate", params.endDate);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));

    const queryString = qs.toString();
    const url = `/users${queryString ? `?${queryString}` : ""}`;
    const response = await api.get(url, getConfig(token));
    return response.data;
  },

  /**
   * PATCH /api/users/:id/password — Admin set password
   */
  updatePassword: async (
    token?: string,
    userId?: number,
    body?: UpdatePasswordBody
  ): Promise<{ message: string; user: { id: number; email: string; isVerified: boolean } }> => {
    const response = await api.patch(
      `/users/${userId}/password`,
      body,
      getConfig(token)
    );
    return response.data;
  },

  /**
   * POST /api/users/:id/reset-password — Admin trigger reset email
   */
  triggerResetPassword: async (
    token?: string,
    userId?: number
  ): Promise<{ message: string }> => {
    const response = await api.post(
      `/users/${userId}/reset-password`,
      {},
      getConfig(token)
    );
    return response.data;
  },

  /**
   * PATCH /api/users/:id/verify — Admin verify/unverify user
   */
  setVerified: async (
    token?: string,
    userId?: number,
    isVerified?: boolean
  ): Promise<{ message: string; user: { id: number; isVerified: boolean; email: string; fullName: string } }> => {
    const response = await api.patch(
      `/users/${userId}/verify`,
      { isVerified },
      getConfig(token)
    );
    return response.data;
  },
};
