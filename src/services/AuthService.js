import axios from "axios"

const API_URL = "http://localhost:8080/auth/login";


const AuthService = {
    async login(emailOrUsername, password) {
        try {
            const response = await axios.post(API_URL, {
                emailOrUsername: emailOrUsername,
                password: password
            });
            return response.data;  //returneaza datele utilizatorului daca reuseste
        } catch (error) {
            console.error("Login error:", error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

export default AuthService;