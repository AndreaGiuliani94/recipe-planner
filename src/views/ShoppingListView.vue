<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { format, addDays } from 'date-fns'
import { ShoppingCartIcon, CheckCircleIcon, ArchiveBoxIcon } from '@heroicons/vue/24/outline'
import { it } from 'date-fns/locale'

interface ShoppingItem {
  name: string
  quantity: string
  owned: boolean
}

const shoppingList = ref<ShoppingItem[]>([])
const isLoading = ref(true)

const generateList = async () => {
  isLoading.value = true
  const today = new Date()
  const start = format(today, 'yyyy-MM-dd')
  const end = format(addDays(today, 6), 'yyyy-MM-dd')

  // 1. Recuperiamo i pasti con le loro ricette e RELATIVI INGREDIENTI in una sola chiamata
  const { data: plannerData, error } = await supabase
    .from('planner')
    .select(`
      date,
      recipe_id,
      recipes (
        id,
        ingredients (
          name,
          quantity
        )
      )
    `)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })

  if (error || !plannerData) {
    isLoading.value = false
    return
  }

  // 2. Aggreghiamo gli ingredienti tenendo conto dei duplicati del planner
  const aggregated: Record<string, ShoppingItem> = {}

  plannerData.forEach(entry => {
    // Verifichiamo che la ricetta e gli ingredienti esistano
    const recipeIngredients = (entry.recipes as any)?.ingredients
    
    if (recipeIngredients) {
      recipeIngredients.forEach((ing: any) => {
        const key = ing.name.toLowerCase().trim()
        
        if (aggregated[key]) {
          // Se l'ingrediente c'è già (da un'altra ricetta o dallo stesso piatto ripetuto)
          aggregated[key].quantity += ` + ${ing.quantity}`
        } else {
          aggregated[key] = {
            name: ing.name,
            quantity: ing.quantity,
            owned: false
          }
        }
      })
    }
  })

  shoppingList.value = Object.values(aggregated)
  isLoading.value = false
}

onMounted(generateList)
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="flex items-center gap-3 mb-8">
      <div class="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-200">
        <ShoppingCartIcon class="h-8 w-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Lista della Spesa</h1>
        <p class="text-sm text-gray-500 font-medium">
          Dal {{ format(new Date(), 'dd MMM', { locale: it }) }} 
          al {{ format(addDays(new Date(), 6), 'dd MMM', { locale: it }) }}
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>

    <div v-else-if="shoppingList.length === 0" class="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
      <ArchiveBoxIcon class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 font-medium">Il tuo carrello è vuoto.<br>Pianifica qualche pasto nel planner!</p>
    </div>

    <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="divide-y divide-gray-50">
        <div 
          v-for="(item, index) in shoppingList" 
          :key="index"
          @click="item.owned = !item.owned"
          class="flex items-center p-5 hover:bg-emerald-50/30 transition-colors cursor-pointer group"
          :class="{ 'bg-gray-50/50': item.owned }"
        >
          <div class="mr-4">
            <div 
              class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all"
              :class="item.owned ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 group-hover:border-emerald-300'"
            >
              <CheckCircleIcon v-if="item.owned" class="h-5 w-5 text-white" />
            </div>
          </div>

          <div class="flex-1">
            <h3 class="font-bold text-gray-800 transition-all capitalize" :class="{ 'line-through text-gray-400': item.owned }">
              {{ item.name }}
            </h3>
            <p class="text-sm font-medium" :class="item.owned ? 'text-gray-300' : 'text-emerald-600'">
              {{ item.quantity }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>