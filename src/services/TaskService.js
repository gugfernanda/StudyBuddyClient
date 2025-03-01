import axios from "axios"

axios.defaults.withCredentials = true;

const API_URL = "http://localhost:8080/tasks";


const TaskService = {
    async getUserTasks(username) {
        try {
            const response = await axios.get(`${API_URL}/user/${username}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error("Error fetching tasks:", error);
            throw error;
        }
    },

    async createTask(taskData) {
        try {
            const response = await axios.post(`${API_URL}/create`, taskData, { withCredentials: true });

            //console.log("Server response:", response);
            //console.log("Server response data:", response.data)

            return response.data;
        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
        }
    }
};

export default TaskService;