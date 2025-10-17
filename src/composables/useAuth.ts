import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from '../firebase-app';

interface AuthResult {
  success: boolean;
  error?: string;
}

const user = ref<User | null>(null);
const loading = ref(true);

export function useAuth() {
  let unsubscribe: Unsubscribe | null = null;

  onMounted(() => {
    // Listen for auth state changes
    unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
      loading.value = false;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  return {
    user: user as Ref<User | null>,
    loading: loading as Ref<boolean>,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
  };
}
