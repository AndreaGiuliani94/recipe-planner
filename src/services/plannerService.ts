import { supabase } from '../lib/supabaseClient'

export const plannerService = {
  async getByRange(groupId: string, start: string, end: string) {
    const { data, error } = await supabase
      .from('planner')
      .select('*, recipes(*)')
      .eq('group_id', groupId)
      .gte('planned_date', start)
      .lte('planned_date', end)
    
    if (error) throw error
    return data
  },

  async getMeals(groupId: string, start: string, end: string) {
    const { data, error } = await supabase
      .from('planner')
      .select('*, recipes(name, ingredients(name, quantity))')
      .eq('group_id', groupId)
      .gte('planned_date', start)
      .lte('planned_date', end)
    
    if (error) throw error
    return data
  },

  async insertEntry(entry: { planned_date: string, meal_type: string, recipe_id: string, group_id: string }) {
    const { data, error } = await supabase
      .from('planner')
      .insert([entry])
      .select()
    
    if (error) throw error
    return data
  },

  async deleteEntry(id: string, groupId: string) {
    const { error } = await supabase.from('planner').delete().eq('id', id).eq('group_id', groupId)
    if (error) throw error
  }
}