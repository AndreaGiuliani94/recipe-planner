import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { recipeService } from '@/services/recipeServices'
import { supabase } from '@/lib/supabaseClient'

export const useRecipeStore = defineStore('recipes', () => {
  const recipes = ref<any[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false) // Flag per la cache
  const authStore = useAuthStore()

  // Sottoscrizione Real-time
  function subscribe() {
    return supabase
      .channel('public:recipes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'recipes',
        filter: `group_id=eq.${authStore.groupId}` 
      }, async (payload) => {
        // Se qualcuno aggiunge o modifica, ricarichiamo la lista
        // (Ricarichiamo tutto per avere anche gli ingredienti legati)
        recipes.value = await recipeService.getAll(authStore.groupId)
      })
      .subscribe()
  }

  // Carica le ricette solo se non sono già in memoria (cache)
  async function loadRecipes(forceRefresh = false) {
    if ((isLoaded.value && !forceRefresh) || !authStore.groupId) return
    
    isLoading.value = true
    try {
      recipes.value = await recipeService.getAll(authStore.groupId)
      isLoaded.value = true
    } catch (error) {
      console.error('Errore caricamento ricette:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Azione per aggiungere una ricetta e rinfrescare lo store
  async function addRecipe(recipeData: any, ingredientsData: any[]) {
    try {
      await recipeService.create(recipeData, ingredientsData, authStore.groupId)
      // Dopo l'insert, forziamo il refresh per avere i dati aggiornati
      await loadRecipes(true)
    } catch (error) {
      console.error('Errore creazione ricetta:', error)
      throw error
    }
  }

  // Azione per eliminare e rinfrescare
  async function removeRecipe(recipeId: string) {
    try {
      await recipeService.delete(recipeId, authStore.groupId)
      recipes.value = recipes.value.filter(r => r.id !== recipeId)
    } catch (error) {
      console.error('Errore eliminazione ricetta:', error)
    }
  }

  async function upsertRecipe(recipe: any, ingredients: any[]) {
        try {
            await recipeService.upsertRecipe(recipe, ingredients, authStore.groupId)
            await loadRecipes(true)
        } catch (error) {
            console.error('Errore eliminazione ricetta:', error)
        }
    }

  return { recipes, isLoading, subscribe, loadRecipes, addRecipe, removeRecipe, upsertRecipe }
})