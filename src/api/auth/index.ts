import api from "@/src/lib/axios"

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  type: "user" | "student";
  student_id?: string;
  degree_program?: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },

  resendVerification: async (data: ResendVerificationRequest) => {
    const response = await api.post('/auth/resend-verification', data);
    return response.data;
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};