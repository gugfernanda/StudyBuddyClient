import { createRouter, createWebHistory } from 'vue-router';
import WelcomeView from '../views/WelcomeView.vue';
import SignUpView from '../views/SignUpView.vue';
import DashboardView from "../views/DashboardView.vue";
import UsersView from '../views/UsersView.vue';
import PomodoroView from '../views/PomodoroView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';

const routes = [
    { path: '/', component: WelcomeView },   //setata ca prima pagina
    { path: '/signup', component: SignUpView },
    {path: '/dashboard', component: DashboardView },
    { path: '/pomodoro', component: PomodoroView },
    { path: '/forgot-password', component: ForgotPasswordView },
    { path: '/reset-password', component: ResetPasswordView },
    { path: '/users', component: UsersView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;