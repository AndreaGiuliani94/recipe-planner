<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { format, startOfWeek, addDays, subWeeks, addWeeks, isToday } from 'date-fns'
import { it } from 'date-fns/locale'
import { ArrowPathIcon, TrashIcon, CalendarDaysIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import AddRecipeModal from '../components/AddRecipeModal.vue'

const currentWeekStart = ref<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
const recipes = ref<any[]>([])
const plannerEntries = ref<any[]>([])
const isModalOpen = ref(false)
const pendingSelection = ref<{ date: Date, meal: string } | null>(null)

const weekDays = computed<Date[]>(() => {
  return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart.value, i))
})

const fetchData = async () => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  if (!start || !end) return

  const { data: rData } = await supabase.from('recipes').select('*').order('name')
  recipes.value = rData || []

  const { data: pData } = await supabase
    .from('planner')
    .select('*, recipes(name)')
    .gte('date', format(start, 'yyyy-MM-dd'))
    .lte('date', format(end, 'yyyy-MM-dd'))

  plannerEntries.value = pData || []
}

const handleNewSelection = (date: Date, meal: string, value: string) => {
  if (value === "NEW_RECIPE") {
    pendingSelection.value = { date, meal }
    isModalOpen.value = true
  } else if (value !== "") {
    addRecipeToMeal(date, meal, value)
  }
}

const addRecipeToMeal = async (date: Date, mealType: string, recipeId: string) => {
  await supabase.from('planner').insert({
    date: format(date, 'yyyy-MM-dd'),
    meal_type: mealType,
    recipe_id: recipeId
  })
  fetchData()
}

const onRecipeSaved = async (newId: string) => {
  await fetchData()
  if (pendingSelection.value) {
    await addRecipeToMeal(pendingSelection.value.date, pendingSelection.value.meal, newId)
  }
  isModalOpen.value = false
}

const removeEntry = async (id: string) => {
  const { error } = await supabase
    .from('planner')
    .delete()
    .eq('id', id)

  if (error) console.error(error)
  else fetchData() // Ricarica per aggiornare la vista
}

const jumpToToday = () => {
  currentWeekStart.value = startOfWeek(new Date(), { weekStartsOn: 1 })
  fetchData()
}

// Funzione per saltare a una data specifica
const goToDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.value) {
    const selectedDate = new Date(target.value)
    // Sincronizziamo l'inizio della settimana (Lunedì) basandoci sulla data scelta
    currentWeekStart.value = startOfWeek(selectedDate, { weekStartsOn: 1 })
    fetchData()
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8 font-sans text-gray-900">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200">
            <CalendarIcon class="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-gray-800 tracking-tight">Il mio Planner</h1>
            <p class="text-sm text-gray-500 font-medium">
              Settimana del {{ format(currentWeekStart, 'd MMMM', { locale: it }) }}
            </p>
          </div>
        </div>
      </div>
  
      <div class="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
  
        <button @click="currentWeekStart = subWeeks(currentWeekStart, 1); fetchData()"
          class="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors">
          <ChevronLeftIcon class="h-6 w-6" />
        </button>
  
        <div class="flex items-center gap-2">
          <button @click="jumpToToday"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
            <ArrowPathIcon class="h-3.5 w-3.5" />
            <p>Oggi</p>
          </button>
  
          <div class="relative">
            <label
              class="flex items-center p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
              <CalendarDaysIcon class="h-6 w-6" />
              <input type="date" @change="goToDate" class="absolute inset-0 opacity-0 cursor-pointer w-full" />
              <p>Vai al...</p>
            </label>
          </div>
        </div>
  
        <button @click="currentWeekStart = addWeeks(currentWeekStart, 1); fetchData()"
          class="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors">
          <ChevronRightIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
      
    

    <div class="space-y-6">
      <div v-for="day in weekDays" :key="day.toString()"
        class="bg-white border rounded-2xl shadow-sm transition-all overflow-hidden"
        :class="[isToday(day) ? 'ring-2 ring-emerald-500 border-transparent shadow-emerald-100 shadow-lg' : 'border-gray-100']">

        <div class="px-6 py-4 border-b flex justify-between items-center"
          :class="isToday(day) ? 'bg-emerald-50/50' : 'bg-gray-50/30'">
          <div>
            <h2 class="font-bold text-lg capitalize text-gray-800">{{ format(day, 'EEEE', { locale: it }) }}</h2>
            <p class="text-xs text-gray-400 font-medium tracking-wide">{{ format(day, 'dd MMMM yyyy', { locale: it }) }}
            </p>
          </div>
          <div v-if="isToday(day)"
            class="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
            Oggi
          </div>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="meal in ['pranzo', 'cena']" :key="meal" class="flex flex-col">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs font-black uppercase text-gray-400 tracking-widest">{{ meal }}</span>
              <div class="h-px bg-gray-100 flex-1"></div>
            </div>

            <div class="space-y-2 mb-4">
              <div
                v-for="entry in plannerEntries.filter(e => e.date === format(day, 'yyyy-MM-dd') && e.meal_type === meal)"
                :key="entry.id"
                class="group flex items-center justify-between bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 p-3 rounded-xl transition-all">
                <span class="text-sm font-medium text-gray-700 group-hover:text-emerald-900">{{ entry.recipes?.name
                }}</span>
                <button @click="removeEntry(entry.id)"
                  class="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="relative">
              <select
                @change="handleNewSelection(day, meal, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''"
                class="appearance-none w-full text-sm bg-white border-2 border-dashed border-gray-200 text-gray-500 py-2 px-4 rounded-xl hover:border-emerald-400 hover:text-emerald-600 focus:outline-none transition-all cursor-pointer">
                <option value="" disabled selected>+ Aggiungi un piatto...</option>
                <option v-for="r in recipes" :key="r.id" :value="r.id">{{ r.name }}</option>
                <option value="NEW_RECIPE" class="font-bold text-emerald-600">✨ Crea nuova ricetta...</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AddRecipeModal :isOpen="isModalOpen" @close="isModalOpen = false" @saved="onRecipeSaved" />
  </div>
</template>