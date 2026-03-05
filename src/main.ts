import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// IMPORTANTE: Questa riga carica Tailwind
import './assets/main.css'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Inizializziamo lo store prima di montare l'app
const authStore = useAuthStore()
authStore.initialize().then(() => {
  app.mount('#app')
})
