import axios from 'axios';

const API_URL = "http://localhost:8080/schedule";

const ScheduleImport = {
    async importManualSchedule(dto) {
        try {
            const response = await axios.post(`${API_URL}/manual`, dto, {withCredentials: true});
            return response.data;
        } catch (error) {
            console.error("Error importing manual schedule:", error);
            throw error;
        }
    },
    
    async deleteManualSchedule(label) {
        try {
            const response = await axios.delete(`${API_URL}/label/${label}`, { params: {label}, withCredentials: true});
            return response.data;
        } catch(error) {
            console.error("Error deleting manual schedule:", error);
            throw error;
        }
    },

    async importScheduleByUrl(dto) {
        try {
            const response = await axios.post(`${API_URL}/importByUrl`, dto, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error("Error importing schedule by URL:", error);
            throw error;
        }
    }
}

export default ScheduleImport;