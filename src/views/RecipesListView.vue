<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { MagnifyingGlassIcon, BookOpenIcon, PlusIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import AddRecipeModal from '@/components/AddRecipeModal.vue'
import { useRecipeStore } from '../stores/recipes'

const recipeStore = useRecipeStore()
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedRecipe = ref<any>(null)

// Logica di ricerca potente: cerca nel nome E negli ingredienti
const filteredRecipes = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return recipeStore.recipes

    return recipeStore.recipes.filter(recipe => {
        const matchName = recipe.name.toLowerCase().includes(query)
        const matchIngredient = recipe.ingredients.some((ing: any) =>
            ing.name.toLowerCase().includes(query)
        )
        return matchName || matchIngredient
    })
})

const openEditModal = (recipe: any) => {
    selectedRecipe.value = recipe
    isModalOpen.value = true
}

const openCreateModal = () => {
    selectedRecipe.value = null
    isModalOpen.value = true
}

const handleSaved = () => {
    recipeStore.loadRecipes() // Ricarica la lista aggiornata
}

onMounted(async () => {
    await recipeStore.loadRecipes()
    await recipeStore.subscribe()
})

onUnmounted(async () => {
    await recipeStore.unsubscribe()
})
</script>

<template>
    <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div class="flex items-center gap-3">
                <div class="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200">
                    <BookOpenIcon class="h-7 w-7 text-white" />
                </div>
                <div>
                    <h1 class="text-2xl text-gray-900 font-extrabold">Le mie Ricette</h1>
                </div>
            </div>

            <div class="relative flex-1 max-w-md">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input v-model="searchQuery" type="text" placeholder="Cerca per nome o ingrediente..."
                    class="block w-full pl-10 pr-4 py-3 border-none rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm" />
            </div>
        </div>

        <div v-if="recipeStore.isLoading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="recipe in filteredRecipes" :key="recipe.id" @click="openEditModal(recipe)"
                class="cursor-pointer group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-xl font-bold text-gray-800 leading-tight capitalize">
                        {{ recipe.name }}
                    </h2>
                </div>

                <div class="flex flex-wrap gap-2 mt-auto">
                    <div v-for="ing in recipe.ingredients" :key="ing.id"
                        class="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <span class="text-emerald-600">•</span>
                        {{ ing.name }}
                        <span class="text-gray-400 font-normal ml-1">{{ ing.quantity }}</span>
                    </div>
                </div>

                <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PencilSquareIcon class="h-5 w-5 text-emerald-600" />
                </div>
            </div>

            <div v-if="filteredRecipes.length === 0"
                class="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p class="text-gray-500 font-medium italic">Nessuna ricetta trovata per questa ricerca.</p>
            </div>
        </div>
    </div>

    <button @click="openCreateModal"
        class="fixed bottom-28 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Aggiungi nuova ricetta">
        <PlusIcon class="h-8 w-8 transition-transform group-hover:rotate-90" />
    </button>

    <AddRecipeModal :isOpen="isModalOpen" :recipeToEdit="selectedRecipe" @close="isModalOpen = false"
        @saved="handleSaved" />
</template>