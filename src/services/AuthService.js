import axios from "axios"


axios.defaults.withCredentials = true;

const API_URL = "http://localhost:8080/auth";




const AuthService = {
    async login(emailOrUsername, password) {
        try {
            const response = await axios.post(API_URL + "/login", {
                emailOrUsername,
                password
            }, { withCredentials: true });

            if(response.status === 200) {
                localStorage.setItem("user", JSON.stringify(response.data))  //salveaza userul in local storage
                return response.data;
            } else {
                throw new Error("Login failed");
            }

        } catch (error) {
            console.error("Login error:", error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            const response = await axios.get(API_URL + "/current-user", {
                withCredentials: true
            });

            //console.log("Current user response:", response.data);

            return response.data;

        } catch (error) {
            console.error("Error getting current user:", error);
            return null;
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
    },
    async logout() {
        try {
            await axios.post(API_URL + "/logout", {
                withCredentials: true
            });

            localStorage.removeItem("user");
            console.log("User logged out successfully");
        } catch (error) {
            console.error("Logout error:", error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

export default AuthService;