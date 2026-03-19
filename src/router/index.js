import { createRouter, createWebHashHistory } from 'vue-router'
import { useStore } from '../stores/appStore.js'

import LandingView from '../views/landing.vue'
import LoginView from '../views/login.vue'
import CreateAccView from '../views/create.vue'
import HomeView from '../views/home.vue'
import ChatView from '../views/chat.vue'
import FriendView from '../views/friends.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: "landing", component: LandingView },
    { path: '/login', alias: '/signin', name: "login", component: LoginView },
    { path: '/create', name: "createAccount", component: CreateAccView },
    { 
      path: '/home', 
      name: "home", 
      component: HomeView,
      children: [
        {
          path: '',
          components: {
            "sidebar": FriendView,
            "main": ChatView,
          }
        }
      ]
    },
    { path: '/:pathMatch(.*)*', name: "notFound", redirect: '/notFound'}
  ],
})

router.beforeEach(async (to, from, next) => {
  const store = useStore()
  const isSignedIn = !!store.currUser
  if ((to.path.startsWith('/home') || to.path === '/notFound' ) && !isSignedIn) {
    return next('/login')
  } else if ((to.path === '/login'  || to.path === '/create' || to.path === '/signin' || to.path === '/notFound' ) && isSignedIn) {
    return next('/home')
  } else {
    next()
  }

}) 

export default router

