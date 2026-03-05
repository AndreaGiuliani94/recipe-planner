import { supabase } from '../lib/supabaseClient'

export const shoppingService = {
  async getAll(groupId: string) {
    const { data, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at')
    if (error) throw error
    return data
  },

  async toggleItem(id: string, completed: boolean) {
    const { error } = await supabase
      .from('shopping_list')
      .update({ completed })
      .eq('id', id)
    if (error) throw error
  },

  async addItem(name: string, groupId: string) {
    const { data, error } = await supabase
      .from('shopping_list')
      .insert([{ name, group_id: groupId, completed: false }])
      .select()
    if (error) throw error
    return data
  }
}