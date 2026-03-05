<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const isRegistering = ref(false)
const loading = ref(false)

const handleAuth = async () => {
  loading.value = true
  try {
    if (isRegistering.value) {
      // 1. Registrazione
      await authService.signUp(email.value, password.value)
      alert("Controlla la tua email per confermare l'iscrizione!")
    } else {
      // 2. Login
      await authService.login(email.value, password.value)
      authStore.initialize()
      router.push('/')
    }
  } catch (e: any) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-emerald-600 italic tracking-tighter">EasyPlanner</h1>
        <p class="text-gray-500 font-medium mt-2">{{ isRegistering ? 'Crea il tuo account' : 'Bentornato!' }}</p>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <input v-model="email" type="email" placeholder="Email" class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
        <input v-model="password" type="password" placeholder="Password" class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
        
        <button :disabled="loading" class="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
          {{ loading ? 'Caricamento...' : (isRegistering ? 'Registrati' : 'Accedi') }}
        </button>
      </form>

      <button @click="isRegistering = !isRegistering" class="w-full mt-6 text-sm font-bold text-emerald-600 hover:underline text-center">
        {{ isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati' }}
      </button>
    </div>
  </div>
</template>