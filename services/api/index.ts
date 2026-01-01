/**
 * API Services Index
 * 
 * Central export point for all API services.
 * Import services from here for clean, consistent imports.
 * 
 * @example
 * import { studentsService, teachersService } from '@/services/api';
 * 
 * // Fetch students
 * const { data } = await studentsService.getAll();
 */

// Services
export { authService } from './auth.service';
export { studentsService } from './students.service';
export { teachersService } from './teachers.service';
export { sessionsService } from './sessions.service';
export { plansService } from './plans.service';
export { subscriptionsService } from './subscriptions.service';
export { examsService } from './exams.service';
export { homeworkService } from './homework.service';
export { subjectsService } from './subjects.service';
export { usersService } from './users.service';
export { financesService, transactionsService, expensesService, currenciesService } from './finances.service';
export { dashboardService } from './dashboard.service';

// Types
export * from './types';

// Axios instance (for custom requests)
export { default as api } from '@/lib/axios';
