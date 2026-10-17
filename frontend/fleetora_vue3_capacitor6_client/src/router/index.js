import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/tabs'
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: { title: 'Home' }
    },
    {
      path: '/tabs',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'Tabs',
          component: () => import('@/views/Tabs.vue'),
          meta: { requiresAuth: true, title: 'Console' }
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
          path: '/checkPhone',
          name: 'CheckPhone',
          meta: { title: 'Phone Verification' }, 
          component: () => import('@/views/CheckPhone.vue'),
        },
        {
          path: '/forgotPassword',
          name: 'ForgotPassword',
          meta: { title: 'Reset Password' }, 
          component: () => import('@/views/ForgotPassword.vue'),
        },
        {
          path: '/userInformation/:phonenumber',
          name: 'UserInformation',
          meta: { title: 'Profile Setup' },
          component: () => import('@/views/user/UserInformation.vue')
        },
        {
          path: '/updateUserInformation',
          name: 'UpdateUserInformation',
          meta: { title: 'Update Profile' },
          component: () => import('@/views/user/UpdateUserInformation.vue')
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
        },
        {
          path: '/tripDetail',
          name: 'TripDetail',
          component: () => import('@/views/TripDetail.vue'),
          meta: { requiresAuth: true, title: 'Trip Details' }
        },
        {
          path: '/search',
          name: 'Search',
          component: () => import('@/views/Search.vue'),
          meta: { requiresAuth: true, title: 'Search' }
        },
        {
          path: '/trips',
          name: 'Trips',
          component: () => import('@/views/Trips.vue'),
          meta: { requiresAuth: true, title: 'Trips' }
        },
        {
          path: '/tripsInProgress',
          name: 'TripsInProgress',
          component: () => import('@/views/TripsInProgress.vue'),
          meta: { requiresAuth: true, title: 'Active Dispatches' }
        },
        {
          path: '/notifications',
          name: 'Notifications',
          component: () => import('@/views/profile/Notifications.vue'),
          meta: { requiresAuth: true, title: 'Notifications' }
        },
        {
          path: '/contactSupport',
          name: 'ContactSupport',
          component: () => import('@/views/profile/ContactSupport.vue'),
          meta: { requiresAuth: true, title: 'Contact Support' }
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/views/Profile.vue'),
          meta: { requiresAuth: true, title: 'Profile' }
        },
        {
          path: '/updateProfile',
          name: 'UpdateProfile',
          component: () => import('@/views/UpdateProfile.vue'),
          meta: { requiresAuth: true, title: 'Edit Profile' }
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
    auth.getLSUserInfo().then((ls) => {
      if (ls) {
        auth.attempt(ls.token).then((value) => {
          if (value === false && to.name != 'Login') {
            next({ name: "Login" })
          } else {
            next()
          }
        })
      } else {
        next({ name: "Home" })
      }
    })
  } else {
    next()
  }
});

router.afterEach((to) => {
  const pageTitle = to.meta?.title;
  document.title = pageTitle ? `Fleetora — ${pageTitle}` : 'Fleetora — Customer Dispatch & Freight';
});

export default router
