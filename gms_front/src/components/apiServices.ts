import api from './api';

// ============== Типы ==============

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  timestamp?: string;
}

export interface Membership {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  features: string[];
}

export interface UserMembership {
  id: number;
  user: { id: number };
  membership: Membership;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
}

export interface Coach {
  id: number;
  user: { id: number; email: string; name: string };
  specialization: string;
  bio?: string;
  isActive: boolean;
  rating?: number;
}

export interface TrainingSchedule {
  id: number;
  coach: Coach;
  trainingName: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  description?: string;
}

export interface Locker {
  id: number;
  lockerNumber: string;
  isAvailable: boolean;
  location?: string;
}

export interface LockerRent {
  id: number;
  locker: Locker;
  user: { id: number; email: string; name: string };
  rentStartTime: string;
  rentEndTime?: string;
  isActive: boolean;
}

export interface AttendanceReport {
  totalVisits: number;
  uniqueMembers: number;
  averageVisitsPerMember: number;
  peakHours: { [hour: string]: number };
  dailyStats: { date: string; visits: number }[];
}

export interface UserStatistics {
  totalUsers: number;
  activeMembers: number;
  expiredMemberships: number;
  expiringThisMonth: number;
  newUsersThisMonth: number;
  membershipDistribution: { [plan: string]: number };
}

// ============== USER API ==============

export const userApi = {
  // Получить текущего пользователя
  getCurrentUser: () => api.get<ApiResponse<any>>('/users/me'),
  
  // Создать нового пользователя
  createUser: (userData: { email: string; password: string; name: string; role?: string }) =>
    api.post<ApiResponse<any>>('/users', userData),
  
  // Получить пользователя по email
  getUserByEmail: (email: string) =>
    api.get<ApiResponse<any>>(`/users/${email}`),
  
  // Обновить пользователя
  updateUser: (userData: any) =>
    api.put<ApiResponse<any>>('/users', userData),
  
  // Удалить пользователя
  deleteUser: (id: number) =>
    api.delete<ApiResponse<void>>(`/users/${id}`),
  
  // Логин
  login: (email: string, password: string) =>
    api.post<{ token: string; role: string; email: string }>('/users/login', { email, password }),
};

// ============== MEMBERSHIP API ==============

export const membershipApi = {
  // Получить все абонементы
  getAllMemberships: () =>
    api.get<ApiResponse<Membership[]>>('/memberships'),
  
  // Получить активные абонементы
  getActiveMemberships: () =>
    api.get<ApiResponse<Membership[]>>('/memberships/active'),
  
  // Получить абонемент по ID
  getMembershipById: (id: number) =>
    api.get<ApiResponse<Membership>>(`/memberships/${id}`),
  
  // Создать новый тип абонемента (только для админа)
  createMembership: (membershipData: Partial<Membership>) =>
    api.post<ApiResponse<Membership>>('/memberships', membershipData),
  
  // Обновить абонемент (только для админа)
  updateMembership: (id: number, membershipData: Partial<Membership>) =>
    api.put<ApiResponse<Membership>>(`/memberships/${id}`, membershipData),
  
  // Удалить абонемент (только для админа)
  deleteMembership: (id: number) =>
    api.delete<ApiResponse<void>>(`/memberships/${id}`),
};

// ============== USER MEMBERSHIP API ==============

export const userMembershipApi = {
  // Получить все абонементы пользователя
  getUserMemberships: (userId: number) =>
    api.get<ApiResponse<UserMembership[]>>(`/user-memberships/user/${userId}`),
  
  // Получить активный абонемент пользователя
  getActiveUserMembership: (userId: number) =>
    api.get<ApiResponse<UserMembership>>(`/user-memberships/user/${userId}/active`),
  
  // Получить абонемент по ID
  getUserMembershipById: (id: number) =>
    api.get<ApiResponse<UserMembership>>(`/user-memberships/${id}`),
  
  // Назначить абонемент пользователю (только для админа)
  assignMembership: (membershipData: Partial<UserMembership>) =>
    api.post<ApiResponse<UserMembership>>('/user-memberships', membershipData),
  
  // Обновить абонемент пользователя
  updateUserMembership: (id: number, membershipData: Partial<UserMembership>) =>
    api.put<ApiResponse<UserMembership>>(`/user-memberships/${id}`, membershipData),
  
  // Удалить абонемент пользователя
  deleteUserMembership: (id: number) =>
    api.delete<ApiResponse<void>>(`/user-memberships/${id}`),
};

// ============== TRAINING API ==============

export const trainingApi = {
  // Получить всех активных тренеров
  getActiveCoaches: () =>
    api.get<Coach[]>('/trainings/coaches'),
  
  // Получить тренеров по специализации
  getCoachesBySpecialization: (specialization: string) =>
    api.get<Coach[]>(`/trainings/coaches/specialization/${specialization}`),
  
  // Создать профиль тренера (только для админа)
  createCoach: (userId: number, specialization: string, bio?: string) =>
    api.post<Coach>('/trainings/coaches/create', null, {
      params: { userId, specialization, bio }
    }),
  
  // Получить расписание тренера
  getCoachSchedules: (coachId: number) =>
    api.get<TrainingSchedule[]>(`/trainings/schedules/coach/${coachId}`),
  
  // Получить предстоящие тренировки
  getUpcomingSchedules: () =>
    api.get<TrainingSchedule[]>('/trainings/schedules/upcoming'),
  
  // Создать расписание тренировки (только для тренера)
  createSchedule: (scheduleData: {
    trainingName: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    description?: string;
  }) =>
    api.post<TrainingSchedule>('/trainings/schedules/create', null, {
      params: scheduleData
    }),
  
  // Записаться на тренировку
  bookTraining: (scheduleId: number) =>
    api.post<any>(`/trainings/schedules/${scheduleId}/book`),
  
  // Отменить запись на тренировку
  cancelBooking: (bookingId: number) =>
    api.delete<any>(`/trainings/bookings/${bookingId}`),
};

// ============== LOCKER API ==============

export const lockerApi = {
  // Получить доступные шкафчики
  getAvailableLockers: () =>
    api.get<Locker[]>('/lockers/available'),
  
  // Получить количество доступных шкафчиков
  getAvailableLockerCount: () =>
    api.get<number>('/lockers/available/count'),
  
  // Арендовать шкафчик
  rentLocker: (lockerId: number) =>
    api.post<LockerRent>(`/lockers/rent/${lockerId}`),
  
  // Освободить шкафчик
  releaseLocker: (rentId: number) =>
    api.post<string>(`/lockers/release/${rentId}`),
  
  // Получить активную аренду пользователя
  getMyActiveRent: () =>
    api.get<LockerRent | null>('/lockers/my-rent'),
  
  // Получить историю аренды пользователя
  getMyRentHistory: () =>
    api.get<LockerRent[]>('/lockers/my-history'),
};

// ============== ADMIN API ==============

export const adminApi = {
  // Удалить клиента (только для админа)
  deleteUser: (userId: number) =>
    api.delete<string>(`/admin/users/${userId}`),
  
  // Получить отчёт посещаемости (только для админа)
  getAttendanceReport: (month?: string) =>
    api.get<AttendanceReport>('/admin/reports/attendance', {
      params: { month }
    }),
  
  // Получить популярность программ (только для админа)
  getProgramPopularity: () =>
    api.get<{ [program: string]: number }>('/admin/reports/program-popularity'),
  
  // Получить месячную выручку (только для админа)
  getMonthlyRevenue: (month?: string) =>
    api.get<number>('/admin/reports/monthly-revenue', {
      params: { month }
    }),
  
  // Получить статистику пользователей (только для админа)
  getUserStatistics: () =>
    api.get<UserStatistics>('/admin/reports/user-statistics'),
  
  // Получить dashboard с метриками (только для админа)
  getDashboard: () =>
    api.get<any>('/admin/dashboard'),
  
  // Получить истекающие абонементы (только для админа)
  getExpiringMemberships: (days?: number) =>
    api.get<any[]>('/admin/reports/expiring-memberships', {
      params: { days }
    }),
};

// ============== Экспорт всех API ==============

export const apiServices = {
  user: userApi,
  membership: membershipApi,
  userMembership: userMembershipApi,
  training: trainingApi,
  locker: lockerApi,
  admin: adminApi,
};

export default apiServices;
