import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/pages',
      component: () => import('@/views/pages/Index'),
      children: [
        {
          name: 'Lock',
          path: 'lock',
          component: () => import('@/views/pages/Lock'),
          meta: {
            requiresAuth: false
          }
        },
        {
          name: 'Login',
          path: 'login',
          component: () => import('@/views/pages/Login'),
          meta: {
            requiresAuth: false
          }
        },
        {
          name: 'Pricing',
          path: 'pricing',
          component: () => import('@/views/pages/Pricing'),
          meta: {
            requiresAuth: false
          }
        },
        {
          name: 'Register',
          path: 'register',
          component: () => import('@/views/pages/Register'),
          meta: {
            requiresAuth: false
          }
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/views/dashboard/Index'),
      children: [
        // Dashboard
        {
          name: 'Home',
          path: '',
          component: () => import('@/views/dashboard/Dashboard'),
          meta: {
            requiresAuth: true
          }
        },
        {
          name: 'History',
          path: 'history',
          component: () => import('@/views/dashboard/History'),
          meta: {
            requiresAuth: true
          }
        },
      ],
    },
    {
      path: '*',
      component: () => import('@/views/pages/Index'),
      children: [
        {
          name: '404 Error',
          path: '',
          component: () => import('@/views/pages/Error'),
          meta: {
            requiresAuth: false
          }
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
    if(to.matched.some(record => record.meta.requiresAuth)) {
        if (localStorage.getItem('jwt') == null || localStorage.getItem('jwt') == 'null') {
            next({
                path: '/pages/login',
                params: { nextUrl: to.fullPath }
            })
        } else {
            let user = {}
            try {
              user = JSON.parse(localStorage.getItem('user'))
            } catch (e) {}
            if(to.matched.some(record => record.meta.is_admin)) {
                if(user.role == 'Admin'){
                    next()
                }
                else{
                    next({ name: 'Dashboard'})
                }
            }else {
                next()
            }
        }
    } else {
        next()
    }
})


export default router