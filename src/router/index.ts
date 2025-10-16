import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-app';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/barillet/:id/edit',
      name: 'barillet-edit',
      component: () => import('../views/BarilletEditorView.vue'), // Lazy-loaded, will be created later
      meta: { requiresAuth: true },
    },
  ],
});

// Helper function to get current auth state
const getCurrentUser = (): Promise<import('firebase/auth').User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Navigation guard for authentication
router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const user = await getCurrentUser();

  if (requiresAuth && !user) {
    // Redirect to login if route requires auth and user is not authenticated
    next({ name: 'login' });
  } else if (to.name === 'login' && user) {
    // Redirect to home if user is already authenticated and trying to access login
    next({ name: 'home' });
  } else {
    // Allow navigation
    next();
  }
});

export default router;
