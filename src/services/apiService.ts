import axios, {
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { store } from './store/store';

export const BASE_URL = 'https://handiyekade.com/face_react_api/api';

// Custom Error Class
export class ApiError extends Error {
    status: number;
    validationErrors: Record<string, string[]> | null;

    constructor(
        message: string,
        status: number,
        validationErrors: Record<string, string[]> | null = null,
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.validationErrors = validationErrors;
    }
}

// Token Helper
const getAuthToken = (): string | null => {
    return store.getState().auth?.token ?? null;
};

// Axios Instance
const apiService: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor - attach token
apiService.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error),
);

// Response Interceptor - unwrap data & handle errors
apiService.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    error => {
        if (!error.response) {
            return Promise.reject(
                new ApiError(error.message ?? 'Network error.', 0),
            );
        }

        const { status, data } = error.response;

        if (status === 422 && data?.errors) {
            return Promise.reject(
                new ApiError(data.message ?? 'Validation failed.', 422, data.errors),
            );
        }

        if (status === 401) {
            return Promise.reject(
                new ApiError(data?.message ?? 'Session expired. Please log in again.', 401),
            );
        }

        // Everything else (403, 404, 500)
        return Promise.reject(
            new ApiError(data?.message ?? `Request failed (${status})`, status),
        );
    },
);

// Request Helpers
export const Get = async <T = any>(url: string, params?: any): Promise<T> => {
    return await apiService.get(url, { params });
};

export const Post = async <T = any>(url: string, data?: any): Promise<T> => {
    return await apiService.post(url, data);
};

export const Put = async <T = any>(url: string, data?: any): Promise<T> => {
    return await apiService.put(url, data);
};

export const Patch = async <T = any>(url: string, data?: any): Promise<T> => {
    return await apiService.patch(url, data);
};

export const Delete = async <T = any>(url: string): Promise<T> => {
    return await apiService.delete(url);
};

export default apiService;