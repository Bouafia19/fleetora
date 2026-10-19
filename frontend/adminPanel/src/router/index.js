import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import Setting from '../views/Setting.vue'
import Login from '../views/auth/Login.vue'
import Billing from '../views/Billing/index.vue'
import Detail from '../views/Billing/detail.vue'
import NewBilling from '../views/Billing/new.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/setting',
    name: 'Settings',
    component: Setting,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/User/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vehicles',
    name: 'Vehicles',
    component: () => import('../views/Vehicle/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Notification/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trips',
    name: 'Trips',
    component: () => import('../views/Trip/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/terms&conditions',
    name: 'TermsConditions',
    component: () => import('../views/Terms&Conditions/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/user',
    name: 'Account',
    component: () => import('../views/User/Account.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/billing',
    name: 'Billing',
    component: Billing,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing:id',
    name: 'DetailLegacy',
    component: Detail,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/billing/:id',
    name: 'Detail',
    component: Detail,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/billing/new',
    name: 'NewBilling',
    component: NewBilling,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('../views/Roles.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: () => import('../views/Forbidden.vue')
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    const ls = JSON.parse(localStorage.getItem('userInfo'))
    if (ls && ls.token) {
      const valid = await auth.attempt(ls.token)
      if (!valid && to.name !== 'Login') {
        next({ name: 'Login' })
      } else {
        // Administrator has full access
        if (ls.user?.role === 'administrator') {
          next()
          return
        }

        // Check CASL permissions if available
        const rules = ls.rules || []
        const canRead = rules.some(r => 
          (r.subject === 'all' || r.subject === to.name) && 
          (r.actions?.read || r.action === 'read' || r.action === 'manage')
        )

        if (canRead || ['Account', 'Home', 'About'].includes(to.name)) {
          next()
        } else {
          next({ name: 'Forbidden' })
        }
      }
    } else {
      next({ name: 'Login' })
    }
  } else {
    next()
  }
})

router.afterEach((to) => {
  const pageTitle = to.name || to.meta?.title
  document.title = pageTitle ? `Fleetora Admin — ${pageTitle}` : 'Fleetora Admin — Operations Platform'
})

export default router

