<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const recipeName = ref('')
const ingredients = ref([{ name: '', quantity: '' }])
const isSaving = ref(false)

// Aggiunge una riga vuota per un nuovo ingrediente
const addIngredientRow = () => {
  ingredients.value.push({ name: '', quantity: '' })
}

// Rimuove una riga specifica
const removeIngredientRow = (index: number) => {
  ingredients.value.splice(index, 1)
}

const saveRecipe = async () => {
  if (!recipeName.value) return alert('Inserisci il nome del piatto!')
  
  isSaving.value = true
  
  try {
    // 1. Inseriamo la ricetta nella tabella 'recipes'
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert([{ name: recipeName.value }])
      .select()
      .single()

    if (recipeError) throw recipeError

    // 2. Prepariamo gli ingredienti collegandoli all'ID della ricetta
    const recipeId = recipeData.id
    const finalIngredients = ingredients.value
      .filter(ing => ing.name.trim() !== '') // Evitiamo righe vuote
      .map(ing => ({
        recipe_id: recipeId,
        name: ing.name,
        quantity: ing.quantity
      }))

    // 3. Inseriamo gli ingredienti nella tabella 'ingredients'
    const { error: ingError } = await supabase
      .from('ingredients')
      .insert(finalIngredients)

    if (ingError) throw ingError

    alert('Ricetta salvata con successo!')
    router.push('/') // Torna alla home dopo il salvataggio
  } catch (err) {
    console.error(err)
    alert('Errore durante il salvataggio')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="add-recipe">
    <h1>Aggiungi Nuova Ricetta</h1>
    
    <div class="form-group">
      <label>Nome del piatto:</label>
      <input v-model="recipeName" type="text" placeholder="es. Lasagne" />
    </div>

    <h3>Ingredienti</h3>
    <div v-for="(ing, index) in ingredients" :key="index" class="ingredient-row">
      <input v-model="ing.name" placeholder="Nome ingrediente" />
      <input v-model="ing.quantity" placeholder="Quantità (es. 200g)" />
      <button @click="removeIngredientRow(index)" type="button">✖</button>
    </div>

    <div class="actions">
      <button @click="addIngredientRow" class="btn-secondary">+ Aggiungi ingrediente</button>
      <button @click="saveRecipe" :disabled="isSaving" class="btn-primary">
        {{ isSaving ? 'Salvataggio...' : 'Salva Ricetta' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-recipe { max-width: 500px; margin: 0 auto; padding: 20px; }
.form-group { margin-bottom: 20px; }
.ingredient-row { display: flex; gap: 10px; margin-bottom: 10px; }
input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; flex: 1; }
.actions { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.btn-primary { background: #42b983; color: white; border: none; padding: 10px; cursor: pointer; }
.btn-secondary { background: #eee; border: 1px solid #ccc; padding: 10px; cursor: pointer; }
</style>