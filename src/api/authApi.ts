import { apiFetch } from './client';
import { AuthUser, AuthCompany } from '../api/store/authSlice';

// Register
export interface RegisterCompanyPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  admin_username: string;
  admin_password: string;
}

export interface RegisterCompanyResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active: boolean;
    created_at: string;
  };
}

// POST /api/companies/register
export const registerCompany = async (
  payload: RegisterCompanyPayload,
): Promise<RegisterCompanyResponse> => {
  return apiFetch<RegisterCompanyResponse>('/companies/register', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email || undefined,
      phone: payload.phone || undefined,
      address: payload.address || undefined,
      admin_username: payload.admin_username,
      admin_password: payload.admin_password,
    }),
  });
};

// Login
export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;       // Sanctum personal access token
    user: AuthUser & { company: AuthCompany }; // { id, username, company_id, department_id, is_active, company }
  };
}

// POST /api/auth/login
// Request : { "username": "acme_admin", "password": "secret123" }
// Response: { success, message, data: { token, user } }
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: payload.username,
      password: payload.password,
    }),
  });
};