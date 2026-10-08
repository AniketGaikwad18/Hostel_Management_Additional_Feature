import {
  User,
  StudentProfile,
  QrIdentityData,
  QrPreviewData,
  MovementLog,
  WardenDashboardStats,
  Complaint,
  FeeRecord,
  FineRecord,
  RoomRecord,
  AnnouncementRecord,
  EmergencyAlertRecord,
  LeaveRecord,
} from './types';

// Dynamic API URL resolver: Prioritizes current browser host on port 8000
// This ensures requests work smoothly on localhost, local Wi-Fi, or mobile hotspot.
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When accessing via localhost/127.0.0.1, always connect to localhost:8000
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    // When accessing from phone or LAN device, connect to that same machine's port 8000
    return `${window.location.protocol}//${host}:8000`;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://localhost:8000';
}

export function getWsUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'ws://localhost:8000/ws';
    }
    return `${protocol}//${host}:8000/ws`;
  }
  return 'ws://localhost:8000/ws';
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hostelsphere_token');
  }
  return null;
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string; error_code?: string }> {
  const baseUrl = getApiBaseUrl();
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      const err = new Error(json.message || json.detail?.message || 'Request failed');
      (err as any).error_code = json.error_code || json.detail?.error_code || 'API_ERROR';
      (err as any).status = response.status;
      throw err;
    }

    return json;
  } catch (error: any) {
    if (error.error_code) {
      throw error;
    }
    const netErr = new Error(error.message || 'Network connection failed. Ensure backend is running.');
    (netErr as any).error_code = 'NETWORK_ERROR';
    throw netErr;
  }
}

export const api = {
  auth: {
    login: (credentials: { username: string; password: string }) =>
      request<{ access_token: string; token_type: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => request<User>('/api/auth/me'),
    logout: () => request<{ logged_out: boolean }>('/api/auth/logout', { method: 'POST' }),
  },
  qr: {
    getMyQr: () => request<QrIdentityData>('/api/qr/student'),
    regenerate: () => request<QrIdentityData>('/api/qr/regenerate', { method: 'POST' }),
    validatePublic: (token: string) =>
      request<QrPreviewData>('/api/qr/validate', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    scanWarden: (token: string) =>
      request<{ student_id: string; student_code: string; full_name: string; verified: boolean }>('/api/qr/scan', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },
  movement: {
    markEntry: (student_id: string, remarks?: string) =>
      request<{
        log_id: string;
        student_id: string;
        student_name: string;
        action: string;
        timestamp: string;
        current_status: string;
        message: string;
      }>('/api/movement/entry', {
        method: 'POST',
        body: JSON.stringify({ student_id, remarks }),
      }),
    markExit: (student_id: string, remarks?: string) =>
      request<{
        log_id: string;
        student_id: string;
        student_name: string;
        action: string;
        timestamp: string;
        current_status: string;
        message: string;
      }>('/api/movement/exit', {
        method: 'POST',
        body: JSON.stringify({ student_id, remarks }),
      }),
    getStudentLogs: (student_id: string) => request<MovementLog[]>(`/api/movement/student/${student_id}`),
    getLiveLogs: () => request<MovementLog[]>('/api/movement/live'),
  },
  student: {
    getMe: () => request<StudentProfile>('/api/students/me'),
    getRoom: () => request<any>('/api/students/me/room'),
    getFees: () => request<FeeRecord[]>('/api/students/me/fees'),
    getFines: () => request<FineRecord[]>('/api/students/me/fines'),
    getComplaints: () => request<Complaint[]>('/api/students/me/complaints'),
    getActivity: () => request<MovementLog[]>('/api/students/me/activity'),
  },
  warden: {
    getDashboard: () => request<WardenDashboardStats>('/api/warden/dashboard'),
    getStudents: (params?: { search?: string; status?: string; block?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.status) q.append('status', params.status);
      if (params?.block) q.append('block', params.block);
      const query = q.toString() ? `?${q.toString()}` : '';
      return request<StudentProfile[]>(`/api/warden/students${query}`);
    },
    getStudentDetail: (id: string) => request<StudentProfile>(`/api/warden/students/${id}`),
  },
  complaints: {
    create: (data: { title: string; description: string; category: string; priority?: string }) =>
      request<Complaint>('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (params?: { status?: string; category?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.category) q.append('category', params.category);
      const query = q.toString() ? `?${q.toString()}` : '';
      return request<Complaint[]>(`/api/complaints${query}`);
    },
    getById: (id: string) => request<Complaint>(`/api/complaints/${id}`),
    updateStatus: (id: string, data: { status: string; assigned_staff?: string; resolution_notes?: string }) =>
      request<Complaint>(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  rooms: {
    list: (params?: { block_name?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.block_name) q.append('block_name', params.block_name);
      if (params?.status) q.append('status', params.status);
      const query = q.toString() ? `?${q.toString()}` : '';
      return request<RoomRecord[]>(`/api/rooms${query}`);
    },
    allocate: (roomId: string, studentId: string, bedId?: string) =>
      request<any>(`/api/rooms/${roomId}/allocate`, {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, bed_id: bedId }),
      }),
    vacate: (roomId: string, studentId: string) =>
      request<any>(`/api/rooms/${roomId}/vacate`, {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId }),
      }),
  },
  fees: {
    list: () => request<FeeRecord[]>('/api/fees'),
    getByStudent: (id: string) => request<FeeRecord[]>(`/api/fees/student/${id}`),
  },
  fines: {
    list: () => request<FineRecord[]>('/api/fines'),
    create: (data: { student_id: string; category: string; amount: number; reason: string }) =>
      request<FineRecord>('/api/fines', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/api/fines/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  announcements: {
    list: () => request<AnnouncementRecord[]>('/api/announcements'),
    create: (data: { title: string; content: string; priority?: string; target_audience?: string }) =>
      request<AnnouncementRecord>('/api/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  emergency: {
    trigger: (data: { location: string; message: string }) =>
      request<EmergencyAlertRecord>('/api/emergency', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => request<EmergencyAlertRecord[]>('/api/emergency'),
  },
  leave: {
    apply: (data: { start_date: string; end_date: string; destination: string; reason: string }) =>
      request<LeaveRecord>('/api/leave', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => request<LeaveRecord[]>('/api/leave'),
    updateStatus: (id: string, status: string) =>
      request<any>(`/api/leave/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
};
