import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../lib/supabaseClient";
import { authService } from "@/services/authService";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(null);
  const userGroups = ref<any[]>([]);
  const activeGroupId = ref<string | null>(null);
  const loading = ref(true);
  const isAuthenticated = computed(() => !!user.value);

  // Funzione per inizializzare o ricaricare i dati dell'utente
  async function initialize() {
    loading.value = true;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      user.value = session.user;
      // Carica i gruppi dell'utente
      userGroups.value = await authService.getUserGroups(session.user.id);

      // Carica il profilo per vedere l'ultimo gruppo attivo
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_active_group_id")
        .eq("id", session.user.id)
        .single();

      // Imposta il gruppo attivo (o il primo della lista se il preferito non esiste)
      activeGroupId.value =
        profile?.last_active_group_id || userGroups.value[0]?.id || null;
    }
    loading.value = false;
  }

  // Funzione per il logout
  async function logout() {
    await authService.logout();
    user.value = null;
    userGroups.value = [];
    activeGroupId.value = null;
  }

  async function handleCreateGroup(name: string) {
    if (!user.value) return;
    const newGroup = await authService.createGroup(user.value.id, name);
    // Ricarichiamo il profilo per aggiornare il group_id in memoria
    initialize();
  }

  async function setGroup(groupId: string) {
    await authService.setActiveGroup(user.value.id, groupId);
    initialize();
  }

  return {
    user,
    userGroups,
    activeGroupId,
    loading,
    isAuthenticated,
    initialize,
    logout,
    handleCreateGroup,
    setGroup,
  };
});
