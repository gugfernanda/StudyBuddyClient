import axios from "axios"

axios.defaults.withCredentials = true;

const API_URL = "http://localhost:8080/tasks";


const TaskService = {
    async getUserTasks(username) {
        try {
            const response = await axios.get(`${API_URL}/user/${username}`, { withCredentials: true });
            console.log("✅ Tasks received:", response.data);
            console.log("Tasks received:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching tasks:", error);
            throw error;
        }
    }
};

export default TaskService;