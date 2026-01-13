import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SearchLessons from '../views/SearchLessons.vue'
import MyLessons from '../views/MyLessons.vue'
// import CreateLessons from '../views/CreateLessons.vue'
import LessonDetails from '../views/LessonDetails.vue'
import FolderDetails from '../views/FolderDetails.vue'
import CreateLessonTypes from '../views/CreateLessonTypes.vue'
import Login from '../views/Login.vue'
import Router from '../views/Router.vue'
import Students from '../views/Students.vue'
import PlayerScreen from '../views/PlayerScreen.vue'
import LessonsList from '../views/LessonsList.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Router',
    component: Router,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/',
        name: 'Home',
        component: Home
      },
      {
        path: '/myLessons',
        name: 'MyLessons',
        component: MyLessons,
      },
      {
        path:'/myLessons/:id',
        name: 'PlayerScreen',
        component: PlayerScreen,
        props: true
      },
      {
        path: '/lessons',
        name: 'Lessons',
        component: SearchLessons
      },
      {
        path: '/createLessons',
        name: 'CreateLessons',
        component: LessonsList
      },
      {
        path: '/createLessonTypes',
        name: 'CreateLessonTypes',
        component: CreateLessonTypes
      },
      {
        path: '/lessonDetails/:lessonId',
        name: 'LessonDetails',
        component: LessonDetails
      },
      {
        path: '/lessonDetails/:lessonId/folderDetails/:folderId',
        name: 'FolderDetails',
        component: FolderDetails
      },
      {
        path: '/students',
        name: 'Students',
        component: Students
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {

  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)
  let user = JSON.parse(localStorage.getItem("user"))
  let authToken = null;
  if(user)
    authToken = true;
  
  if (requiresAuth && !authToken) next({ path: '/login', query: { redirect: to.fullPath } })
  else if (!requiresAuth && authToken) next('/')
  else if (!requiresAuth && !authToken) next()
  else next()
})

export default router
