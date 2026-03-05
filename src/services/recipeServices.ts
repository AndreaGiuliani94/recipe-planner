import { supabase } from '../lib/supabaseClient'

export const recipeService = {
  async getAll(groupId: string) {
    const { data, error } = await supabase
      .from('recipes')
      .select('*, ingredients(*)')
      .eq('group_id', groupId)
      .order('name')
    
    if (error) throw error
    return data
  },

  async create(recipe: any, ingredients: any[], groupId: string) {
    // 1. Inserimento ricetta
    const { data: newRecipe, error: rError } = await supabase
      .from('recipes')
      .insert([{ name: recipe.name, group_id: groupId }])
      .select()
      .single()
    
    if (rError) throw rError

    // 2. Inserimento ingredienti
    const finalIngs = ingredients.map(ing => ({
      recipe_id: newRecipe.id,
      name: ing.name,
      quantity: ing.quantity
    }))
    
    const { error: iError } = await supabase.from('ingredients').insert(finalIngs)
    if (iError) throw iError

    return newRecipe
  },

  async delete(recipeId: string, groupId: string) {
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId).eq('group_id', groupId)
    if (error) throw error
  },

  async upsertRecipe(recipe: any, ingredients: any[], groupId: string) {
    if (recipe.id) {
      // 1. UPDATE Nome Ricetta
      await supabase.from('recipes').update({ name: recipe.name }).eq('id', recipe.id).eq('group_id', groupId)
      // 2. DELETE vecchi ingredienti (approccio più semplice per l'aggiornamento)
      await supabase.from('ingredients').delete().eq('recipe_id', recipe.id)
    } else {
      // 1. INSERT Nuova Ricetta
      const { data } = await supabase.from('recipes').insert([{ name: recipe.name, group_id: groupId }]).select().single()
      recipe.id = data.id
    }

    // 3. INSERT (o RE-INSERT) Ingredienti
    const finalIngs = ingredients
      .filter(i => i.name.trim() !== '')
      .map(i => ({ recipe_id: recipe.id, name: i.name, quantity: i.quantity }))

    await supabase.from('ingredients').insert(finalIngs)
    return recipe.id
  }
}