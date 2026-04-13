import { Post } from '../services/apiService';
import { REGISTER, LOGIN } from '../constants/api';
import { AuthCompany, AuthUser } from './store/authSlice';

// Types
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

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser & { company: AuthCompany };
  };
}

// API Calls
// POST /api/companies/register
export const registerCompany = (payload: RegisterCompanyPayload) =>
  Post<RegisterCompanyResponse>(REGISTER, {
    name: payload.name,
    email: payload.email || undefined,
    phone: payload.phone || undefined,
    address: payload.address || undefined,
    admin_username: payload.admin_username,
    admin_password: payload.admin_password,
  });

// POST /api/auth/login
export const login = (payload: LoginPayload) =>
  Post<LoginResponse>(LOGIN, {
    username: payload.username,
    password: payload.password,
  });