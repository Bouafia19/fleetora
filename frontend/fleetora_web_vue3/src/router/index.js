import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      redirect: '/map',
      meta: { title: 'Home' }
    },
    {
      path: '/map',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { 
          path: '',
          name: 'Map', 
          component: () => import('@/views/Map.vue'),
          meta: { requiresAuth: true, title: 'Dispatch Console' }
        }
      ],
    },
    {
      path: '/signup',
      component: () => import('@/layouts/PageLayout.vue'),
      children: [
        {
          path: '/login',
          name: 'Login',
          meta: { title: 'Sign In' },
          component: () => import('@/views/user/Login.vue')
        },
        {
          path: '/signup',
          name: 'Signup',  
          meta: { title: 'Sign Up' }, 
          component: () => import('@/views/user/Signup.vue') 
        },
        {
          path: '/tripDetail',
          name: 'TripDetail',
          component: () => import('@/views/TripDetail.vue'),
          meta: { requiresAuth: true, title: 'Trip Details' }
        },
      ]
    },
    { 
      path: '/tripInfo',
      component: () => import('@/layouts/PageLayout.vue'),
      children: [
        {
          path: '/tripInfo',
          name: 'TripInfo', 
          component: () => import('@/views/TripInfo.vue'),
          meta: { requiresAuth: true, title: 'Select Vehicle' }
        }
      ]
    },
    { 
      path: '/terms&conditions',
      component: () => import('@/layouts/PageLayout.vue'),
      children: [
        {
          path: '/terms&conditions',
          name: 'Terms&conditions', 
          component: () => import('@/views/user/Terms&conditions.vue'),
          meta: { title: 'Terms & Conditions' }
        }
      ]
    },
  
    // Always leave this as last one
    {
      path: '/:catchAll(.*)*',
      component: () => import('@/views/ErrorNotFound.vue'),
      meta: { title: 'Page Not Found' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    let ls = null
    try {
      ls = JSON.parse(localStorage.getItem('userInfo'))
    } catch (e) {
      ls = null
    }
    if (ls && ls.token) {
      auth.attempt(ls.token).then((value) => {
        if (value === false && to.name !== 'Login' && to.name !== 'Signup') {
          next({ name: "Login" })
        } else {
          next()
        }
      }).catch(() => {
        next({ name: "Login" })
      })
    } else {
      next({ name: "Login" })
    }
  } else {
    next()
  }
});

router.afterEach((to) => {
  const pageTitle = to.meta?.title;
  document.title = pageTitle ? `Fleetora — ${pageTitle}` : 'Fleetora — Smart Transportation & Logistics';
});

export default router
