import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../services/firebase';

export interface AppUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  provider: 'google' | 'facebook' | 'password' | 'demo';
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  enterDemoMode: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAppUser(u: User): AppUser {
  const providerId = u.providerData[0]?.providerId || 'password';
  return {
    uid: u.uid,
    displayName: u.displayName || u.email?.split('@')[0] || 'Usuario',
    email: u.email,
    photoURL: u.photoURL,
    provider: providerId.includes('google')
      ? 'google'
      : providerId.includes('facebook')
      ? 'facebook'
      : 'password',
  };
}

const DEMO_USER: AppUser = {
  uid: 'demo',
  displayName: 'Invitado (Demo)',
  email: null,
  photoURL: null,
  provider: 'demo',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesión demo recordada entre recargas
    if (localStorage.getItem('op_demo_session') === '1') {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? toAppUser(fbUser) : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const ensureAuth = () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('AUTH_NOT_CONFIGURED');
    return auth;
  };

  const social = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    const auth = ensureAuth();
    await signInWithPopup(auth, provider);
  };

  const value: AuthContextValue = useMemo(() => ({
    user,
    loading,
    isFirebaseConfigured,
    signInWithGoogle: () => social(new GoogleAuthProvider()),
    signInWithFacebook: () => social(new FacebookAuthProvider()),
    signInWithEmail: async (email, password) => {
      const auth = ensureAuth();
      await signInWithEmailAndPassword(auth, email, password);
    },
    registerWithEmail: async (name, email, password) => {
      const auth = ensureAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
    },
    resetPassword: async (email) => {
      const auth = ensureAuth();
      await sendPasswordResetEmail(auth, email);
    },
    enterDemoMode: () => {
      localStorage.setItem('op_demo_session', '1');
      setUser(DEMO_USER);
    },
    signOut: () => {
      localStorage.removeItem('op_demo_session');
      const auth = getFirebaseAuth();
      if (user?.provider !== 'demo' && auth) {
        fbSignOut(auth);
      } else {
        setUser(null);
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
