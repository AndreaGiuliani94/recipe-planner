import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/login', 
      component: () => import('@/views/LoginView.vue') 
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/PlannerView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profilo',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'), 
      meta: { requiresAuth: true }
    },
    {
      path: '/ricette',
      name: 'recipes',
      component: () => import('@/views/RecipesListView.vue'), 
      meta: { requiresAuth: true }
    },
    {
      path: '/setup-group',
      name: 'setup-group',
      component: () => import('@/views/SetupGroupView.vue'), 
      meta: { requiresAuth: true }
    },
    {
      path: '/spesa',
      name: 'shopping-chart',
      component: () => import('@/views/ShoppingListView.vue'), 
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const { data: { session } } = await supabase.auth.getSession();
  if (to.meta.requiresAuth && !session) {
    return '/login';
  }
  if (session) {
    await authStore.initialize();
    if (to.path === '/login') {
      return '/profilo';
    }
    if (!authStore.activeGroupId && to.path !== '/setup-group') {
      return '/setup-group';
    }
  }
})

export default router
