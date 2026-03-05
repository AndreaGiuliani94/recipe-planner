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

  async toggleItem(id: string, is_owned: boolean) {
    const { error } = await supabase
      .from('shopping_list')
      .update({ is_owned })
      .eq('id', id)
    if (error) throw error
  },

  async addItem(name: string, quantity: string, groupId: string) {
    const { data, error } = await supabase
      .from('shopping_list')
      .insert([{ name, group_id: groupId, quantity: quantity, is_owned: false }])
      .select()
    if (error) throw error
    return data
  }
}