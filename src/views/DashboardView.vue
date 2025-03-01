<script>

import SidebarDashboard from "../components/SidebarDashboard.vue";
import NavBar from "../components/NavBar.vue";
import TaskService from "../services/TaskService.js";
import AuthService from "../services/AuthService.js";

export default {
    name: "DashboardView",
    components: { SidebarDashboard, NavBar },
    data() {
        return {
            currentSection: "tasks",
            tasks: [],
            username: "",
            loading: true,
            errorMessage: "",
            showAddTaskModal: false,
            newTaskText: "",
            newTaskState: "TO_DO",
            taskStates: ["TO_DO", "IN_PROGRESS", "DONE"],
        };
    },
    computed: {
        sectionTitle() {
            switch (this.currentSection) {
                case "tasks":
                    return "My Tasks";
                case "completed":
                    return "Completed Tasks";
                case "categories":
                    return "Task Categories";
                default:
                    return "";
            }
        }
    },
    methods: {
        changeSection(section) {
            this.currentSection = section;
            this.errorMessage = "";
            if(section === "tasks") {
                this.fetchTasks();
            }
        },

        async fetchTasks() {
            if(!this.username) {

                console.error("Cannot fetch tasks - username is missing");

                this.errorMessage = "User not found.";
                console.error("User is missing, cannot fetch tasks.");
                return;
            }
            try {
                this.loading = true;
                const tasks = await TaskService.getUserTasks(this.username);
                this.tasks = tasks;
                this.errorMessage = "";
            } catch (error) {
                this.errorMessage = "Failed to load tasks. Please try again.";
                console.error("Error fetching tasks:", error);
            } finally {
                this.loading = false;
            }
        },

        async addTask() {
            if(!this.newTaskText.trim()) {
                alert("Task text cannot be empty!");
                return;
            }

            try {
                const newTask = {
                    text: this.newTaskText,
                    state: this.newTaskState,
                    username: this.username,
                };

                //console.log("Sending task:", newTask);

                const createdTask = await TaskService.createTask(newTask);
                
                //console.log("Task created successfully:", createdTask);
                //console.log("Current tasks before push:", this.tasks)

                if (!Array.isArray(this.tasks)) {
                    //console.warn("this.tasks was undefined. Initializing it now.");
                    this.tasks = [];
                }

                this.tasks.push(createdTask);
                //console.log("Task added successfully:", this.tasks);
                this.newTaskText = "";
                this.newTaskState = "TO_DO";
                this.showAddTaskModal = false;
            } catch(error) {
                console.error("Error adding task:", error);
                alert("Failed to add task. Please try again.");
            }
        }
    },


        async created() {
            try {

                //console.log("Calling getCurrentUser() on page load...");

                const user = await AuthService.getCurrentUser();

                //console.log("User received on load:", user);

                if(user && user.username) {
                    this.username = user.username;

                    //console.log("Username set:", this.username);
                    //console.log("Calling fetchTasks()...");

                    await this.fetchTasks();
                } else {

                    console.warn("User not logged in, cannot fetch tasks");
                    this.errorMessage = "User not logged in.";
                }
            } catch (error) {
                this.errorMessage = "Error retrieving user data.";
                console.error(error);
            }
        }
    };
</script>



<template>
    <div class="dashboard-container">
        <SidebarDashboard :currentSection="currentSection"
         @sectionChanged="changeSection"
         @fetchTasks="fetchTasks" 
         />

        <div class="main-content">
            <NavBar />
            <div class="dashboard-content">
                <div class="header">
                    <h1 class="tasks-title">{{ sectionTitle }}</h1>
                    <button class="add-task-button" @click="showAddTaskModal = true">+ Add Task</button>
                </div>



                <p v-if="loading">Loading tasks...</p>
                <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

                <div v-if="currentSection === 'tasks'">
                    <ul v-if="tasks.length > 0">
                        <li v-for="task in tasks" :key="task.id">
                            <span>{{ task.text }}</span> - <strong>{{ task.state }}</strong>
                        </li>
                    </ul>
                    <p v-else>No tasks available.</p>
                </div>
                

                <div v-if="currentSection === 'completed'">
                    <p>Here will be the completed tasks...</p>
                </div>
                <div v-if="currentSection === 'categories'">
                    <p>Here will be the categories...</p>
                </div>

                <div v-if="showAddTaskModal" class="modal-overlay">
                    <div class="modal">
                        <h2>Add New Task</h2>
                        <input v-model="newTaskText" type="text" placeholder="Enter task..." />

                        <div class="task-state-container">
                            <label for="taskState">Select Task State:</label>
                            <select id="taskState" v-model="newTaskState">
                                <option v-for="state in taskStates" :key="state" :value="state">
                                    {{ state.replace("_", " ") }}
                                </option>
                            </select>
                        </div>

                        <div class="modal-buttons">
                            <button class="save-button" @click="addTask">Save</button>
                            <button class="cancel-button" @click="showAddTaskModal = false">Cancel</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>

.dashboard-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}

.main-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background-color: #f4f4f4;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;
}

.tasks-title {
    font-size: 28px;
    font-weight: bold;
    color: #002241;
    margin: 0;
}

.add-task-button {
    background-color: #e91ea5;
    color: white;
    font-weight: bold;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 14px;
    width: auto;
    min-width: 120px;
    text-align: center;
}

.add-task-button:hover {
    background-color: #d81b80;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 320px;
    text-align: center;
}

.modal input {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.task-state-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    width: 100%;
}

.modal label {
    font-weight: bold;
    margin-right: 10px;
    white-space: nowrap;
}

.modal select {
    width: 160px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
}

.modal-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}

.save-button {
    background-color: #e91ea5;
    color: white;
    /* padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer; */
}

.cancel-button {
    background-color: #002241;
    color: white;
    /* padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer; */
}

.save-button, .cancel-button {
    flex: 1;
    padding: 10px;
    margin: 0 5px; 
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.save-button:hover {
    background-color: #d81b80;
}

.cancel-button:hover {
    background-color: #00172e;
}

.dashboard-content {
    flex-grow: 1;
    padding: 20px;
}

h1 {
    color: #002241;
}

.error {
    color: red;
}

</style>