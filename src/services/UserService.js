import axios from "axios"

const API_URL = "http://localhost:8080/users";

const UserService = {
    async getAllUsers() {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    async createUser(userData) {
        try {
            const response = await axios.post(API_URL, userData);
            return response.data;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    async deleteUser(id) {
        try {
            await axios.delete('${API_URL}/delete/${id}');
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }
};

export default UserService;