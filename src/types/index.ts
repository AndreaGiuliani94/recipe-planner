export interface Ingredient {
  name: string;
  quantity: string;
  owned: boolean; // Per segnare se lo abbiamo già in dispensa
}

export interface Recipe {
  id?: string;
  name: string;
  ingredients: Ingredient[];
}

export interface PlanEntry {
  day: string; // es: 'Lunedì'
  meal: 'pranzo' | 'cena';
  recipeId: string;
}

export interface ShoppingItem {
  id?: string
  name: string
  quantity: string
  is_owned: boolean
}