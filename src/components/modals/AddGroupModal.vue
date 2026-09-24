<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  Dialog, DialogPanel, DialogTitle, 
  TransitionChild, TransitionRoot 
} from '@headlessui/vue'
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const props = defineProps<{ 
  isOpen: boolean
}>()
const emit = defineEmits(['close', 'saved'])

const groupName = ref('')
const isSaving = ref(false)

const saveNewGroup = async () => {
  if (!groupName.value) return
  isSaving.value = true
  try {
    await authStore.handleCreateGroup(groupName.value)
    emit('saved')
    closeModal()
  } catch (err) {
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

const resetFormState = () => {
  groupName.value = ''
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
                    <!-- {{ props.recipeToEdit ? 'Modifica Ricetta' : 'Nuova Ricetta' }} --> Nuovo Gruppo
                  </DialogTitle>
                  <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nome del gruppo</label>
                    <input 
                      v-model="groupName" 
                      type="text" 
                      placeholder="es. Risotto ai funghi"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    />
                  </div>

                </div>
              </div>

              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button 
                  type="button" 
                  @click="saveNewGroup"
                  :disabled="isSaving"
                  class="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                >
                  {{ isSaving ? 'Salvataggio...' : 'Salva Ricetta' }}
                </button>
                <div class="flex gap-2">
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