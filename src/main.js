import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'
import 'virtual:svg-icons-register'
import { registerSvgIcons } from './utils/registerIcons'

// 注册 SVG 图标
registerSvgIcons()

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
