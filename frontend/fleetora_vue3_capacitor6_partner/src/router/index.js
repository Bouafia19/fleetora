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
      path: '/user',
      component: () => import('@/layouts/PageLayout.vue'),
      children: [
        { 
          path: '/login', 
          name: 'Login',  
          meta: { title: 'Carrier Login' }, 
          component: () => import('@/views/user/Login.vue') 
        },
        { 
          path: '/signup', 
          name: 'Signup',  
          meta: { title: 'Carrier Sign Up' }, 
          component: () => import('@/views/user/Signup.vue') 
        },
        {
          path: '/notifications',
          name: 'Notifications',
          component: () => import('@/views/profile/Notifications.vue'),
          meta: { requiresAuth: true, title: 'Notifications' }
        },
        {
          path: '/wallet',
          name: 'Wallet',
          component: () => import('@/views/profile/Wallet.vue'),
          meta: { requiresAuth: true, title: 'Wallet' }
        },
        {
          path: '/billing',
          name: 'Billing',
          component: () => import('@/views/profile/Billing.vue'),
          meta: { requiresAuth: true, title: 'Billing' }
        },
        {
          path: '/contactSupport',
          name: 'ContactSupport',
          component: () => import('@/views/profile/ContactSupport.vue'),
          meta: { requiresAuth: true, title: 'Contact Support' }
        },
        {
          path: '/documents',
          name: 'Documents',
          component: () => import('@/views/Documents.vue'),
          props: true,
          meta: { requiresAuth: true, title: 'Documents' }
        },
        {
          path: '/document',
          name: 'Document',
          component: () => import('@/views/Document.vue'),
          props: true,
          meta: { requiresAuth: true, title: 'Upload Document' }
        },
        {
          path: '/updateProfile',
          name: 'UpdateProfile',
          component: () => import('@/views/UpdateProfile.vue'),
          meta: { requiresAuth: true, title: 'Profile' }
        },
        {
          path: '/tripDetail',
          name: 'TripDetail',
          component: () => import('@/views/TripDetail.vue'),
          meta: { requiresAuth: true, title: 'Trip Details' }
        },
        {
          path: '/plannedTrips',
          name: 'PlannedTrips',
          component: () => import('@/views/PlannedTrips.vue'),
          meta: { requiresAuth: true, title: 'Planned Trips' }
        },
        {
          path: '/notificationClient',
          name: 'NotificationClient',
          component: () => import('@/views/profile/NotificationClient.vue'),
          meta: { requiresAuth: true, title: 'New Shipment Request' }
        },
        {
          path: '/pending',
          name: 'Pending',
          component: () => import('@/views/Pending.vue'),
          props: true,
          meta: { requiresAuth: true, title: 'Verification Pending' }
        },
        {
          path: '/forgotPassword',
          name: 'ForgotPassword',
          meta: { title: 'Reset Password' },
          component: () => import('@/views/ForgotPassword.vue'),
        },
        {
          path: '/checkPhone',
          name: 'CheckPhone',
          component: () => import('@/views/CheckPhone.vue'),
          meta: { title: 'Phone Verification' }
        },
        {
          path: '/search',
          name: 'Search',
          component: () => import('@/views/Search.vue'),
          meta: { requiresAuth: true, title: 'Search' }
        },
        {
          path: '/codeVerification/:phonenumber',
          name: 'CodeVerification',
          component: () => import('@/views/user/CodeVerification.vue'),
          meta: { title: 'Code Verification' }
        },
        {
          path: '/userInformation/:phonenumber',
          name: 'UserInformation',
          component: () => import('@/views/user/UserInformation.vue'),
          meta: { title: 'Carrier Registration' }
        },
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
})

router.afterEach((to) => {
  const pageTitle = to.meta?.title;
  document.title = pageTitle ? `Fleetora — ${pageTitle}` : 'Fleetora — Driver & Carrier Console';
});

export default router
