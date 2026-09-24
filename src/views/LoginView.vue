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
      await authService.signUp(email.value, password.value)
      alert("Controlla la tua email per confermare l'iscrizione!")
    } else {
      await handleLogin();
    }
  } catch (e: any) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

const handleLogin = async () => {
  try {
    await authService.login(email.value, password.value)
    await authStore.initialize()
    router.push('/profilo') 
  } catch (error: any) {
    alert("Errore durante il login: " + error.message)
  }
}

const handleGoogleLogin = async () => {
  try {
    await authService.loginWithGoogle()
  } catch (error: any) {
    alert("Errore con Google Login: " + error.message)
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
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">Oppure continua con</span>
          </div>
        </div>

        <div class="mt-6">
          <button 
            @click="handleGoogleLogin" 
            class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <!-- Un semplice SVG per l'icona di Google -->
            <svg class="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Accedi con Google
          </button>
        </div>
      </div>
    </div>
  </div>
</template>