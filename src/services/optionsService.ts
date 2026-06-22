import apiService from './apiService';
import { store } from './store/store';

export interface Option {
  id: number;
  name: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export const getOptions = async (): Promise<Option[]> => {
  try {
    console.log('🔄 Fetching options from /api/options...');
    const response = await apiService.get('/options');
    console.log('📦 Response:', response);
    
    if (response?.success === true && Array.isArray(response?.data)) {
      console.log('✅ Options loaded:', response.data.length);
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.log('❌ getOptions error:', error);
    return [];
  }
};

export const submitOptions = async (selectedIds: number[]) => {
  try {
    // ✅ Get user_id from Redux store
    const state = store.getState();
    const userId = state.auth?.user?.id;
    const token = state.auth?.token;
    
    console.log('🔄 Submitting options:', selectedIds);
    console.log('👤 User ID from store:', userId);
    console.log('🔑 Token:', token ? 'Present' : 'Missing');
    
    // ✅ Check if user is logged in
    if (!userId) {
      console.log('❌ No user ID found!');
      throw new Error('User not logged in. Please login first.');
    }
    
    if (!token) {
      console.log('❌ No token found!');
      throw new Error('No authentication token found.');
    }
    
    // ✅ Send user_id with options
    const response = await apiService.post('/options/submit', {
      user_id: userId,  // ✅ THIS WAS MISSING!
      options: selectedIds,
    });
    
    console.log('✅ Submit response:', response);
    return response;
  } catch (error: any) {
    console.log('❌ submitOptions error:', error);
    console.log('❌ Error details:', error?.response?.data || error.message);
    throw error;
  }
};