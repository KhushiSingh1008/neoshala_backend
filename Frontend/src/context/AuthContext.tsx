import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { 
  signUp, 
  login as firebaseLogin, 
  logout as firebaseLogout 
} from '../services/authService';
import { login as backendLogin, register as backendRegister } from '../services/api';
import { toast } from 'react-toastify';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { 
    username: string; 
    email: string; 
    password: string; 
    role: 'student' | 'instructor' 
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (userData: Partial<User>) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // If Firebase isn't configured, skip initializing auth to prevent runtime errors
    if (!isFirebaseConfigured || !auth) {
      console.warn('Firebase is not configured. Skipping auth initialization.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      try {
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // Get Firebase ID token
          try {
            const idToken = await firebaseUser.getIdToken();
            if (isMounted) setToken(idToken);
          } catch (tokenError) {
            console.error('Error getting token:', tokenError);
          }
          
          // Try to get user data from Firestore with timeout
          try {
            const userDocRef = doc(db!, 'users', firebaseUser.uid);
            const userDoc = await Promise.race([
              getDoc(userDocRef),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ]);
            
            if (isMounted) {
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const user: User = {
                  id: firebaseUser.uid,
                  _id: firebaseUser.uid,
                  username: userData.firstName && userData.lastName 
                    ? `${userData.firstName} ${userData.lastName}` 
                    : firebaseUser.displayName || userData.username || 'User',
                  email: firebaseUser.email || '',
                  role: userData.role || 'student',
                  location: userData.location,
                  age: userData.age,
                  bio: userData.bio,
                  profilePicture: firebaseUser.photoURL || userData.photoURL,
                  emailNotifications: userData.emailNotifications ?? true,
                  isVerified: firebaseUser.emailVerified,
                  createdAt: userData.createdAt?.toDate(),
                };
                setUser(user);
              } else {
                // Create basic user from Firebase data
                const user: User = {
                  id: firebaseUser.uid,
                  _id: firebaseUser.uid,
                  username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  email: firebaseUser.email || '',
                  role: 'student',
                  emailNotifications: true,
                  isVerified: firebaseUser.emailVerified,
                };
                setUser(user);
              }
            }
          } catch (firestoreError) {
            console.error('Firestore error:', firestoreError);
            // Fallback to Firebase user data
            if (isMounted) {
              const user: User = {
                id: firebaseUser.uid,
                _id: firebaseUser.uid,
                username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                role: 'student',
                emailNotifications: true,
                isVerified: firebaseUser.emailVerified,
              };
              setUser(user);
            }
          }
        } else {
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (isMounted) {
          setError('Authentication error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const updateUserData = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!isFirebaseConfigured || !auth) {
        // Backend fallback authentication
        const resp = await backendLogin({ email, password });
        const apiUser = resp.user as any;
        const unifiedUser: User = {
          id: (apiUser.id || apiUser._id)?.toString(),
          _id: (apiUser._id || apiUser.id)?.toString(),
          username: apiUser.username,
          email: apiUser.email,
          role: apiUser.role,
          location: apiUser.location,
          age: apiUser.age,
          bio: apiUser.bio,
          profilePicture: apiUser.profilePicture,
          emailNotifications: apiUser.emailNotifications,
          isVerified: apiUser.isVerified,
          createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : undefined,
        };
        setUser(unifiedUser);
        setFirebaseUser(null);
        setToken(resp.token);
        localStorage.setItem('token', resp.token);
        toast.success(resp.message || 'Login successful!');
        return;
      }

      await firebaseLogin(email, password);
      toast.success('Login successful!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { 
    username: string; 
    email: string; 
    password: string; 
    role: 'student' | 'instructor' 
  }) => {
    try {
      setLoading(true);
      setError(null);

      if (!isFirebaseConfigured || !auth) {
        const resp = await backendRegister(userData as any);
        const apiUser = resp.user as any;
        const unifiedUser: User = {
          id: (apiUser.id || apiUser._id)?.toString(),
          _id: (apiUser._id || apiUser.id)?.toString(),
          username: apiUser.username,
          email: apiUser.email,
          role: apiUser.role,
          location: apiUser.location,
          age: apiUser.age,
          bio: apiUser.bio,
          profilePicture: apiUser.profilePicture,
          emailNotifications: apiUser.emailNotifications,
          isVerified: apiUser.isVerified,
          createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : undefined,
        };
        setUser(unifiedUser);
        setFirebaseUser(null);
        setToken(resp.token);
        localStorage.setItem('token', resp.token);
        toast.success(resp.message || 'Registration successful!');
        return;
      }
      
      const [firstName, lastName] = userData.username.split(' ');
      await signUp(
        userData.email, 
        userData.password, 
        userData.role, 
        firstName || userData.username, 
        lastName || ''
      );
      
      toast.success('Registration successful! You can now access all features.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (isFirebaseConfigured && auth) {
        await firebaseLogout();
      }
      setToken(null);
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('token');
      toast.success('Logged out successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      token,
      login, 
      register, 
      logout, 
      updateUserData, 
      loading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};