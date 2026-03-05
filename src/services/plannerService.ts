import { supabase } from '../lib/supabaseClient'

export const plannerService = {
  async getByRange(groupId: string, start: string, end: string) {
    const { data, error } = await supabase
      .from('planner')
      .select('*, recipes(*)')
      .eq('group_id', groupId)
      .gte('date', start)
      .lte('date', end)
    
    if (error) throw error
    return data
  },

  async upsertEntry(entry: { date: string, meal_type: string, recipe_id: string, group_id: string }) {
    const { data, error } = await supabase
      .from('planner')
      .upsert([entry], { onConflict: 'date,meal_type,group_id' })
      .select()
    
    if (error) throw error
    return data
  },

  async deleteEntry(id: string) {
    const { error } = await supabase.from('planner').delete().eq('id', id)
    if (error) throw error
  }
}