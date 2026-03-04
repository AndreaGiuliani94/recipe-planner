<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { 
  Dialog, DialogPanel, DialogTitle, 
  TransitionChild, TransitionRoot 
} from '@headlessui/vue'
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ 
  isOpen: boolean, 
  recipeToEdit?: any
}>()
const emit = defineEmits(['close', 'saved'])

const recipeName = ref('')
const ingredients = ref([{ name: '', quantity: '' }])
const isSaving = ref(false)
const isDeleting = ref(false)

// Reazione all'apertura: se c'è una ricetta da modificare, carichiamo i dati
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.recipeToEdit) {
    recipeName.value = props.recipeToEdit.name
    // Cloniamo gli ingredienti per evitare modifiche dirette prima del salva
    ingredients.value = props.recipeToEdit.ingredients.map((i: any) => ({ ...i }))
  } else if (newVal) {
    resetFormState()
  }
})

const addIngredientRow = () => ingredients.value.push({ name: '', quantity: '' })
const removeIngredientRow = (index: number) => {
  if (ingredients.value.length > 1) ingredients.value.splice(index, 1)
}

const saveRecipe = async () => {
  if (!recipeName.value) return
  isSaving.value = true

  try {
    let recipeId = props.recipeToEdit?.id
    if (recipeId) {
      // 1. UPDATE Nome Ricetta
      await supabase.from('recipes').update({ name: recipeName.value }).eq('id', recipeId)
      // 2. DELETE vecchi ingredienti (approccio più semplice per l'aggiornamento)
      await supabase.from('ingredients').delete().eq('recipe_id', recipeId)
    } else {
      // 1. INSERT Nuova Ricetta
      const { data } = await supabase.from('recipes').insert([{ name: recipeName.value }]).select().single()
      recipeId = data.id
    }

    // 3. INSERT (o RE-INSERT) Ingredienti
    const finalIngs = ingredients.value
      .filter(i => i.name.trim() !== '')
      .map(i => ({ recipe_id: recipeId, name: i.name, quantity: i.quantity }))
    
    await supabase.from('ingredients').insert(finalIngs)
    
    emit('saved')
    closeModal()
  } catch (err) {
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

const deleteRecipe = async () => {
  if (!props.recipeToEdit) return
  
  const confirmDelete = confirm(`Sei sicuro di voler eliminare definitivamente "${props.recipeToEdit.name}"? Verrà rimossa anche dal planner.`)
  
  if (confirmDelete) {
    isDeleting.value = true
    try {
      // Nota: Grazie ai vincoli "ON DELETE CASCADE" definiti in precedenza su SQL, 
      // eliminando la ricetta verranno eliminati automaticamente anche i suoi ingredienti 
      // e i riferimenti nel planner.
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', props.recipeToEdit.id)
      
      if (error) throw error
      
      emit('saved')
      closeModal()
    } catch (err) {
      alert("Errore durante l'eliminazione")
      console.error(err)
    } finally {
      isDeleting.value = false
    }
  }
}

const resetFormState = () => {
  recipeName.value = ''
  ingredients.value = [{ name: '', quantity: '' }]
}

const closeModal = () => {
  resetFormState()
  emit('close')
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild 
        as="template" 
        enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" 
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex justify-center mt-40 p-4 text-center sm:items-center sm:p-0">
          <TransitionChild 
            as="template" 
            enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" 
            leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div class="bg-white px-6 pt-6 pb-4">
                <div class="flex items-center justify-between mb-4">
                  <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900">
                    {{ props.recipeToEdit ? 'Modifica Ricetta' : 'Nuova Ricetta' }}
                  </DialogTitle>
                  <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nome del piatto</label>
                    <input 
                      v-model="recipeName" 
                      type="text" 
                      placeholder="es. Risotto ai funghi"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ingredienti</label>
                    <div v-for="(ing, idx) in ingredients" :key="idx" class="flex gap-2 mb-2 items-center">
                      <input 
                        v-model="ing.name" 
                        placeholder="Nome"
                        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                      />
                      <input 
                        v-model="ing.quantity" 
                        placeholder="Q.tà"
                        class="w-24 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                      />
                      <button @click="removeIngredientRow(idx)" class="text-red-400 hover:text-red-600">
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </div>
                    
                    <button 
                      type="button" 
                      @click="addIngredientRow"
                      class="mt-2 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500"
                    >
                      <PlusIcon class="h-4 w-4 mr-1" /> Aggiungi ingrediente
                    </button>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button 
                  type="button" 
                  @click="saveRecipe"
                  :disabled="isSaving"
                  class="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                >
                  {{ isSaving ? 'Salvataggio...' : 'Salva Ricetta' }}
                </button>
                <div class="flex gap-2">
                  <button 
                    v-if="props.recipeToEdit"
                    type="button" 
                    @click="deleteRecipe"
                    class="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300"
                  >
                    <TrashIcon class="h-4 w-4" /> Elimina
                  </button>
                  <button 
                    type="button" 
                    @click="closeModal"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>