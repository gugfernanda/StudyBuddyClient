import { createRouter, createWebHistory } from 'vue-router';
import WelcomeView from '../views/WelcomeView.vue';
import UsersView from '../views/UsersView.vue';

const routes = [
    { path: '/', component: WelcomeView },   //setata ca prima pagina
    { path: '/users', component: UsersView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;