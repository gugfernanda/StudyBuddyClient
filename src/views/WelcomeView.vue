<template>
    <div class="container">
        <div class="left">
            <h1>Welcome to Study Buddy</h1>
            <p>Organize your tasks and boost your productivity.</p>
        </div>
        <div class="right">
            <div class="login-box">
                <h2>Login</h2>
                <form @submit.prevent="login">

                    <input type="text" v-model="emailOrUsername" placeholder="Username or Email" required />
                    <input type="password" v-model="password" placeholder="Password" required />
                    <button type="submit">Login</button>
                    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

                </form>
                <p class="signup-text">
                    Don't have an account?
                    <router-link to="/signup" class="signup-link">Sign up</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script>

import AuthService from "../services/AuthService.js";

export default {
    name: "WelcomeView",
    data() {
        return {
            emailOrUsername: "",
            password: "",
            errorMessage: ""
        };
    },
    methods: {
        async login() {
            try {
                const user = await AuthService.login(this.emailOrUsername, this.password);
                console.log("User logged in:", user);
                alert("Login successful!");
                //this.$router.push('/dashboard');
            } catch (error) {
                this.errorMessage = error.response ? error.response.data : "Login failed.";
            }
        }
    }
};

</script>



<style scoped>

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

</style>
