import { defineStore } from "pinia";
import { ref } from "vue";
import { plannerService } from "../services/plannerService";
import { useAuthStore } from "./auth";

export const usePlannerStore = defineStore("planner", () => {
  const entries = ref<any[]>([]);
  const isLoading = ref(false);
  const authStore = useAuthStore();

  async function loadRange(start: string, end: string) {
    if (!authStore.activeGroupId) return;
    isLoading.value = true;
    try {
      entries.value = await plannerService.getByRange(
        authStore.activeGroupId,
        start,
        end,
      );
    } finally {
      isLoading.value = false;
    }
  }

  async function saveMeal(date: string, meal_type: string, recipe_id: string) {
    if (!authStore.activeGroupId) {
      console.error("Nessun gruppo attivo selezionato");
      return;
    }
    await plannerService.upsertEntry({
      date: date,
      meal_type: meal_type,
      recipe_id: recipe_id,
      group_id: authStore.activeGroupId,
    });
    // In questo caso ricarichiamo per semplicità, ma potremmo anche aggiornare l'array in locale
  }

  return { entries, isLoading, loadRange, saveMeal };
});
