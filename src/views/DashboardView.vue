<script>

import SidebarDashboard from "../components/SidebarDashboard.vue";
import NavBar from "../components/NavBar.vue";
import TaskService from "../services/TaskService.js";
import AuthService from "../services/AuthService.js";
import PomodoroView from "../views/PomodoroView.vue";
import CalendarView from "../views/CalendarView.vue";

export default {
    name: "DashboardView",
    components: { SidebarDashboard, NavBar, PomodoroView, CalendarView },
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
            newTaskDeadline: "",
            taskStates: ["TO_DO", "IN_PROGRESS", "DONE"],
            //calendar: CalendarView,
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
                case "calendar":
                    return "Academic Calendar";
                default:
                    return "";
            }
        },

        componentMap() {
            return {
                tasks: "TaskList", // Dacă ai un component TaskList.vue, altfel rămâne cod static
                completed: "CompletedTasks",
                categories: "TaskCategories",
                calendar: CalendarView,
            };
        },

        activeComponent() {
            //console.log("Recalculating activeComponent for:", this.currentSection);
            return this.currentSection;
        },


        groupedTasks() {
            return {
                TO_DO: this.tasks.filter(task => task.state === "TO_DO"),
                IN_PROGRESS: this.tasks.filter(task => task.state === "IN_PROGRESS"),
                DONE: this.tasks.filter(task => task.state === "DONE"),
            };
        }
    },
    
    methods: {
        changeSection(section) {
            //console.log("Changing section to:", section);
            this.currentSection = section;
            this.errorMessage = "";
            if(section === "tasks") {
                this.fetchTasks();
            } else if (section === "pomodoro") {
                this.$router.push("/pomodoro"); 
            } 
            // else if (section === "calendar") {
            //     this.currentSection = "calendar";
            // }

        },

        getUrgencyIcon(deadline) {
            if (!deadline) return; 
            const deadlineDate = new Date(deadline);
            const today = new Date();
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays < 0) return "mdi-alert-circle";  
            if (diffDays <= 1) return "mdi-alert-circle";  
            if (diffDays <= 4) return "mdi-timer-sand"; 
    
            return "mdi-clock-outline";             
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

        async updateTaskState(task) {
            try {
                await TaskService.updateTaskState(task.id, task.state);
            } catch (error) {
                alert("Failed to update task. Please try again.");
            }
        },

        async deleteTask(taskId) {
            try {
                await TaskService.deleteTask(taskId);
                this.tasks = this.tasks.filter(task => task.id !== taskId);
            } catch (error) {
                console.error("Error deleting task:", error);
                alert("Failed to delete task. Please try again.");
            }
        },

        async clearCompletedTasks() {
            try {
                await TaskService.clearCompletedTasks();
                this.tasks = this.tasks.filter(task => task.state !== "DONE");
            } catch (error) {
                console.error("Error clearing completed tasks:", error);
                alert("Failed to clear completed tasks.");
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
                    deadline: this.newTaskDeadline || null,
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
                this.newTaskDeadline = "";
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
                    <div class="task-buttons" v-if="currentSection ==='tasks'">
                        <button class="add-task-button" @click="showAddTaskModal = true">+ Add Task</button>
                        <button class="clear-completed-btn" v-if="tasks.some(task => task.state === 'DONE')" @click="clearCompletedTasks">
                            <i class="mdi mdi-delete-sweep"></i> Clear Completed
                        </button>
                    </div>
                </div>


                <p v-if="loading">Loading tasks...</p>
                <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

                                <div v-if="currentSection === 'tasks'" class="task-list">
                    <template v-for="(tasks, state) in groupedTasks" :key="state">
                        <div v-if="tasks.length > 0">
                        <h2 class="task-section-title"> {{ state.replace("_", " ") }}</h2>
                        <ul>
                            <li v-for="task in tasks" :key="task.id" class="task-item">
                                <div class="task-info">
                                    <span class="task-text">{{ task.text }}</span>
                                    <span class="task-urgency">
                                        <i v-if="task.state !== 'DONE'" 
                                        :class="`mdi ${getUrgencyIcon(task.deadline)}`"></i>
                                    </span>
                                    <span class="task-deadline">
                                        <i class="mdi mdi-calendar"></i> {{ task.deadline || "No Deadline" }}
                                    </span>
                                </div>

                                <div class="task-controls">
                                    <select v-model="task.state" @change="updateTaskState(task)" class="task-state-select">
                                        <option v-for="state in taskStates" :key="state" :value="state">
                                            {{ state.replace("_", " ") }}
                                        </option>
                                    </select>

                                    <button v-if="task.state === 'DONE'" @click="deleteTask(task.id)" class="task-delete">
                                        <i class="mdi mdi-trash-can-outline"></i>
                                    </button>
                                </div>
                            </li>
                        </ul>
                        </div>
                    </template>

                    
                



                    <div v-if="showAddTaskModal" class="modal-overlay">
                        <div class="modal">
                            <h2>Add New Task</h2>
                            <input v-model="newTaskText" type="text" placeholder="Enter task..." />

                            <div class="deadline-container">
                                <label for="taskDeadline" class="deadline-label">Enter deadline:</label>
                                <input id="taskDeadline" v-model="newTaskDeadline" type="date" class="deadline-input" />
                            </div>

                            <div class="modal-buttons">
                                <button class="save-button" @click="addTask">Save</button>
                                <button class="cancel-button" @click="showAddTaskModal = false">Cancel</button>
                            </div>
                        </div>
                    </div>
                

                </div>

                <component :is="componentMap[currentSection]" />

                

            </div>

        </div>
    </div>
</template>

<style scoped>

.task-urgency i {
    font-size: 18px;
    margin-left: 8px;
}

.mdi-alert-circle { color: red; }  
.mdi-timer-sand { color: orange; }   
.mdi-clock-fast { color: goldenrod; }   
.mdi-clock-outline { color: green; }    
.mdi-calendar-clock {color: green;} 


.deadline-container {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
}

.deadline-label {
    font-size: 15px;
    color: #555;
    font-weight: 500;
    white-space: nowrap;
}

.deadline-input {
    flex-grow: 1;
    padding: 6px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
}


.task-info {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-grow: 1;
}

.task-deadline {
    font-size: 14px;
    color: #555;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    min-width: 120px;
}

/* .task-deadline i {
    font-size: 16px;
    color: #e91ea5; 
} */

.task-text {
    font-size: 16px;
    color: #333;
    flex-grow: 1;
}

.delete-task-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #e91ea5;
    margin-left: 10px;
}

.delete-task-btn:hover {
    color:#d81b80
}

.clear-completed-btn {
    background-color: #e91ea5;
    color: white;
    font-weight: bold;
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.clear-completed-btn:hover {
    background-color:#d81b80
}

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
    overflow-y: auto;
    height: 100vh;
}

.task-section-title {
    font-size: 20px;
    font-weight: bold;
    color: #002241;
    margin: 20px 0 10px;
    padding-bottom: 5px;
    border-bottom: 2px solid #e91ea5;
    margin-left: 5px;
}


.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 8px;
}

.tasks-title {
    font-size: 28px;
    font-weight: bold;
    color: #002241;
    margin: 0;
}

.task-list {
    max-height: none; 
    overflow-y: visible;
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

.task-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.task-delete {
    font-size: 18px;
    cursor: pointer;
    color: #e91ea5;
    transition: color 0.3 ease-in-out;
    background: none;
    border: none;
    display: flex;
    align-items: center;
}


.task-delete:hover {
    color: #d81b80;
}

.task-state-select {
    padding: 6px;
    font-size: 14px;
    font-weight: bold;
    color: #002241;
    background-color: white;
    border: 2px solid #e91ea5;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    width: auto;
    min-width: 120px;
    text-align: center;
}

.task-state-select:focus,
.task-state-select:hover {
    background-color: #e91ea5;
    color: white;
    border-color: #002241;
}

.task-state-select option {
    background-color: white;  
    color: #002241;  
    font-weight: normal;
}

.task-state-select option:checked {
    background-color: white !important;
    color: black;
}

.task-state-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.task-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-bottom: 10px;
}


.dashboard-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: calc(100vh - 80px);
    padding-bottom: 20px;
    margin-top: 20px;
}

h1 {
    color: #002241;
}

.error {
    color: red;
}

</style>