import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signIn, signUp, logout, getUserData, signInWithGoogle, handleGoogleRedirectResult, sendPhoneVerification, verifyPhoneCode, clearRecaptcha, setPasswordForGoogleAccount, linkEmailPasswordToGoogle, sendPasswordReset, changeUserPassword, updateUserName, updateUserRole } from '../firebase/auth';

interface UserData {
  email?: string;
  phoneNumber?: string;
  name: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  provider?: string;
  isOnline?: boolean;
  lastActivity?: any;
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
  setPasswordForGoogleAccount: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  linkEmailPasswordToGoogle: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserName: (newName: string) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (userId: string, newRole: string) => Promise<{ success: boolean; error?: string }>;
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
      console.log('🔄 AuthContext - onAuthStateChange triggered with user:', user);
      setUser(user);
      
      if (user) {
        console.log('👤 AuthContext - User exists, fetching data from Firestore for UID:', user.uid);
        // Fetch additional user data from Firestore
        const result = await getUserData(user.uid);
        console.log('🔍 AuthContext - getUserData result:', result);
        
        if (result.success && result.data) {
          // Check if we have the essential user data fields
          const hasEssentialData = result.data.name && (result.data.email || result.data.phoneNumber);
          
          if (hasEssentialData) {
            console.log('✅ AuthContext - Setting userData from Firestore:', result.data);
            setUserData(result.data as UserData);
          } else {
            console.warn('⚠️ AuthContext - Firestore data incomplete, merging with Auth data:', result.data);
            // Merge Firestore data with Firebase Auth data
            const mergedUserData = {
              name: result.data.name || user.displayName || user.email?.split('@')[0] || 'Unknown User',
              email: result.data.email || user.email || '',
              phoneNumber: result.data.phoneNumber || user.phoneNumber || '',
              role: result.data.role || 'user',
              createdAt: result.data.createdAt || new Date().toISOString(),
              lastLogin: result.data.lastLogin || new Date().toISOString(),
              provider: result.data.provider || user.providerData[0]?.providerId || 'unknown',
              isOnline: result.data.isOnline || true,
              lastActivity: result.data.lastActivity || new Date()
            };
            console.log('🔄 AuthContext - Using merged userData:', mergedUserData);
            setUserData(mergedUserData);
          }
        } else {
          console.error('❌ AuthContext - Firestore data not found, creating from Auth user');
          // Fallback: create userData from Firebase Auth user
          const fallbackUserData = {
            name: user.displayName || user.email?.split('@')[0] || 'Unknown User',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            provider: user.providerData[0]?.providerId || 'unknown'
          };
          console.log('🔄 AuthContext - Using fallback userData:', fallbackUserData);
          setUserData(fallbackUserData);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Removed page unload and visibility tracking to save Firebase quota

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Removed automatic user activity tracking to save Firebase quota

  // Removed user interaction tracking to save Firebase quota

  // Auto-logout after 8 hours
  useEffect(() => {
    if (!user) return;

    const loginTime = Date.now();
    const eightHours = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const warningTime = 7.5 * 60 * 60 * 1000; // 7.5 hours (30 minutes before logout)
    let warningShown = false;

    const checkSessionTimeout = () => {
      const currentTime = Date.now();
      const timeElapsed = currentTime - loginTime;
      
      // Show warning 30 minutes before logout
      if (timeElapsed >= warningTime && !warningShown) {
        warningShown = true;
        const language = localStorage.getItem('language') || 'he';
        const message = language === 'he' 
          ? 'הפגישה שלך תפג בעוד 30 דקות. האם ברצונך להמשיך לעבוד?'
          : 'Your session will expire in 30 minutes. Do you want to continue working?';
        
        if (window.confirm(message)) {
          // User wants to continue, reset the timer
          warningShown = false;
          // Reset the warning flag to allow another warning in 7.5 hours
          // The session will be extended by resetting the warning
        }
      }
      
      // Logout after 8 hours
      if (timeElapsed >= eightHours) {
        // Session expired, logout user
        handleLogout();
        const language = localStorage.getItem('language') || 'he';
        const logoutMessage = language === 'he' 
          ? 'הפגישה שלך פגה. אנא התחבר שוב.'
          : 'Your session has expired. Please log in again.';
        alert(logoutMessage);
      }
    };

    // Check every minute
    const interval = setInterval(checkSessionTimeout, 60000);

    // Also check on page visibility change (when user comes back to tab)
    const handleVisibilityChangeSession = () => {
      if (!document.hidden) {
        checkSessionTimeout();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChangeSession);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChangeSession);
    };
  }, [user]);

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

  const handleSetPasswordForGoogleAccount = async (newPassword: string) => {
    const result = await setPasswordForGoogleAccount(newPassword);
    return result;
  };

  const handleLinkEmailPasswordToGoogle = async (email: string, password: string) => {
    const result = await linkEmailPasswordToGoogle(email, password);
    return result;
  };

  const handleChangeUserPassword = async (currentPassword: string, newPassword: string) => {
    const result = await changeUserPassword(currentPassword, newPassword);
    return result;
  };

  const handleSendPasswordReset = async (email: string) => {
    const result = await sendPasswordReset(email);
    return result;
  };

  const handleUpdateUserName = async (newName: string) => {
    const result = await updateUserName(newName);
    if (result.success && user) {
      // Refresh user data after successful update
      const updatedUserData = await getUserData(user.uid);
      if (updatedUserData && updatedUserData.success && updatedUserData.data) {
        setUserData(updatedUserData.data as UserData);
      }
    }
    return result;
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    const result = await updateUserRole(userId, newRole);
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
    setPasswordForGoogleAccount: handleSetPasswordForGoogleAccount,
    linkEmailPasswordToGoogle: handleLinkEmailPasswordToGoogle,
    changeUserPassword: handleChangeUserPassword,
    sendPasswordReset: handleSendPasswordReset,
    updateUserName: handleUpdateUserName,
    updateUserRole: handleUpdateUserRole,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
