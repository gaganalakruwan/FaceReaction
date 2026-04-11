
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Base_Url } from 'constant/init';
import { API_BASE_URL } from '../constants/api';

/**
 * Set the API key in the secure store
 * @param accessToken
 */
// export const setToken = async (accessToken: string) => {
//   await Keychain.setGenericPassword('accessToken', accessToken);
// };
/**
 * Get the API key from the secure store
 */
// export const getToken = async () => {
//   const credentials = await Keychain.getGenericPassword();
//   return credentials.password;
// };

/**
 * Remove the API key from the secure store
 */
// export const removeToken = async () => {
//   await Keychain.resetGenericPassword();
// };

// Create an Axios instance
const apiService: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to set tokens
apiService.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // const token: string | null = await getToken();
    // if (token && token.length > 0) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

interface ApiError extends Error {
  data: {error: {code: number; message: string}};
}
// Add response interceptor to handle errors
apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    // console.log(".........",response.config)
    return response.data;
  },
  error => {
    console.log('><<<<<<<<<<<', error);
    // If the error is Unauthorized, remove the API key and clen the async storage
    if (error.response.status === 401) {
      // removeToken();
      // store.dispatch(signOut())
      // AsyncStorage.clear();
    }
    return Promise.reject(error?.response?.data);
  },
);

// GET request
export const Get = async (url: string, params?: any): Promise<any> => {
  try {
    const response = await apiService.get(url, {params});
    return response;
  } catch (error) {
    throw error;
  }
};

// PUT request
export const Put = async (url: string, data: any): Promise<any> => {
  try {
    const response = await apiService.put(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};

// POST request
export const Post = async (url: string, data: any): Promise<any> => {
  try {
    const response = await apiService.post(url, data);
    return response;
  } catch (error) {
    // console.log('Error Service', error);
    throw error;
  }
};

// DELETE request
export const Delete = async (url: string): Promise<any> => {
  try {
    const response = await apiService.delete(url);
    return response;
  } catch (error) {
    throw error;
  }
};
// Patch request
export const Patch = async (url: string, data: any): Promise<any> => {
  try {
    const response = await apiService.patch(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export default apiService;
