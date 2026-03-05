import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";
import { recipeService } from "@/services/recipeServices";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export const useRecipeStore = defineStore("recipes", () => {
  const recipes = ref<any[]>([]);
  const isLoading = ref(false);
  const isLoaded = ref(false); // Flag per la cache
  const authStore = useAuthStore();
  let activeChannel: RealtimeChannel | null;

  // Sottoscrizione Real-time
  async function subscribe() {
    if (activeChannel) {
      await supabase.removeChannel(activeChannel);
    }

    activeChannel = supabase
      .channel("public:recipes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recipes",
          filter: `group_id=eq.${authStore.activeGroupId}`,
        },
        async (payload) => {
          // Se qualcuno aggiunge o modifica, ricarichiamo la lista
          // (Ricarichiamo tutto per avere anche gli ingredienti legati)
          if (authStore.activeGroupId)
            recipes.value = await recipeService.getAll(authStore.activeGroupId);
        },
      )
      .subscribe();
  }

  async function unsubscribe(){
    if (activeChannel) {
      await supabase.removeChannel(activeChannel)
      activeChannel = null;
    }
  }

  // Carica le ricette solo se non sono già in memoria (cache)
  async function loadRecipes(forceRefresh = false) {
    if ((isLoaded.value && !forceRefresh) || !authStore.activeGroupId) return;

    isLoading.value = true;
    try {
      recipes.value = await recipeService.getAll(authStore.activeGroupId);
      isLoaded.value = true;
    } catch (error) {
      console.error("Errore caricamento ricette:", error);
    } finally {
      isLoading.value = false;
    }
  }

  // Azione per aggiungere una ricetta e rinfrescare lo store
  async function addRecipe(recipeData: any, ingredientsData: any[]) {
    try {
      if (authStore.activeGroupId)
        await recipeService.create(
          recipeData,
          ingredientsData,
          authStore.activeGroupId,
        );
      // Dopo l'insert, forziamo il refresh per avere i dati aggiornati
      await loadRecipes(true);
    } catch (error) {
      console.error("Errore creazione ricetta:", error);
      throw error;
    }
  }

  // Azione per eliminare e rinfrescare
  async function removeRecipe(recipeId: string) {
    try {
      if (authStore.activeGroupId)
        await recipeService.delete(recipeId, authStore.activeGroupId);
      recipes.value = recipes.value.filter((r) => r.id !== recipeId);
    } catch (error) {
      console.error("Errore eliminazione ricetta:", error);
    }
  }

  async function upsertRecipe(recipe: any, ingredients: any[]) {
    try {
      if (authStore.activeGroupId)
        await recipeService.upsertRecipe(
          recipe,
          ingredients,
          authStore.activeGroupId,
        );
      await loadRecipes(true);
    } catch (error) {
      console.error("Errore eliminazione ricetta:", error);
    }
  }

  return {
    recipes,
    isLoading,
    subscribe,
    unsubscribe,
    loadRecipes,
    addRecipe,
    removeRecipe,
    upsertRecipe,
  };
});
