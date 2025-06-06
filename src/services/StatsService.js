import axios from "axios"

const API_URL = "http://localhost:8080/stats";

const StatsService = {
    async getWeeklyStats(userId) {
        try {
            const response = await axios.get(`${API_URL}/${userId}/weekly`, {
                withCredentials: true
            });
            return response.data;
        } catch(err) {
            console.error("Error fetching weekly stats:", err);
            throw err;
        }
    },

    async getMonthlyStats(userId) {
        try {
            const response = await axios.get(`${API_URL}/${userId}/monthly`, {
                withCredentials: true
            });
            return response.data;
        } catch(err) {
            console.error("Error fetching monthly stats:", err);
            throw err;
        }
    }
};

export default StatsService;