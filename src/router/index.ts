import { useAuthStore } from '@/stores/auth'
import PlannerView from '@/views/PlannerView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/login', 
      component: () => import('../views/LoginView.vue') 
    },
    {
      path: '/',
      name: 'home',
      component: PlannerView, 
      meta: { requiresAuth: true }
    },
    {
      path: '/profilo',
      name: 'profile',
      // Caricamento pigro (lazy-loading) per performance migliori
      component: () => import('../views/ProfileView.vue'), 
      meta: { requiresAuth: true }
    },
    {
      path: '/ricette',
      name: 'recipes',
      // Caricamento pigro (lazy-loading) per performance migliori
      component: () => import('../views/RecipesListView.vue'), 
      meta: { requiresAuth: true }
    },
    {
      path: '/setup-group',
      name: 'setup-group',
      // Caricamento pigro (lazy-loading) per performance migliori
      component: () => import('../views/SetupGroupView.vue'), 
      meta: { requiresAuth: true }
    },
    {
      path: '/spesa',
      name: 'shopping-chart',
      // Caricamento pigro (lazy-loading) per performance migliori
      component: () => import('../views/ShoppingListView.vue'), 
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  // Se la rotta richiede auth e l'utente non è loggato
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  // Se l'utente è loggato ma non ha ancora un gruppo (e non è già nella pagina setup)
  if (authStore.isAuthenticated && !authStore.activeGroupId && to.path !== '/setup-group') {
    return '/setup-group'
  }
})

export default router
