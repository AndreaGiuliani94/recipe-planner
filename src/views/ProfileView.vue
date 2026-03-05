<script setup lang="ts">
import { UserCircleIcon, UsersIcon, ClipboardIcon, ArrowRightStartOnRectangleIcon, PlusIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue';
import AddGroupModal from '@/components/AddGroupModal.vue';

const authStore = useAuthStore();
const isModalOpen = ref(false);

const copyGroupId = (groupId: string) => {
  if (groupId) {
    navigator.clipboard.writeText(groupId)
    alert("Codice Gruppo copiato! Invialo ai tuoi familiari.")
  }
}

const handleSaved = async () => {
  authStore.initialize()
}

onMounted(() => {
  authStore.initialize()
})

</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div class="flex items-center gap-3">
        <div class="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200">
          <UserCircleIcon class="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 class="text-2xl text-gray-900 font-extrabold">Profilo</h1>
        </div>
      </div>
    </div>

    <button @click="isModalOpen = true"
      class="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md active:scale-95 mb-4">
      <PlusIcon class="h-5 w-5" />
      Nuovo Gruppo
    </button>

    <div v-if="!authStore.loading" class="space-y-6">
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <label class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Account</label>
        <p class="text-lg font-bold text-gray-800">{{ authStore.user?.email }}</p>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <label class="text-[10px] font-black uppercase text-gray-400 tracking-widest">I tuoi Gruppi</label>
          <UsersIcon class="h-8 w-8 text-emerald-600" />
        </div>

        <div>
          <div v-for="group in authStore.userGroups" class="min-w-full mb-4">
            <div class="p-4 rounded-2xl flex items-center justify-between" :class="[group.id == authStore.activeGroupId ? 'bg-emerald-50' : 'bg-gray-50']">
              <h3 class="text-xl text-emerald-600" :class="[group.id == authStore.activeGroupId ? 'font-bold' : '']">{{ group?.name ||
                'Nessun Gruppo' }}</h3>
              <button v-if="group.id !== authStore.activeGroupId" class="flex items-center justify-between text-sm bg-white p-2 rounded-xl shadow-sm text-emerald-600 cursor-pointer hover:scale-110 transition-transform"
                @click="authStore.setGroup(group.id)">
                <ArrowRightEndOnRectangleIcon class="h-5 w-5" />
                Seleziona
              </button>
              <div class="flex items-center justify-between">
                <div class="overflow-hidden">
                  <p class="text-[10px] font-black text-emerald-800 uppercase mb-1">Codice Invito</p>
                  <p class="text-xs font-mono text-emerald-600 truncate mr-4">{{ group.id }}</p>
                </div>
                <button @click="copyGroupId(group.id)"
                  class="bg-white p-2 rounded-xl shadow-sm text-emerald-600 hover:scale-110 transition-transform cursor-pointer">
                  <ClipboardIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button @click="authStore.logout()"
        class="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors">
        <ArrowRightStartOnRectangleIcon class="h-5 w-5" />
        Esci dall'applicazione
      </button>
    </div>
  </div>

  <AddGroupModal :isOpen="isModalOpen" @close="isModalOpen = false" @saved="handleSaved" />
</template>