import { createApp } from 'vue'
import './style.css'
import "@mdi/font/css/materialdesignicons.min.css";
import App from './App.vue'
import router from './router/index.js';
import axios from "axios";

axios.interceptors.response.use(
    response => response,
    error => {
        if(error.response && error.response.status === 401) {
            console.warn("Session expired. Rederecting to login...");
            router.push("/")
        }

        return Promise.reject(error);

    }
);


const app = createApp(App);
app.use(router);
app.mount('#app');
