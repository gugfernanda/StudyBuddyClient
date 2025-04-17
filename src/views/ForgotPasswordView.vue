<script>
import AuthService from '../services/AuthService.js';
import { translations } from "../translations.js";
import { useLanguage } from "../language.js";

export default {
    data() {
        return {
            email: "",
            code: "",
            message: "",
            isError: false,
            loading: false,
            step: 1
        };
    },

    computed: {
        lang() {
            return useLanguage().lang.value;
        },
        t() {
            return translations[this.lang];
        }
    },

    methods: {
        async requestReset() {
            this.loading = true;
            this.message = "";
            this.isError = false;

            try {
                const response = await AuthService.forgotPassword(this.email);
                this.message = this.t.verificationCodeSent;
                this.step = 2;
            } catch(error) {
                this.message = this.t.errorSendResetLink;
                this.isError = true;
            } finally {
                this.loading = false;
            }
        },
        async verifyCode() {
            this.loading = true;
            this.message = "";
            this.isError = false;

            try {
                const response = await AuthService.verifyCode(this.email, this.code);
                this.message = this.t.verificationCodeSent;

                this.$router.push({ path: "/reset-password", query: { email: this.email } });
            } catch(error) {
                this.message = this.t.invalidCodeError;
                this.isError = true;
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<template>
    <div class="forgot-password-page">
        <div class="forgot-password-container">
            <h2 v-if="step === 1">{{ t.forgotPasswordTitle }}</h2>
            <h2 v-if="step === 2">{{ t.enterVerificationTitle }}</h2>

            <p v-if="step === 1">
                {{ t.forgotPasswordInstruction }}
            </p>
            <p v-if="step === 2">
                {{ t.codeSentInstruction }} <b>{{ email }}</b>. {{ t.resetPasswordFollowup }}
            </p>

            <form v-if="step === 1" @submit.prevent="requestReset">
                <input type="email" v-model="email" :placeholder="t.enterYourEmail" required />

                <button type="submit" :disabled="loading">
                    {{ loading ? t.sending : t.sendVerification }}
                </button>
            </form>

            <form v-if="step === 2" @submit.prevent="verifyCode">
                <input type="text" v-model="code" :placeholder="t.enterCode" required />

                <button type="submit" :disabled="loading">
                    {{ loading ? t.verifying : t.verify }}
                </button>
            </form>

            <p v-if="message" :class="isError ? 'error-message' : 'success-message'">
                {{ message }}
            </p>

            <router-link to="/" class="back-link">{{ t.backToLogin }}</router-link>
        </div>
    </div>
</template>


<style scoped>
.forgot-password-page {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to right, #002241, #021d2e);
}

.forgot-password-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    text-align: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
    color: #002241;
    margin-bottom: 10px;
}

p {
    font-size: 14px;
    color: #555;
}

input {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #e91ea5;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background-color: #d81b80;
    transform: scale(1.05);
}

.error-message {
    color: red;
    margin-top: 10px;
    font-size: 14px;
}

.success-message {
    color: green;
    margin-top: 10px;
    font-size: 14px;
}

.back-link {
    display: block;
    margin-top: 15px;
    font-size: 14px;
    color: #002241;
    text-decoration: none;
}

.back-link:hover {
    text-decoration: underline;
}
</style>
