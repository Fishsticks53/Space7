import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Keychain from 'react-native-keychain';
import * as api from '../api';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { disconnectSocket } from '../socket';
import type { AuthUser } from '../api';

const SERVICE = 'space7.session';

type Session = { token: string; user: AuthUser };

interface AuthContextValue {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: AuthUser | null;
  token: string | null;
  signIn: (identifier: string, password: string) => Promise<void>;
  verifySignup: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (changes: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function saveSession(session: Session) {
  await Keychain.setGenericPassword('session', JSON.stringify(session), {
    service: SERVICE,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((next: Session | null) => {
    setAuthToken(next?.token ?? null);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    disconnectSocket();
    applySession(null);
    await Keychain.resetGenericPassword({ service: SERVICE });
  }, [applySession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    Keychain.getGenericPassword({ service: SERVICE })
      .then(stored => {
        if (stored) applySession(JSON.parse(stored.password));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => setUnauthorizedHandler(null);
  }, [applySession, signOut]);

  const start = useCallback(
    async (next: Session) => {
      await saveSession(next);
      applySession(next);
    },
    [applySession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status: loading ? 'loading' : session ? 'signedIn' : 'signedOut',
      user: session?.user ?? null,
      token: session?.token ?? null,
      signIn: async (identifier, password) =>
        start(await api.login(identifier, password)),
      verifySignup: async (email, otp) =>
        start(await api.verifyOtp(email, otp)),
      signOut,
      updateUser: changes => {
        if (!session) return;
        const next = { ...session, user: { ...session.user, ...changes } };
        setSession(next);
        saveSession(next).catch(() => {});
      },
    }),
    [loading, session, signOut, start],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
