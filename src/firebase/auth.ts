import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User, 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import app from './config';

// Get auth and db from the same app instance
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export const signUp = async (email: string, password: string, userData: { name: string; role: string }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: userData.name,
      role: userData.role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login time
    await setDoc(doc(db, 'users', user.uid), {
      lastLogin: new Date().toISOString()
    }, { merge: true });
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User data not found' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserRole = async (uid: string, newRole: string) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      role: newRole
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const addMissingRoleField = async (uid: string, role: string = 'user') => {
  try {
    await setDoc(doc(db, 'users', uid), {
      role: role
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Google Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document for Google sign-in
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'משתמש',
        role: 'user', // Default role for Google users
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        provider: 'google'
      });
    } else {
      // Update last login time for existing user
      await setDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document for Google sign-in
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || 'משתמש',
          role: 'user', // Default role for Google users
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          provider: 'google'
        });
      } else {
        // Update last login time for existing user
        await setDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }
      
      return { success: true, user };
    }
    return { success: false, error: 'No redirect result' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Phone Authentication functions
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initializeRecaptcha = (elementId: string) => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
  
  return recaptchaVerifier;
};

export const sendPhoneVerification = async (phoneNumber: string, elementId: string = 'recaptcha-container') => {
  try {
    const appVerifier = initializeRecaptcha(elementId);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    
    return { 
      success: true, 
      confirmationResult,
      message: 'קוד אימות נשלח בהצלחה'
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message,
      message: 'שגיאה בשליחת קוד האימות'
    };
  }
};

export const verifyPhoneCode = async (confirmationResult: any, code: string) => {
  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document for phone sign-in
      await setDoc(doc(db, 'users', user.uid), {
        phoneNumber: user.phoneNumber,
        name: user.displayName || `משתמש ${user.phoneNumber?.slice(-4)}`,
        role: 'user', // Default role for phone users
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        provider: 'phone'
      });
    } else {
      // Update last login time for existing user
      await setDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};
