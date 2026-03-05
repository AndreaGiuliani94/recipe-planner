<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'
import { PlusIcon, UserGroupIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const groupName = ref('')
const inviteCode = ref('')
const loading = ref(false)

// OPZIONE A: Crea un nuovo gruppo
const createGroup = async () => {
  if (!groupName.value) return
  loading.value = true
  try {
    await authStore.handleCreateGroup(groupName.value)
    router.push('/')
  } catch (e: any) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

// OPZIONE B: Unisciti a un gruppo esistente
const joinGroup = async () => {
  if (!inviteCode.value) return
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Verifichiamo che il codice (UUID) esista
    const { data: existingGroup, error: gError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', inviteCode.value)
      .single()
    
    if (!existingGroup) throw new Error("Codice gruppo non valido.")

    // Colleghiamo l'utente
    const { error: pError } = await supabase
      .from('profiles')
      .update({ group_id: existingGroup.id })
      .eq('id', user?.id)
    if (pError) throw pError

    router.push('/')
  } catch (e: any) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-black text-gray-900 tracking-tight">Benvenuto!</h2>
        <p class="mt-2 text-gray-500 font-medium">Per iniziare, configura il tuo spazio condiviso.</p>
      </div>

      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-4 text-emerald-600">
          <PlusIcon class="h-6 w-6" />
          <h3 class="font-black uppercase text-xs tracking-widest">Crea un nuovo gruppo</h3>
        </div>
        <input v-model="groupName" type="text" placeholder="Es. Famiglia Rossi" class="w-full p-3 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-emerald-500" />
        <button @click="createGroup" :disabled="loading" class="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all flex justify-center items-center gap-2">
          Crea Gruppo <ArrowRightIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="relative py-4">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
        <div class="relative flex justify-center text-sm"><span class="px-2 bg-gray-50 text-gray-400 font-bold uppercase italic">Oppure</span></div>
      </div>

      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-4 text-blue-600">
          <UserGroupIcon class="h-6 w-6" />
          <h3 class="font-black uppercase text-xs tracking-widest">Unisciti a un familiare</h3>
        </div>
        <input v-model="inviteCode" type="text" placeholder="Incolla il codice gruppo" class="w-full p-3 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
        <button @click="joinGroup" :disabled="loading" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
          Unisciti <ArrowRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>