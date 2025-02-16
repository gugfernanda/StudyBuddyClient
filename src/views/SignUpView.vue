<script>
import AuthService from "../services/AuthService.js"

export default {
    name: "SignUpView",
    data() {
        return {
            username: "",
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            errorMessage: ""
        };
    },
    methods: {
        async register () {
            if(this.password !== this.confirmPassword) {
                this.errorMessage = "Passwords do not match!";
                return;
            }

            try {
                const user = await AuthService.register(this.username, this.fullName, this.email, this.password);
                console.log("User registered:", user);
                alert("Account created successfully! You can now log in.");
                this.$router.push("/");
            } catch (error) {
                this.errorMessage = error.response ? error.response.data : "Sign up failed. Please try again.";
                console.error("Sign up error:", error);
            }
        }
    }
}
</script>

<template>
    <div class="signup-container">
        <div class="signup-box">
            <h2>Sign Up</h2>
            <form @submit.prevent="register">
                <input type="text" v-model="fullName" placeholder="Full Name" required />
                <input type="text" v-model="username" placeholder="Username" required />
                <input type="email" v-model="email" placeholder="Email" required />
                <input type="password" v-model="password" placeholder="Password" required />
                <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required />
                <button type="submit">Sign Up</button>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            </form>
            <p class="login-text">
                Already have an account?
                <router-link to="/" class="login-link">Login</router-link>
            </p>
        </div>
    </div>
</template>


<style scoped>
/* Asigură că pagina ocupă tot ecranul */
.signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: #f4f4f4;
}

/* Caseta de sign-up */
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

/* Input field styling */
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

/* Buton de submit */
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