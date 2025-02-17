import { createRouter, createWebHistory } from 'vue-router';
import WelcomeView from '../views/WelcomeView.vue';
import SignUpView from '../views/SignUpView.vue';
import DashboardView from "../views/DashboardView.vue";
import UsersView from '../views/UsersView.vue';

const routes = [
    { path: '/', component: WelcomeView },   //setata ca prima pagina
    { path: '/signup', component: SignUpView },
    {path: '/dashboard', component: DashboardView },
    { path: '/users', component: UsersView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;