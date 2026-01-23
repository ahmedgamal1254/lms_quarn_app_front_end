// Educational Materials Types

export interface EducationalMaterial {
  id: number;
  teacher_id: number;
  teacher?: {
    id: number;
    name: string;
  };
  subject_id?: number;
  subject?: {
    id: number;
    name: string;
  };
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  formatted_file_size?: string;
  file_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approver?: {
    id: number;
    name: string;
  };
  approved_at?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaterialRequest {
  title: string;
  description?: string;
  subject_id?: number;
  file: File;
}

export interface UpdateMaterialRequest {
  title?: string;
  description?: string;
  subject_id?: number;
}

// Teacher Financial Reset Types

export interface TeacherFinancialReset {
  id: number;
  teacher_id: number;
  admin_id?: number;
  admin_name?: string;
  previous_balance: number;
  reset_amount: number;
  notes?: string;
  reset_date: string;
  created_at?: string;
}

export interface ResetTeacherBalanceRequest {
  notes?: string;
}
