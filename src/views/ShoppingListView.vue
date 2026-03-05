<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { format, addDays } from 'date-fns'
import { ShoppingCartIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { it } from 'date-fns/locale'
import type { ShoppingItem } from '@/types'
import { useShoppingStore } from '@/stores/shopping'
import { usePlannerStore } from '@/stores/planner'

const plannerStore = usePlannerStore();
const shoppingStore = useShoppingStore()
const isLoading = ref(true)

const groupedShoppingList = computed(() => {
  const groups: Record<string, ShoppingItem[]> = {}

  plannerStore.entries.forEach(item => {
    const recipe = item.recipes;
    const ingredients: any[] = [];
    ingredients.push(...recipe.ingredients)
    ingredients.forEach( ing => {
      ing.name.toLowerCase().trim()
      if (!groups[ing.name]) 
        groups[ing.name] = []
      groups[ing.name]?.push(ing)}
  )
  })

  return groups
})

const syncWithPlanner = async () => {
  isLoading.value = true

  const start = format(new Date(), 'yyyy-MM-dd')
  const end = format(addDays(new Date(), 6), 'yyyy-MM-dd')

  
  await plannerStore.loadMeals(start, end);

  isLoading.value = false
}

const toggleOwned = async (item: ShoppingItem) => {
  const newStatus = !item.is_owned
  item.is_owned = newStatus // Update locale immediato per velocità UI

  await supabase
    .from('shopping_list')
    .update({ is_owned: newStatus })
    .eq('id', item.id)
}

onMounted(async () => {
  await syncWithPlanner()
  // await shoppingStore.subscribe()
})

onUnmounted(async () => {
  // await shoppingStore.unsubscribe()
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <div class="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200">
          <ShoppingCartIcon class="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-gray-900">Lista della Spesa</h1>
          <p class="text-sm text-gray-500 font-medium">
            Dal {{ format(new Date(), 'dd MMM', { locale: it }) }}
            al {{ format(addDays(new Date(), 6), 'dd MMM', { locale: it }) }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <ArrowPathIcon class="h-8 w-8 text-emerald-500 animate-spin" />
    </div>

    <div v-else class="space-y-2">
      <div v-for="(items, name) in groupedShoppingList" :key="name"
        class="bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3">
          <h3 class="font-bold text-gray-800 capitalize text-lg">{{ name }}</h3>

          <div class="flex flex-wrap gap-2">
            <button v-for="item in items" :key="item.id" @click="toggleOwned(item)"
              class="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all text-sm font-bold" :class="item.is_owned
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-inner'
                : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-300'">
              <CheckCircleIcon v-if="item.is_owned" class="h-4 w-4" />
              {{ item.quantity }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>