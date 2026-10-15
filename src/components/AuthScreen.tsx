import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, User as UserIcon, AlertTriangle, Info, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

type Mode = 'login' | 'register';

const GOOGLE_SVG = (className: string) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.06 12.25c0-.86-.08-1.68-.22-2.47H12v4.68h5.5a4.7 4.7 0 0 1-2.04 3.09v2.56h3.3c1.93-1.78 2.3-4.42 2.3-7.86z"/>
    <path fill="#34A853" d="M12 23.5c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.08.98-3.45.98-2.65 0-4.9-1.79-5.7-4.2H2.9v2.65A11.5 11.5 0 0 0 12 23.5z"/>
    <path fill="#FBBC05" d="M6.3 15.25a6.9 6.9 0 0 1 0-4.4V8.2H2.9a11.5 11.5 0 0 0 0 10.35l3.4-2.65z"/>
    <path fill="#EA4335" d="M12 5.7c1.5 0 2.84.51 3.9 1.52l2.9-2.9C17.05 2.68 14.74 1.75 12 1.75A11.5 11.5 0 0 0 2.9 8.2l3.4 2.65c.8-2.4 3.05-4.15 5.7-4.15z"/>
  </svg>
);

const FACEBOOK_SVG = (className: string) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12z"/>
  </svg>
);

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition';

export const AuthScreen: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    registerWithEmail,
    resetPassword,
    enterDemoMode,
    isFirebaseConfigured,
  } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSocial = async (fn: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e: unknown) {
      const code = (e as { code?: string }).code || '';
      setError(
        code.includes('popup-closed') || code.includes('cancelled')
          ? 'Ventana cerrada antes de terminar el ingreso.'
          : isFirebaseConfigured
          ? 'No se pudo iniciar sesión. Intentá de nuevo.'
          : 'Para habilitar Google/Facebook configurá Firebase primero (ver .env.example).'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          return;
        }
        await registerWithEmail(name, email.trim(), password);
      }
    } catch (e: unknown) {
      const code = (e as { code?: string }).code || '';
      const msgs: Record<string, string> = {
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
        'auth/user-not-found': 'No existe una cuenta con ese email.',
        'auth/wrong-password': 'Email o contraseña incorrectos.',
        'auth/email-already-in-use': 'Ya existe una cuenta con ese email. Probá Ingresar.',
        'auth/weak-password': 'La contraseña es demasiado débil.',
        'auth/invalid-email': 'El formato del email no es válido.',
        'auth/too-many-requests': 'Demasiados intentos. Esperá un momento.',
        AUTH_NOT_CONFIGURED: 'Configurá Firebase (VITE_FIREBASE_*) en tu .env para crear cuentas reales. Podés entrar en Modo Demo mientras tanto.',
      };
      setError(msgs[code] || 'Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Escribí tu email primero para reestablecer la contraseña.');
      return;
    }
    setError(null);
    try {
      await resetPassword(email.trim());
      setNotice('Te enviamos un email para reestablecer tu contraseña.');
    } catch {
      setError('No se pudo enviar el email de recuperación.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Fondo aurora animado */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo + título */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white grid place-items-center shadow-xl shadow-sky-500/30"
          >
            <Wallet className="w-8 h-8" strokeWidth={2.4} />
          </motion.div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Oficio<span className="text-sky-600 dark:text-sky-400">Pro</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Finanzas personales + gestión comercial para tu oficio
          </p>
        </div>

        {/* Card de acceso */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/10 p-6 space-y-5">
          {/* Tabs Ingresar / Crear cuenta */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setNotice(null); }}
                className="relative py-2 rounded-xl text-xs font-black transition-colors"
              >
                {mode === m && (
                  <motion.span
                    layoutId="authTabPill"
                    className="absolute inset-0 rounded-xl bg-sky-600 shadow-md shadow-sky-600/25"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${mode === m ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {m === 'login' ? 'Ingresar' : 'Crear cuenta'}
                </span>
              </button>
            ))}
          </div>

          {/* Botones sociales */}
          <div className="space-y-2">
            <button
              onClick={() => handleSocial(signInWithGoogle)}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-[0.98] transition shadow-xs disabled:opacity-50"
            >
              {GOOGLE_SVG('w-5 h-5')}
              Continuar con Google
            </button>
            <button
              onClick={() => handleSocial(signInWithFacebook)}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-white text-sm font-bold active:scale-[0.98] transition shadow-md disabled:opacity-50"
              style={{ backgroundColor: '#1877F2', boxShadow: '0 8px 20px -6px rgba(24,119,242,.45)' }}
            >
              {FACEBOOK_SVG('w-5 h-5')}
              Continuar con Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            o con tu email
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Form email */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nombre</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre o tu negocio"
                    className={`${inputCls} pl-9`}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className={`${inputCls} pl-9`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={`${inputCls} pl-9 pr-10`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg px-2.5 py-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                {error}
              </motion.p>
            )}

            {notice && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg px-2.5 py-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-px" />
                {notice}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-black shadow-lg shadow-sky-600/25 disabled:opacity-50 transition"
            >
              {busy ? 'Procesando…' : mode === 'login' ? 'Ingresar a mi cuenta' : 'Crear mi cuenta gratis'}
              {!busy && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <button onClick={handleReset} className="hover:text-sky-600 hover:underline font-semibold">
              ¿Olvidaste tu contraseña?
            </button>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setNotice(null); }}
              className="hover:text-sky-600 hover:underline font-semibold"
            >
              {mode === 'login' ? 'Crear una cuenta' : 'Ya tengo cuenta'}
            </button>
          </div>
        </div>

        {/* Modo demo */}
        {!isFirebaseConfigured && (
          <div className="mt-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900 dark:text-amber-200">
              <p className="font-bold mb-1">Login no configurado todavía</p>
              <p className="opacity-80 leading-relaxed">
                Para registro real con Google/Facebook/email configurá las variables <code className="font-mono">VITE_FIREBASE_*</code> en tu archivo <code className="font-mono">.env</code>. Mientras tanto:
              </p>
              <button
                onClick={enterDemoMode}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-[11px] font-black transition"
              >
                Entrar en Modo Demo →
              </button>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-[10px] text-slate-400">
          Tus datos locales quedan en tu dispositivo y están separados por cuenta.
        </p>
      </motion.div>
    </div>
  );
};
