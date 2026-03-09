import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { configureApi } from 'where-to-know-insights-lib/composables'

// Configure API base URL
configureApi('/api')

createApp(App).use(router).mount('#app')
