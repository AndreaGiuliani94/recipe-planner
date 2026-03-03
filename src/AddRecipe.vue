<script setup lang="ts">
import { ref } from 'vue'
import type { Ingredient } from './types'
import { supabase } from './lib/supabaseClient'

const recipeName = ref('')
const ingredients = ref<Ingredient[]>([{ name: '', quantity: '', owned: false }])

// Funzione per aggiungere una riga di ingrediente nella maschera
const addIngredientRow = () => {
  ingredients.value.push({ name: '', quantity: '', owned: false })
}

// Funzione per salvare tutto su Supabase
const saveRecipe = async () => {
  // 1. Salva la ricetta
  const { data: recipeData, error: rError } = await supabase
    .from('recipes')
    .insert([{ name: recipeName.value }])
    .select()

  if (recipeData) {
    const recipeId = recipeData[0].id
    // 2. Prepara gli ingredienti con l'ID della ricetta appena creata
    const ingredientsToSave = ingredients.value.map(ing => ({
      ...ing,
      recipe_id: recipeId
    }))
    
    // 3. Salva gli ingredienti
    await supabase.from('ingredients').insert(ingredientsToSave)
    alert('Ricetta salvata con successo!')
  }
}
</script>

<template>
  <div class="form-container">
    <input v-model="recipeName" placeholder="Nome del piatto (es. Carbonara)" />
    
    <div v-for="(ing, index) in ingredients" :key="index">
      <input v-model="ing.name" placeholder="Ingrediente" />
      <input v-model="ing.quantity" placeholder="Quantità" />
    </div>

    <button @click="addIngredientRow">Aggiungi ingrediente</button>
    <button @click="saveRecipe">Salva Ricetta</button>
  </div>
</template>