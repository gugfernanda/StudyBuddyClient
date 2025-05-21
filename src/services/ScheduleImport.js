import axios from 'axios';

const API_URL = "http://localhost:8080/schedule";

export default {
    async importManualSchedule(dto) {
        try {
            const response = await axios.post(`${API_URL}/manual`, dto, {withCredentials: true});
            return response.data;
        } catch (error) {
            console.error("Error importing manual schedule:", error);
            throw error;
        }
    }
}