import { apiFetch } from './client';

/* ═══════════════════════════════════════════════════════════════════════════
    1. TYPES & INTERFACES
═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
    2. SETUP & LOCATION SELECTION
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Fetches departments with refined validation and error logging.
 */
export const getCompanyDepartments = async (): Promise<Department[]> => {
    try {
        const response = await apiFetch<{ success: boolean; data: Department[] }>('/departments');

        if (response && response.success && Array.isArray(response.data)) {
            return response.data;
        }

        console.error("Departmentapi: Server returned success:false or malformed data", response);
        throw new Error("Invalid server response format");

    } catch (error) {
        // Detailed logging for debugging while maintaining UI stability via MOCK_DEPARTMENTS
        if (error instanceof Error) {
            console.warn(`Departmentapi: [${error.name}] ${error.message}. Falling back to MOCK_DEPARTMENTS.`);
        } else {
            console.warn("Departmentapi: Unknown error. Falling back to MOCK_DEPARTMENTS.", error);
        }
        
        return MOCK_DEPARTMENTS;
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
    3. DASHBOARD & ANALYTICS
═══════════════════════════════════════════════════════════════════════════ */

const buildQuery = (params: DashboardParams = {}) => {
    const q = new URLSearchParams();
    if (params.date_from) q.set('date_from', params.date_from);
    if (params.date_to) q.set('date_to', params.date_to);
    if (params.department_id) q.set('department_id', String(params.department_id));
    if (params.section) q.set('section', params.section);
    return q.toString() ? `?${q.toString()}` : '';
};

export const getStats = (params?: DashboardParams) => 
    apiFetch<{ success: boolean; data: StatsData }>(`/dashboard/stats${buildQuery(params)}`);

export const getPieChart = (params?: DashboardParams) => 
    apiFetch<{ success: boolean; data: any[] }>(`/dashboard/pie-chart${buildQuery(params)}`);

export const getManagerSummary = async (params?: DashboardParams) => {
    const [statsRes, pieRes] = await Promise.all([
        getStats(params),
        getPieChart(params),
    ]);

    return {
        stats: statsRes.data,
        pieSlices: pieRes.data,
    };
};

/* ═══════════════════════════════════════════════════════════════════════════
    4. FALLBACK MOCK DATA
═══════════════════════════════════════════════════════════════════════════ */

export const MOCK_DEPARTMENTS: Department[] = [
    {
        id: 1,
        name: 'Operations',
        icon: 'settings',
        color: '#FF9500',
        sections: [
            { id: 1, name: 'Floor A' },
            { id: 2, name: 'Floor B' },
            { id: 3, name: 'Warehouse' },
        ],
    },
    {
        id: 2,
        name: 'Customer Service',
        icon: 'support-agent',
        color: '#007AFF',
        sections: [
            { id: 4, name: 'Counter 1' },
            { id: 5, name: 'Counter 2' },
            { id: 6, name: 'Online Support' },
        ],
    },
    {
        id: 3,
        name: 'Finance',
        icon: 'account-balance',
        color: '#AF52DE',
        sections: [
            { id: 7, name: 'Accounts' },
            { id: 8, name: 'Payroll' },
        ],
    },
    {
        id: 4,
        name: 'Human Resources',
        icon: 'people',
        color: '#FF2D55',
        sections: [
            { id: 9, name: 'Recruitment' },
            { id: 10, name: 'Training' },
        ],
    },
];