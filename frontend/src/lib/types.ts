export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'STUDENT' | 'WARDEN' | 'ADMIN';
  full_name: string;
  phone?: string;
  student_id?: string;
  warden_id?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  student_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  course: string;
  year_of_study: number;
  guardian_name?: string;
  guardian_phone?: string;
  current_status: 'INSIDE' | 'OUTSIDE';
  last_entry_at?: string;
  last_exit_at?: string;
  hostel_name?: string;
  block_name?: string;
  room_number?: string;
  bed_number?: string;
  pending_complaints_count?: number;
  total_fines_amount?: number;
  outstanding_fee_amount?: number;
  recent_logs?: MovementLog[];
}

export interface QrIdentityData {
  qr_id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  hostel_name: string;
  block_name: string;
  room_number: string;
  current_status: 'INSIDE' | 'OUTSIDE';
  secure_token: string;
  scan_url: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface QrPreviewData {
  valid: boolean;
  student_id: string;
  student_name: string;
  student_code: string;
  room_number: string;
  block_name: string;
  current_status: 'INSIDE' | 'OUTSIDE';
}

export interface MovementLog {
  id: string;
  student_id: string;
  student_name?: string;
  student_code?: string;
  room_number?: string;
  block_name?: string;
  action: 'ENTRY' | 'EXIT';
  timestamp: string;
  gate: string;
  device_info?: string;
  remarks?: string;
  warden_name?: string;
}

export interface WardenDashboardStats {
  total_students: number;
  inside_count: number;
  outside_count: number;
  available_rooms: number;
  total_rooms: number;
  pending_complaints: number;
  urgent_complaints: number;
  outstanding_fees: number;
  recent_movements: MovementLog[];
}

export interface Complaint {
  id: string;
  complaint_code: string;
  student_id: string;
  student_name?: string;
  student_code?: string;
  room_number?: string;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assigned_staff?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  updates?: {
    id: string;
    status: string;
    comment?: string;
    updated_by: string;
    created_at: string;
  }[];
}

export interface FeeRecord {
  id: string;
  student_id: string;
  student_name?: string;
  student_code?: string;
  academic_year: string;
  semester: string;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  due_date: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  payment_url?: string;
  payments: {
    id: string;
    transaction_ref: string;
    amount: number;
    payment_method: string;
    paid_at: string;
  }[];
}

export interface FineRecord {
  id: string;
  student_id: string;
  student_name?: string;
  student_code?: string;
  category: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'PAID' | 'WAIVED';
  issued_by_warden?: string;
  created_at: string;
}

export interface RoomRecord {
  id: string;
  block_id: string;
  block_name: string;
  floor_number: number;
  room_number: string;
  capacity: number;
  occupied_count: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
  beds: {
    id: string;
    bed_number: string;
    is_occupied: boolean;
    student_id?: string;
    student_name?: string;
  }[];
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'CRITICAL';
  target_audience: string;
  created_at: string;
  warden_name?: string;
}

export interface EmergencyAlertRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  room_number?: string;
  location: string;
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
}

export interface LeaveRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  room_number?: string;
  start_date: string;
  end_date: string;
  destination: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}
