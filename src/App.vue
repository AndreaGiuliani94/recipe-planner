<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useAuthStore } from './stores/auth.ts'
import { onMounted } from 'vue'
import { supabase } from './lib/supabaseClient.ts'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      await authStore.initialize()
      if (router.currentRoute.value.path === '/login') {
        router.push('/profilo')
      }
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <header class="hidden md:block py-6 px-8 bg-white border-b mb-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <span class="text-2xl font-black text-emerald-600 tracking-tighter italic">EasyPlanner</span>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <AppNavbar />
  </div>
</template>