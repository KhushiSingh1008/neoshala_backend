import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  UserCredential,
  updateProfile as updateFirebaseProfile,
  User,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

interface UserProfile {
  email: string;
  role: 'student' | 'instructor';
  firstName: string;
  lastName: string;
  bio?: string;
  photoURL?: string;
  createdAt?: Date;
  emailVerified?: boolean;
  emailNotifications?: boolean;
}

const ensureFirebaseAuth = () => {
  if (!isFirebaseConfigured || !auth || !db) {
    const msg = 'Authentication is not configured. Please set VITE_FIREBASE_* in Frontend/.env';
    toast.error(msg);
    throw new Error(msg);
  }
};

export const signUp = async (
  email: string,
  password: string,
  role: 'student' | 'instructor',
  firstName: string,
  lastName: string
): Promise<UserCredential> => {
  try {
    ensureFirebaseAuth();

    // Validate inputs
    if (!email || !password || !firstName) {
      throw new Error('Please fill in all required fields');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
    
    await updateFirebaseProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });

    // Try to send verification email, but don't fail if it doesn't work
    try {
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/AuthPage',
        handleCodeInApp: false
      });
    } catch (emailError) {
      console.warn('Failed to send verification email:', emailError);
      toast.warning('Account created but verification email could not be sent. You can still login.');
    }

    const userData: UserProfile = {
      email,
      role,
      firstName,
      lastName,
      bio: '',
      createdAt: new Date(),
      emailVerified: false,
      emailNotifications: true
    };

    await setDoc(doc(db!, 'users', userCredential.user.uid), userData);
    
    toast.success('Registration successful! You can now access all features.');

    return userCredential;
  } catch (error: any) {
    let errorMessage = 'Signup failed';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists.';
        toast.info('This email is already registered. Try logging in instead, or use a different email address.');
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters long';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection and try again.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait a moment and try again.';
        break;
      default:
        errorMessage = error.message || 'Registration failed. Please try again.';
    }
    throw new Error(errorMessage);
  }
};

export const login = async (email: string, password: string): Promise<UserCredential> => {
  try {
    ensureFirebaseAuth();

    // Validate inputs
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }

    const userCredential = await signInWithEmailAndPassword(auth!, email, password);
    
    // No email verification required - user can access everything after login
    return userCredential;
  } catch (error: any) {
    let errorMessage = 'Login failed';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address. Please sign up first.';
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Incorrect email or password. Please try again.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please wait a moment and try again.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection and try again.';
        break;
      default:
        errorMessage = error.message || 'Login failed. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

export const logout = async (): Promise<void> => {
  try {
    ensureFirebaseAuth();
    await signOut(auth!);
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout');
  }
};

// Updated updateProfile to match ProfilePage usage
export const updateProfile = async (
  profileData: { displayName?: string; bio?: string }
): Promise<void> => {
  try {
    ensureFirebaseAuth();

    const user = auth!.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    // Update Firebase Auth profile
    if (profileData.displayName) {
      await updateFirebaseProfile(user, {
        displayName: profileData.displayName
      });
    }

    // Update Firestore document
    const userRef = doc(db!, 'users', user.uid);
    const updateData: Partial<UserProfile> = {};
    
    if (profileData.bio) {
      updateData.bio = profileData.bio;
    }
    if (profileData.displayName) {
      const [firstName, lastName] = profileData.displayName.split(' ');
      updateData.firstName = firstName;
      updateData.lastName = lastName;
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Profile update error:', error);
    throw new Error('Failed to update profile');
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    ensureFirebaseAuth();

    const userRef = doc(db!, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch profile');
  }
};

export const sendVerificationEmail = async (user?: User): Promise<void> => {
  try {
    ensureFirebaseAuth();

    const currentUser = user || auth!.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    await sendEmailVerification(currentUser, {
      url: window.location.origin + '/AuthPage',
      handleCodeInApp: false
    });
    toast.success('Verification email sent! Please check your inbox and spam folder.');
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    let errorMessage = 'Failed to send verification email';
    switch (error.code) {
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait before requesting another verification email';
        break;
      default:
        errorMessage = error.message || 'Failed to send verification email. Please try again';
    }
    throw new Error(errorMessage);
  }
};

// Function to resend verification email for current user
export const resendVerificationEmail = async (): Promise<void> => {
  try {
    ensureFirebaseAuth();

    const user = auth!.currentUser;
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    
    if (user.emailVerified) {
      toast.info('Your email is already verified!');
      return;
    }
    
    await sendVerificationEmail(user);
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    ensureFirebaseAuth();

    await sendPasswordResetEmail(auth!, email, {
      url: window.location.origin + '/AuthPage',
      handleCodeInApp: false
    });
    toast.success('Password reset email sent! Please check your inbox and spam folder.');
  } catch (error: any) {
    console.error('Password reset error:', error);
    let errorMessage = 'Failed to send reset email';
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait before trying again';
        break;
      default:
        errorMessage = error.message || 'Failed to send reset email. Please try again';
    }
    throw new Error(errorMessage);
  }
};

export const updateEmailPreferences = async (userId: string, enableNotifications: boolean): Promise<void> => {
  try {
    ensureFirebaseAuth();

    const userRef = doc(db!, 'users', userId);
    await updateDoc(userRef, {
      emailNotifications: enableNotifications
    });
    toast.success(
      enableNotifications 
        ? 'Email notifications enabled' 
        : 'Email notifications disabled'
    );
  } catch (error) {
    console.error('Error updating email preferences:', error);
    throw new Error('Failed to update email preferences');
  }
};