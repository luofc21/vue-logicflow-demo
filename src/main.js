import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './style.css'
import 'virtual:svg-icons-register';

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
