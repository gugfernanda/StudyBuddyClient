<script>
import AuthService from '../services/AuthService';

export default {
    data() {
        return {
            email: "",
            password: "",
            confirmPassword: "",
            message: "",
            isError: false,
            loading: false,
            showPassword: false,
            showConfirmPassword: false
        };
    },
    created() {
        const urlParams = new URLSearchParams(window.location.search);
        this.email = urlParams.get("email");
    },
    methods: {
        async resetPassword() {
            this.loding = true;
            this.message = "";
            this.isError = false;

            if(this.password !== this.confirmPassword) {
                this.message = "Passwords do not match!";
                this.isError = true;
                this.loading = false;
                return;
            }

            try {
                const response = await AuthService.resetPassword(this.email, this.password);
                this.message = response.message;
            } catch(error) {
                this.message = "Error reseting password. Please try again.";
                this.isError = true;
            } finally {
                this.loading = false;
            }
        },
        togglePassword(field) { 
            if (field === 'password') {
                this.showPassword = !this.showPassword;
            } else if (field === 'confirmPassword') {
                this.showConfirmPassword = !this.showConfirmPassword;
            }
        }
    }
}
</script>

<template>
    <div class="reset-password-page">
        <div class="reset-password-container">
            <h2>Reset Password</h2>
            <p>Please enter your new password below.</p>

            <form @submit.prevent="resetPassword">
                <div class="password-container">
                    <input
                        :type="showPassword ? 'text' : 'password'"
                        v-model="password"
                        placeholder="New Password"
                        required
                    />
                    <span class="toggle-password" @click="togglePassword('password')">
                        <span :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></span>
                    </span>
                </div>


                <div class="password-container">
                    <input
                        :type="showConfirmPassword ? 'text' : 'password'"
                        v-model="confirmPassword"
                        placeholder="Confirm New Password"
                        required
                    />
                    <span class="toggle-password" @click="togglePassword('confirmPassword')">
                        <span :class="showConfirmPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></span>
                    </span>
                </div>

                <button type="submit" :disabled="loading">
                    {{ loading ? "Reseting..." : "Reset Password" }}
                </button>

            </form>

            <p v-if="message" :class="isError ? 'error-message' : 'success-message'">
                    {{  message }}
            </p>

            <router-link to="/" class="back-link">Back to Login</router-link>

        </div>
    </div>
</template>

<style scoped>
.reset-password-page {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to right, #002241, #021d2e);
}

.reset-password-container {
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
    color: #e91ea5;
    text-decoration: none;
}

.back-link:hover {
    text-decoration: underline;
}

.password-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
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