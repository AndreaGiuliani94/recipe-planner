import { defineStore } from 'pinia'
import { ref } from 'vue'
import { shoppingService } from '../services/shoppingService'
import { useAuthStore } from './auth'
import { supabase } from '@/lib/supabaseClient'

export const useShoppingStore = defineStore('shopping', () => {
  const items = ref<any[]>([])
  const authStore = useAuthStore()

  function subscribe() {
    return supabase
      .channel('public:shopping_list')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'shopping_list',
        filter: `group_id=eq.${authStore.groupId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          items.value.push(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          const index = items.value.findIndex(i => i.id === payload.new.id)
          if (index !== -1) items.value[index] = payload.new
        } else if (payload.eventType === 'DELETE') {
          items.value = items.value.filter(i => i.id !== payload.old.id)
        }
      })
      .subscribe()
  }

  async function fetchItems() {
    if (!authStore.groupId) return
    items.value = await shoppingService.getAll(authStore.groupId)
  }

  async function toggle(id: string, completed: boolean) {
    await shoppingService.toggleItem(id, completed)
    const item = items.value.find(i => i.id === id)
    if (item) item.completed = completed
  }

  async function add(name: string) {
    const newItem = await shoppingService.addItem(name, authStore.groupId)
    items.value.push(newItem[0])
  }

  return { items, subscribe, fetchItems, toggle, add }
})