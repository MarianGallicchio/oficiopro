import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const env = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
} as { apiKey?: string; authDomain?: string; projectId?: string };

/** ¿Hay credenciales de Firebase presentes en el entorno? */
export const isFirebaseConfigured = Boolean(env.apiKey && env.projectId);

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

/**
 * Devuelve la instancia de Auth o null si la app no está configurada.
 * Nunca lanza: permite correr la app en "modo demo" sin credenciales.
 */
export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (!cachedApp) {
    cachedApp = getApps().length ? getApp() : initializeApp({
      apiKey: env.apiKey!,
      authDomain: env.authDomain,
      projectId: env.projectId!,
    });
  }
  if (!cachedAuth) cachedAuth = getAuth(cachedApp);
  return cachedAuth;
}
