/**
 * Shared API Types
 *
 * Common TypeScript interfaces for API requests and responses.
 */

// =============================================================================
// Base Response Types
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
}

// =============================================================================
// User & Auth Types
// =============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student" | "parent";
  phone?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

// =============================================================================
// Student Types
// =============================================================================

export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp_number?: string;
  whatsapp_link?: string;
  birth_date?: string;
  gender?: "male" | "female";
  address?: string;
  parent_id?: number;
  parent?: Parent;
  subscriptions?: Subscription[];
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp_number?: string;
  birth_date?: string;
  gender?: "male" | "female";
  country_code?: string;
  country?: string;
  address?: string;
  parent_id?: number;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {}

// =============================================================================
// Teacher Types
// =============================================================================

export interface Teacher {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp_number?: string;
  whatsapp_link?: string;
  specialization?: string;
  salary?: number;
  hourly_rate?: number;
  currency_id?: number;
  currency?: Currency;
  subjects?: Subject[];
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateTeacherRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp_number?: string;
  country_code?: string;
  specialization?: string;
  salary?: number;
  hourly_rate?: number;
  currency_id?: number;
  subject_ids?: number[];
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {}

// =============================================================================
// Session Types
// =============================================================================

export interface Session {
  id: number;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  teacher_id?: number;
  teacher?: Teacher;
  subject_id?: number;
  subject?: Subject;
  students?: Student[];
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateSessionRequest {
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  teacher_id?: number;
  subject_id?: number;
  student_ids?: number[];
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  status?: "scheduled" | "ongoing" | "completed" | "cancelled";
}

// =============================================================================
// Plan Types
// =============================================================================

export interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  sessions_count?: number;
  teacher_id?: number;
  teacher?: Teacher;
  subject_id?: number;
  subject?: Subject;
  features?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  sessions_count?: number;
  teacher_id?: number;
  subject_id?: number;
  features?: string[];
  status?: string;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

// =============================================================================
// Subscription Types
// =============================================================================

export interface Subscription {
  id: number;
  student_id: number;
  student?: Student;
  plan_id: number;
  plan?: Plan;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "cancelled" | "pending";
  remaining_sessions?: number;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateSubscriptionRequest {
  student_id: number;
  plan_id: number;
  start_date: string;
}

export interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {
  status?: "active" | "expired" | "cancelled" | "pending";
}

// =============================================================================
// Exam Types
// =============================================================================

export interface Exam {
  id: number;
  title: string;
  description?: string;
  subject_id?: number;
  subject?: Subject;
  teacher_id?: number;
  teacher?: Teacher;
  date: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  subject_id?: number;
  teacher_id?: number;
  date: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
}

export interface UpdateExamRequest extends Partial<CreateExamRequest> {}

// =============================================================================
// Homework Types
// =============================================================================

export interface Homework {
  id: number;
  title: string;
  description?: string;
  subject_id?: number;
  subject?: Subject;
  teacher_id?: number;
  teacher?: Teacher;
  due_date: string;
  status: "assigned" | "submitted" | "graded";
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateHomeworkRequest {
  title: string;
  description?: string;
  subject_id?: number;
  teacher_id?: number;
  due_date: string;
  student_ids?: number[];
}

export interface UpdateHomeworkRequest extends Partial<CreateHomeworkRequest> {
  status?: "assigned" | "submitted" | "graded";
}

// =============================================================================
// Subject Types
// =============================================================================

export interface Subject {
  id: number;
  name: string;
  description?: string;
  code?: string;
  icon?: string;
  color?: string;
  status?: string;
  teachers?: Teacher[];
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateSubjectRequest {
  name: string;
  description?: string;
  code?: string;
  icon?: string;
  color?: string;
  status?: string;
}

export interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {}

export interface Setting {
    id: number;
    key: string;
    group: string;
    type: string;
    options?: any;
    sort_order?: number;
    value?: string;
    label?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    translations?: Record<string, { value: string; label: string; description: string }>;
}

export interface UpdateSettingRequest {
    key: string;
    translations: Record<string, { value: string; label: string; description: string }>;
}

// =============================================================================
// Finance Types
// =============================================================================

export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string }>;
}

export interface CreateCurrencyRequest {
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
  is_default?: boolean;
}

export interface UpdateCurrencyRequest extends Partial<CreateCurrencyRequest> {}

export interface Transaction {
  id: number;
  type: "income" | "expense" | "payment";
  amount: number;
  currency_id?: number;
  currency?: Currency;
  description?: string;
  reference?: string;
  date: string;
  student_id?: number;
  student?: Student;
  teacher_id?: number;
  teacher?: Teacher;
  subscription_id?: number;
  subscription?: Subscription;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateTransactionRequest {
  type: "income" | "expense" | "payment";
  amount: number;
  currency_id?: number;
  description?: string;
  reference?: string;
  date: string;
  student_id?: number;
  teacher_id?: number;
  subscription_id?: number;
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  currency_id?: number;
  currency?: Currency;
  category?: string;
  description?: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateExpenseRequest {
  title: string;
  amount: number;
  currency_id?: number;
  category?: string;
  description?: string;
  date: string;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

// =============================================================================
// Parent Types
// =============================================================================

export interface Parent {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp_number?: string;
  whatsapp_link?: string;
  students?: Student[];
  children_count?: number;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, { name: string; description?: string }>;
}

export interface CreateParentRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp_number?: string;
  country_code?: string;
  student_ids?: number[];
}

export interface ParentDashboardStats {
  parent: {
    name: string;
    email: string;
    phone?: string;
    whatsapp_number?: string;
  };
  children: Array<{
    id: number;
    name: string;
    email: string;
    plan?: string;
    sessions_remaining: number;
    upcoming_sessions: number;
    pending_homework: number;
    upcoming_exams: number;
  }>;
  statistics: {
    total_children: number;
    total_sessions_this_month: number;
    total_homework_pending: number;
  };
}

// =============================================================================
// Dashboard Types
// =============================================================================

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_sessions: number;
  active_subscriptions: number;
  total_revenue: number;
  total_expenses: number;
  pending_approvals?: number;
}

export interface StudentDashboardStats {
  student: {
    name: string;
  };
  teacher: {
    name: string;
    email: string;
    phone: string;
    subject_name: string;
  } | null;
  subscription: {
    plan_name: string;
    price: number;
    currency: string;
    sessions_remaining: number;
    status: string;
    sessions_used: number;
    sessions_total: number;
  } | null;
  statistics: {
    sessions_completed: number;
    sessions_upcoming: number;
    sessions_total: number;
  };
  upcoming_sessions: Session[];
  pending_homework: Homework[];
  upcoming_exams: Exam[];
  renewal_needed: boolean;
}

export interface TeacherDashboardStats {
  teacher: {
    name: string;
  };
  statistics: {
    students_count: number;
    sessions_today: number;
    sessions_completed: number;
    sessions_upcoming: number;
  };
  salary: {
    total_hours: number;
    hourly_rate: number;
    currency: string;
    total_earned: number;
    remaining: number;
  };
  upcoming_sessions: Session[];
  recent_homework: Homework[];
  upcoming_exams: Exam[];
}
