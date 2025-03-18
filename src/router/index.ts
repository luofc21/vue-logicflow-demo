import { createRouter, createWebHistory } from 'vue-router'
// import Flow from '../views/bpmn/Flow.vue'

const routes = [
  {
    path: '/',
    redirect: '/bpmn'
  },
  {
    path: '/bpmn',
    name: 'BPMN',
    component: () => import('../views/bpmn/Flow.vue'),
    props: { mode: 'bpmn' }
  },
  {
    path: '/cmmn',
    name: 'CMMN',
    component: () => import('../views/cmmn/Flow.vue'),
    props: { mode: 'cmmn' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router