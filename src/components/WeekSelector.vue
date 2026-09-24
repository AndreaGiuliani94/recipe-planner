<script setup lang="ts">
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { ArrowPathIcon, CalendarDaysIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue';
import '@vuepic/vue-datepicker/dist/main.css'
import { VueDatePicker } from '@vuepic/vue-datepicker';

const props = defineProps<{
  currentWeekStart: Date
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'today'): void
  (e: 'select-date', dateStr: string): void
}>()

// Questa variabile conterrà la data selezionata nel nuovo calendario
const selectedDate = ref<Date | null>(null)

// 2. La nuova funzione che gestisce la selezione
const handleDateChange = (newDate: Date | null) => {
  if (newDate) {
    const dateString = format(newDate, 'yyyy-MM-dd')
    emit('select-date', dateString)
    
    selectedDate.value = null
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200">
          <CalendarIcon class="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-gray-800 tracking-tight">Il mio Planner</h1>
          <p class="text-sm text-gray-500 font-medium">
            <!-- Formattiamo la data che riceviamo come prop -->
            Settimana del {{ format(props.currentWeekStart, 'd MMMM', { locale: it }) }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      
      <!-- Tasto Indietro: emette 'prev' -->
        <button @click="emit('prev')"
            class="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors">
            <ChevronLeftIcon class="h-6 w-6" />
        </button>

        <div class="flex items-center gap-2">
        <!-- Tasto Oggi: emette 'today' -->
            <button @click="emit('today')"
                class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                <ArrowPathIcon class="h-3.5 w-3.5" />
                <p>Oggi</p>
            </button>

            <div class="relative flex items-center">
                <VueDatePicker
                    v-model="selectedDate" 
                    @update:model-value="handleDateChange"
                    :time-picker="false"
                    :locale="it"
                    auto-apply
                    :dark="false"
                >
                    <template #trigger>
                        <button class="flex items-center p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                            <CalendarDaysIcon class="h-6 w-6" />
                            <p class="ml-1">Vai al...</p>
                        </button>
                    </template>
                </VueDatePicker>
            </div>
        </div>

      <!-- Tasto Avanti: emette 'next' -->
      <button @click="emit('next')"
        class="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors">
        <ChevronRightIcon class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>

<style>
:root {
  --dp-primary-color: #10b981; /* Colore Emerald-500 di Tailwind */
  --dp-primary-text-color: #ffffff;
  --dp-border-radius: 1rem; /* Arrotondamento in stile con la tua app */
}
</style>