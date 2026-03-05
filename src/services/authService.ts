import { supabase } from "../lib/supabaseClient";

export const authService = {
  /**
   * Registrazione nuovo utente
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Login con email e password
   */
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Logout completo
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Recupera tutti i gruppi a cui l'utente appartiene
   */
  async getUserGroups(userId: string) {
    const { data, error } = await supabase
      .from("user_groups")
      .select(
        `
        role,
        groups (
          id,
          name,
          created_at
        )
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data.map((item) => ({ ...item.groups, role: item.role }));
  },

  /**
   * Aggiorna l'ultimo gruppo attivo nel profilo (persistenza sessione)
   */
  async setActiveGroup(userId: string, groupId: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ last_active_group_id: groupId })
      .eq("id", userId);

    if (error) throw error;
  },

  /**
   * Crea un nuovo gruppo e vi associa l'utente come 'admin'
   */
  async createGroup(userId: string, groupName: string) {
    // 1. Crea il gruppo
    const { data: newGroup, error: gError } = await supabase
      .from("groups")
      .insert([{ name: groupName }])
      .select()
      .single();
    if (gError) throw gError;

    // 2. Associa l'utente al nuovo gruppo nella tabella di collegamento
    const { error: linkError } = await supabase.from("user_groups").insert([
      {
        user_id: userId,
        group_id: newGroup.id,
        role: "admin",
      },
    ]);
    if (linkError) throw linkError;

    return newGroup;
  },

  /**
   * Unisciti a un gruppo esistente tramite codice
   */
  async joinGroup(userId: string, groupId: string) {
    const { error } = await supabase.from("user_groups").insert([
      {
        user_id: userId,
        group_id: groupId,
        role: "member",
      },
    ]);

    if (error) {
      if (error.code === "23505")
        throw new Error("Fai già parte di questo gruppo");
      throw new Error("Codice gruppo non valido");
    }
    return true;
  },
};
