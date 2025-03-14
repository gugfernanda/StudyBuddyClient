<script>
import AuthService from '../services/AuthService.js';

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

    methods: {
        async requestReset() {
            this.loading = true;
            this.message = "";
            this.isError = false;

            try {
                const response = await AuthService.forgotPassword(this.email);
                this.message = response.message;
                this.step = 2;
            } catch(error) {
                this.message = "Error sending reset link. Please try again.";
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
                this.message = response.message;

                this.$router.push({ path: "/reset-password", query: { email: this.email } });
            } catch(error) {
                this.message = "Invalid code. Please try again."
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
            <h2 v-if="step === 1">Forgot Password</h2>
            <h2 v-if="step === 2">Enter Verification Code</h2>

            <p v-if="step === 1">
                Enter your email address below, and we'll send you a 6-digit verification code.
            </p>
            <p v-if="step === 2">
                A 6-digit code has been sent to <b>{{ email }}</b>. Enter it below to reset your password.
            </p>

            <!-- ✅ Formular pentru trimiterea codului -->
            <form v-if="step === 1" @submit.prevent="requestReset">
                <input type="email" v-model="email" placeholder="Enter your email" required />

                <button type="submit" :disabled="loading">
                    {{ loading ? "Sending..." : "Send Verification Code" }}
                </button>
            </form>

            <!-- ✅ Formular pentru introducerea codului -->
            <form v-if="step === 2" @submit.prevent="verifyCode">
                <input type="text" v-model="code" placeholder="Enter verification code" required />

                <button type="submit" :disabled="loading">
                    {{ loading ? "Verifying..." : "Verify Code" }}
                </button>
            </form>

            <p v-if="message" :class="isError ? 'error-message' : 'success-message'">
                {{ message }}
            </p>

            <router-link to="/" class="back-link">Back to Login</router-link>
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
