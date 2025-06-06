import { createRouter, createWebHistory } from 'vue-router';
import WelcomeView from '../views/WelcomeView.vue';
import SignUpView from '../views/SignUpView.vue';
import DashboardView from "../views/DashboardView.vue";
import PomodoroView from '../views/PomodoroView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';
import StatsView from '../views/StatsView.vue';

const routes = [
    { path: '/', component: WelcomeView },  
    { path: '/signup', component: SignUpView },
    {path: '/dashboard', component: DashboardView },
    { path: '/pomodoro', component: PomodoroView },
    { path: '/forgot-password', component: ForgotPasswordView },
    { path: '/reset-password', component: ResetPasswordView },
    { path: '/stats', component: StatsView},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;