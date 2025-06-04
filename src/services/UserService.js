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
    },

    async getUser(id) {
        try {
            const response = await axios.get(`${API_URL}/${id}`, { withCredentials: true});
            return response.data;
        } catch(error) {
            console.error("Error getting user:", error);
            throw error;
        }
    },

    async updateUser(id, payload) {
        try {
            const response = await axios.put(`${API_URL}/${id}`, payload, {headers: { "Content-Type": "application/json" }});
            return response.data;
        } catch(error) {
            console.error("Error updating user:", error.response?.data || error.message);
            throw error;
        }
    },

    async setLanguage(username, languageCode) {
        try {
            await axios.put(`${API_URL}/${encodeURIComponent(username)}/language`,
                { language: languageCode },
                {headers: { "Content-Type": "application/json" } }
            );
        } catch (error) {
            console.error("Error setting language:",  error.response?.data || error.message);
            throw error;
        }
    }
};

export default UserService;