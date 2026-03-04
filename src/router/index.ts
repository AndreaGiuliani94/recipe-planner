import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/ricette',
      name: 'recipes',
      // Caricamento pigro (lazy-loading) per performance migliori
      component: () => import('../views/RecipesListView.vue')
    },
    {
      path: '/spesa',
      name: 'shopping-chart',
      // Caricamento pigro (lazy-loading) per performance migliori
      component: () => import('../views/ShoppingListView.vue')
    }
  ]
})

export default router
