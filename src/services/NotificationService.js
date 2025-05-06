import axios from "axios";

axios.defaults.withCredentials = true;

const language = localStorage.getItem("language") || "en";

const API_URL = "http://localhost:8080/notifications";

const NotificationService = {
    async getNotifications(userId) {
        try {
            const response = await axios.get(`${API_URL}?userId=${userId}`, {
                headers: {
                    'Accept-Language': language
                }
            });
            return response.data;
        } catch(error) {
            console.error("Error fetching notifications:", error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async getUnreadCount(userId) {
        try {
            const response = await axios.get(`${API_URL}/unread-count?userId=${userId}`);
            return response.data;
        } catch(error) {
            console.error("Error fetching unread count:", error.response ? error.response.data : error.message);
        }
    },

    async markAllAsRead(userId) {
        try {
            await axios.post(`${API_URL}/mark-read?userId=${userId}`);
        } catch(error) {
            console.error("Error marking notifications as read:", error.response ? error.response.data : error.message);
        }
    }
 };

 export default NotificationService;