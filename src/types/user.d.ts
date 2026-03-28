export interface User {
  uid: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: string;
  submissionsCount: number;
  lastLogin: string;
  updatedAt?: string;
}

export interface AuthContextType {
  currentUser: any | null;
  userData: User | null;
  loading: boolean;
  register: (email: string, password: string, fullName: string) => Promise<{
    success: boolean;
    user?: any;
    error?: string;
    code?: string;
  }>;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    user?: any;
    error?: string;
    code?: string;
  }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  fetchUserData: (userId: string) => Promise<User | null>;
}