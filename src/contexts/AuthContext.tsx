import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signIn, signUp, logout, getUserData, signInWithGoogle, handleGoogleRedirectResult, sendPhoneVerification, verifyPhoneCode, clearRecaptcha } from '../firebase/auth';

interface UserData {
  email?: string;
  phoneNumber?: string;
  name: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: { name: string; role: string }) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  sendPhoneVerification: (phoneNumber: string) => Promise<{ success: boolean; error?: string; confirmationResult?: any; message?: string }>;
  verifyPhoneCode: (confirmationResult: any, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle Google redirect result on page load
    const handleRedirect = async () => {
      const result = await handleGoogleRedirectResult();
      if (result.success) {
        // User will be set by onAuthStateChange
      }
    };
    
    handleRedirect();

    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch additional user data from Firestore
        const result = await getUserData(user.uid);
        if (result.success) {
          setUserData(result.data as UserData);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return result;
  };

  const handleSignUp = async (email: string, password: string, userData: { name: string; role: string }) => {
    const result = await signUp(email, password, userData);
    return result;
  };

  const handleSignInWithGoogle = async () => {
    const result = await signInWithGoogle();
    return result;
  };

  const handleSendPhoneVerification = async (phoneNumber: string) => {
    const result = await sendPhoneVerification(phoneNumber);
    return result;
  };

  const handleVerifyPhoneCode = async (confirmationResult: any, code: string) => {
    const result = await verifyPhoneCode(confirmationResult, code);
    return result;
  };

  const handleLogout = async () => {
    const result = await logout();
    // Clear reCAPTCHA on logout
    clearRecaptcha();
    return result;
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleSignInWithGoogle,
    sendPhoneVerification: handleSendPhoneVerification,
    verifyPhoneCode: handleVerifyPhoneCode,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
