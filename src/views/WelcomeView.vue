<script>

import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";
import { translations } from "../translations.js";
import { useLanguage } from "../language.js";

const { lang, setLang } = useLanguage();

export default {
    name: "WelcomeView",
    data() {
        return {
            emailOrUsername: "",
            password: "",
            showPassword: false,
            errorMessage: "",
        };
    },
    computed: {
        t() {
            return translations[lang.value];
        },
        currentLang() {
            return lang.value;
        }
    },
    methods: {
        async login() {
            this.errorMessage = "";
            try {
                const user = await AuthService.login(this.emailOrUsername, this.password);
                //console.log("[WelcomeView] Rezultat AuthService.login:", user);

                if(user) {
                    //console.log("[WelcomeView] user.username =", user.username, "lang =", lang.value);
                    UserService.setLanguage(user.username, lang.value)
                        .then(() => console.log("[WelcomeView] setLanguage OK"))
                        .catch(err => console.warn("[WelcomeView] setLanguage ERR:", err.response?.data || err.message));

                    this.$router.push('/dashboard');
                    return;
                } else {
                    this.errorMessage = this.t.errorInvalid;
                }
                
            } catch (error) {
                if (error.response && error.response.data.error) {
                    this.errorMessage = error.response.data.error;
                } else {
                    this.errorMessage = this.t.errorGeneric;
                }           
             }
        },
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        toggleLang() {
            setLang(lang.value === 'en' ? 'ro' : 'en');
        }
    }
};

</script>


<template>
    <div class="container">

        <div class="language-toggle">
            <label class="switch">
                <input type="checkbox" :checked="currentLang === 'ro'" @change="toggleLang">
                <span class="slider-switch">
                    <span class="lang-label en" :class="{ selected: currentLang === 'en' }">EN</span>
                    <span class="lang-label ro" :class="{ selected: currentLang === 'ro' }">RO</span>
                </span>
            </label>
        </div>

        <div class="left">
            <h1 v-html="t.introTitle"></h1>
            <p v-html="t.introText"></p>
        </div>

        <div class="right">
            <div class="login-box">
               
                <form @submit.prevent="login">

                    <input type="text" v-model="emailOrUsername" :placeholder="t.usernameOrEmail" required />

                    <div class="password-container">
                        <input
                            :type="showPassword ? 'text' : 'password'"
                            v-model="password"
                            :placeholder="t.password"
                            required
                        />

                        <span class="toggle-password" @click="togglePassword">
                            <span :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></span>
                        </span>

                    </div>

                    <button type="submit">Login</button>
                    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

                </form>

                <p class="forgot-password">
                    <router-link to="/forgot-password">{{ t.forgotPassword }}</router-link>
                </p>


                <p class="signup-text">
                    {{ t.noAccount }}
                    <router-link to="/signup" class="signup-link">{{ t.signup }}</router-link>
                </p>
            </div>
        </div>
    </div>
</template>





<style scoped>

.language-toggle {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 999;
}

.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
    cursor: pointer;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider-switch {
    background-color: #ccc;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    transition: background-color 0.3s ease;
    width: 100%;
    height: 100%;
}


.lang-label {
    width: 50%;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    padding: 6px 0;
    border-radius: 4px;
    color: #666;
    background-color: transparent;
    transition: all 0.3s ease;
}

.lang-label.selected {
    background-color: #e91ea5;
    color: white;
}


:deep(.highlight) {
    color: #e91ea5;
    font-weight: bold;
}



.forgot-password {
    margin-top: 10px;
    font-size: 14px;
}

.forgot-password a {
    color: #e91ea5;
    text-decoration: none;
}

.forgot-password a:hover {
    text-decoration: underline;
}


* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    overflow: hidden; 
    height: 100%;
    width: 100%;
    background-color: #f4f4f4;
}


.container {
    display: flex;
    height: 100vh;
    width: 100vw; /* Se asigură că nu apare scroll pe orizontală */
    overflow: hidden;
}


.left {
    flex: 1;
    background-color: #002241;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 40px;
}

.left h1 {
    font-size: 2.3rem; /* Titlu clar și vizibil */
    font-weight: bold;
    max-width: 70%;
    line-height: 1.3;
    margin-bottom: 10px;
}

.left p {
    font-size: 1.2rem; /* Paragraf mai mic și mai aerisit */
    font-weight: normal;
    max-width: 70%;
    line-height: 1.6;
    color: #d0d0d0; /* Gri deschis pentru contrast */
}

/* Accente roz pe cuvintele cheie */
.left span {
    color: #e91ea5;
    font-weight: bold;
}


.right {
    flex: 1;
    background-color: #f4f4f4;
    display: flex;
    justify-content: center;
    align-items: center;
}


.login-box {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 300px;
}

h2 {
    margin-bottom: 20px;
    color: #002241;
}

input {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    background-color: #ffffff;
    color: #333;
    transition: all 0.3s ease-in-out;
}

input:focus {
    border-color: #e91ea5;
    outline: none;
    box-shadow: 0px 0px 5px rgba(233, 30, 99, 0.5);
}

button {
    width: 100%;
    padding: 10px;
    background-color: #e91ea5;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    text-align: center;
    transition: background-color 0.3s, transform 0.2s;
    cursor: pointer;
}

button:hover {
    background-color: #d81b80;
    transform: scale(1.05);
}

button:active {
    transform: scale(0.95);
}

.signup-text {
    margin-top: 15px;
    font-size: 14px;
    color: #333;
}

.signup-link {
    color: #e91ea5;
    font-weight: bold;
    text-decoration: none;
    margin-left: 5px;

}

.signup-link:hover {
    text-decoration: underline;
}

.error-message {
    color: red;
    margin-top: 10px;
    font-size: 14px;
}

.password-container {
    position: relative;
    display: flex;
    align-items: center;
}

.password-container input {
    width: 100%;
    padding: 10px;
    padding-right: 40px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

.toggle-password {
    position: absolute;
    right: 10px;
    cursor: pointer;
    font-size: 20px;
    color: #888;
}

.toggle-password:hover {
    color: #555;
}

</style>
