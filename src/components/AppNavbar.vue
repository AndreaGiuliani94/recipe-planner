<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient';
import { 
  CalendarIcon, 
  ShoppingCartIcon, 
  BookOpenIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'
import { 
  CalendarIcon as CalendarSolid, 
  ShoppingCartIcon as CartSolid, 
  BookOpenIcon as BookSolid,
  UserCircleIcon as UserSolid
} from '@heroicons/vue/24/solid'
import { onMounted, ref } from 'vue';

const isAuthenticated = ref(false)

onMounted(() => {
  // Controlliamo lo stato iniziale
  supabase.auth.getSession().then(({ data: { session } }) => {
    isAuthenticated.value = !!session
  })
  // Ascoltiamo i cambiamenti di auth (login/logout)
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session
  })
})

</script>

<template>
  <nav v-if="isAuthenticated" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg">
    <div class="bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-3xl p-2 flex justify-around items-center">
      
      <RouterLink to="/" class="nav-link" v-slot="{ isActive }">
        <div :class="[isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400']" class="flex flex-col items-center p-2 px-4 rounded-2xl transition-all duration-300">
          <component :is="isActive ? CalendarSolid : CalendarIcon" class="h-6 w-6" />
          <span class="text-[10px] font-black uppercase mt-1 tracking-tighter">Planner</span>
        </div>
      </RouterLink>

      <RouterLink to="/ricette" class="nav-link" v-slot="{ isActive }">
        <div :class="[isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400']" class="flex flex-col items-center p-2 px-4 rounded-2xl transition-all duration-300">
          <component :is="isActive ? BookSolid : BookOpenIcon" class="h-6 w-6" />
          <span class="text-[10px] font-black uppercase mt-1 tracking-tighter">Ricette</span>
        </div>
      </RouterLink>

      <RouterLink to="/spesa" class="nav-link" v-slot="{ isActive }">
        <div :class="[isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400']" class="flex flex-col items-center p-2 px-4 rounded-2xl transition-all duration-300">
          <component :is="isActive ? CartSolid : ShoppingCartIcon" class="h-6 w-6" />
          <span class="text-[10px] font-black uppercase mt-1 tracking-tighter">Spesa</span>
        </div>
      </RouterLink>

      <RouterLink to="/profilo" class="nav-link" v-slot="{ isActive }">
        <div :class="[isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400']" class="flex flex-col items-center p-2 px-4 rounded-2xl transition-all duration-300">
          <component :is="isActive ? UserSolid : UserCircleIcon" class="h-6 w-6" />
          <span class="text-[10px] font-black uppercase mt-1 tracking-tighter">Profilo</span>
        </div>
      </RouterLink>

    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  -webkit-tap-highlight-color: transparent;
}
</style>