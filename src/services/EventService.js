import axios from "axios";

const API_URL = "http://localhost:8080/events";

const EventService = {
    async getUserEvents(username) {
        try {
            const response = await axios.get(`${API_URL}/${username}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error("Error fetching events:", error);
            throw error;
        }
    },

    async createEvent(eventData) {
        try {
            const response = await axios.post(`${API_URL}`, eventData, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error("Error creating event:", error);
            throw error;
        }
    },

    async updateEvent(eventId, updatedEventData) {
        try {
            const response = await axios.put(`${API_URL}/${eventId}`, updatedEventData, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error("Error updating event:", error);
            throw error;
        }
    },

    async deleteEvent(eventId) {
        try {
            const response = await axios.delete(`${API_URL}/delete/${eventId}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error("Error deleting event:", error);
            throw error;
        }
    }
};

export default EventService;