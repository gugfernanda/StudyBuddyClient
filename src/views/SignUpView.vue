<script>
import AuthService from "../services/AuthService.js"
import { translations } from "../translations.js"
import { useLanguage } from "../language.js";

const { lang } = useLanguage();

export default {
    name: "SignUpView",
    data() {
        return {
            username: "",
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            showPassword: false,
            showConfirmPassword: false,
            errorMessage: "",
            successMessage: "",
        };
    },
    computed: {
        t() {
            return translations[lang.value];
        }
    },
    methods: {
        async register () {
            this.errorMessage = "";
            this.successMessage = "";
            if(this.password.length < 8) {
                this.errorMessage = this.t.passwordTooShort;
                return;
            }
            if(!/[A-Z]/.test(this.password)) {
                this.errorMessage = this.t.passwordNoUpper;
                return;
            }
            if(!/\d/.test(this.password)) {
                this.errorMessage = this.t.passwordNoDigit;
                return;
            }
            if(!/[@$!%*?&]/.test(this.password)) {
                this.errorMessage = this.t.passwordsNoSpecial;
                return;
            }
            if(this.password !== this.confirmPassword) {
                this.errorMessage = this.t.passwordsDontMatch;
                return;
            }
            try {
                const user = await AuthService.register(this.username, this.fullName, this.email, this.password);

                this.successMessage = this.t.signupSuccess;
                this.username = "";
                this.fullName = "";
                this.email = "";
                this.password = "";
                this.confirmPassword = "";

                setTimeout(() => {
                this.$router.push("/");
                }, 2000);
            } catch (error) {
                this.errorMessage = error.response ? error.response.data : this.t.signupFail;
                console.error("Sign up error:", error);

                return;
            }
        },
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        toggleConfirmPassword() {
            this.showConfirmPassword = !this.showConfirmPassword;
        },
        toggleLang() {
            setLang(lang.value === "en" ? "ro" : "en");
        }
    }
}
</script>

<template>
    <div class="signup-container">
        <div class="signup-box">
            <h2>{{ t.signupTitle }}</h2>
            <form @submit.prevent="register">
                <input type="text" v-model="fullName" :placeholder="t.fullName" required />
                <input type="text" v-model="username" :placeholder="t.username" required />
                <input type="email" v-model="email" :placeholder="t.email" required />
                
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="password" :placeholder="t.password" required />
                    <span class="toggle-password" @click="togglePassword">
                        <i :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                    </span>
                </div>

                <div class="password-container">
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" :placeholder="t.confirmPassword" required />
                    <span class="toggle-password" @click="toggleConfirmPassword">
                        <i :class="showConfirmPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                    </span>
                </div>

                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

                <button type="submit">{{ t.signupTitle }}</button>
                
            </form>
            <p class="login-text">
                {{ t.alreadyHaveAccount }}
                <router-link to="/" class="login-link">{{ t.login }}</router-link>
            </p>
        </div>
    </div>
</template>


<style scoped>

.signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: #f4f4f4;
}


.signup-box {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 350px;
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

.password-container {
    position: relative;
    display: flex;
    align-items: center;
}

.password-container input {
    width: 100%;
    padding-right: 40px;
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

/* Link pentru login */
.login-text {
    margin-top: 15px;
    font-size: 14px;
    color: #333;
}

.login-link {
    color: #e91ea5;
    font-weight: bold;
    text-decoration: none;
    margin-left: 5px;
}

.login-link:hover {
    text-decoration: underline;
}

/* Mesaj de eroare */
.error-message {
    color: red;
    margin-top: 10px;
    font-size: 14px;
}
</style>