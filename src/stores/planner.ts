import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { plannerService } from "../services/plannerService";
import { useAuthStore } from "./auth";
import { addDays, format, startOfWeek } from "date-fns";

export const usePlannerStore = defineStore("planner", () => {
  const entries = ref<any[]>([]);
  const isLoading = ref(false);
  const authStore = useAuthStore();
  const currentWeekStart = ref<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const weekDays = computed<Date[]>(() => {
    return Array.from({ length: 7 }, (_, i) =>
      addDays(currentWeekStart.value, i),
    );
  });

  async function init() {
    const start = weekDays.value[0];
    const end = weekDays.value[6];
    if(!start || ! end) return
    await loadRange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  }

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

  async function loadMeals(start: string, end: string) {
    if (!authStore.activeGroupId) return;
    isLoading.value = true;
    try {
      entries.value = await plannerService.getMeals(
        authStore.activeGroupId,
        start,
        end,
      );
    } finally {
      isLoading.value = false;
    }
  }

  async function saveMeal(date: Date, meal_type: string, recipe_id: string) {
    if (!authStore.activeGroupId) {
      console.error("Nessun gruppo attivo selezionato");
      return;
    }
    await plannerService.insertEntry({
      planned_date: format(date, 'yyyy-MM-dd'),
      meal_type: meal_type,
      recipe_id: recipe_id,
      group_id: authStore.activeGroupId,
    });
    await init();
  }

  async function removeEntry(id:string) {
    if (!authStore.activeGroupId) {
      console.error("Nessun gruppo attivo selezionato");
      return;
    }
    await plannerService.deleteEntry(id, authStore.activeGroupId)
    await init()
  }

  return { entries, isLoading, currentWeekStart, weekDays, init, loadRange, loadMeals, saveMeal, removeEntry };
});
