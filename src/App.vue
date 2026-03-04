<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
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