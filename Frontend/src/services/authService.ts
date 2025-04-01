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
import { auth } from '../firebase/firebaseConfig';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

interface UserProfile {
  email: string;
  role: 'student' | 'instructor';
  firstName: string;
  lastName: string;
  bio?: string;
  photoURL?: string;
  createdAt?: Date;
}

export const signUp = async (
  email: string,
  password: string,
  role: 'student' | 'instructor',
  firstName: string,
  lastName: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateFirebaseProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });

    await sendEmailVerification(userCredential.user);

    const userData: UserProfile = {
      email,
      role,
      firstName,
      lastName,
      bio: '',
      createdAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    
    return userCredential;
  } catch (error: any) {
    let errorMessage = 'Signup failed';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email already in use';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters';
        break;
    }
    throw new Error(errorMessage);
  }
};

export const login = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before logging in');
    }

    return userCredential;
  } catch (error: any) {
    let errorMessage = 'Login failed';
    switch (error.code || error.message) {
      case 'auth/user-not-found':
        errorMessage = 'User not found';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Try again later';
        break;
      case 'Please verify your email before logging in':
        errorMessage = error.message;
        break;
    }
    throw new Error(errorMessage);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
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
    const user = auth.currentUser;
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
    const userRef = doc(db, 'users', user.uid);
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
    const userRef = doc(db, 'users', userId);
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

export const sendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    let errorMessage = 'Failed to send reset email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found';
    }
    throw new Error(errorMessage);
  }
};