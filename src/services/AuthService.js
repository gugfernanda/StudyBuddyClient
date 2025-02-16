import axios from "axios"

const API_URL = "http://localhost:8080/auth";




const AuthService = {
    async login(emailOrUsername, password) {
        try {
            const response = await axios.post(API_URL + "/login", {
                emailOrUsername,
                password
            });
            return response.data;  //returneaza datele utilizatorului daca reuseste
        } catch (error) {
            console.error("Login error:", error.response ? error.response.data : error.message);
            throw error;
        }
    },
    async register(username, fullName, email, password) {
        try {
            const requestData = { username, fullName, email, password };
            console.log("Sending request data:", requestData); 

            const response = await axios.post(API_URL + "/register", requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            console.log("Register response:", response.data);
            return response.data;
        } catch (error) {
            console.error("Registration error:", error.response ? error.response.data : error.message);
        }
    }
};

export default AuthService;