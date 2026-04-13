import { GET_DEPARTMENTS } from '../constants/api';
import { Get } from '../services/apiService';

// Types
export interface Section {
    id: number;
    name: string;
}

export interface Department {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    sections: Section[];
}

export interface DashboardParams {
    date_from?: string;
    date_to?: string;
    department_id?: number;
    section?: string;
}

export interface ReactTypeBreakdown {
    type: string;
    count: number;
    percentage: number;
    icon_code: string;
}

export interface StatsData {
    total_reacts: number;
    total_employees: number;
    participation_rate: number;
    breakdown: ReactTypeBreakdown[];
}

// API Calls

// GET /api/departments
export const getCompanyDepartments = async (): Promise<Department[]> => {
  try {
    const response = await Get<{ success: boolean; data: Department[] }>(GET_DEPARTMENTS);
    if (response?.success && Array.isArray(response.data)) return response.data;
    throw new Error('Invalid server response format');
  } catch (error) {
    return [];
  }
};