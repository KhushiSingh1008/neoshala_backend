import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  location?: string;
  age?: number;
  bio?: string;
  profilePicture?: string;
  emailNotifications?: boolean;
  isVerified?: boolean;
  createdAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    role: 'student' | 'instructor';
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (userData: Partial<User>) => void;
}

export interface UserProfile {
  email: string;
  role: 'student' | 'instructor' | 'admin';
  firstName: string;
  lastName: string;
  bio?: string;
  photoURL?: string;
  createdAt?: Date;
  emailVerified?: boolean;
  emailNotifications?: boolean;
}
