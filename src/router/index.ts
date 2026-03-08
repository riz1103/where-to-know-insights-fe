import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import ReviewsList from '@/views/ReviewsList.vue'
import ReviewDetail from '@/views/ReviewDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/reviews',
      name: 'ReviewsList',
      component: ReviewsList,
    },
    {
      path: '/reviews/:id',
      name: 'ReviewDetail',
      component: ReviewDetail,
    },
  ],
})

export default router
