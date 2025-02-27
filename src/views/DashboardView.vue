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
            errorMessage: ""
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
                console.log(`Fetching tasks for user: ${this.username}`);
                const tasks = await TaskService.getUserTasks(this.username);
                console.log("Tasks received:", tasks);
                this.tasks = tasks;
                this.errorMessage = "";
            } catch (error) {
                this.errorMessage = "Failed to load tasks. Please try again.";
                console.error("Error fetching tasks:", error);
            } finally {
                this.loading = false;
            }
        },

        async testGetCurrentUser() {
            const user = await AuthService.getCurrentUser();
            console.log("User from test button:", user);
        }
    },


        async created() {
            try {

                console.log("Calling getCurrentUser() on page load...");

                const user = await AuthService.getCurrentUser();

                console.log("User received on load:", user);

                if(user && user.username) {
                    this.username = user.username;

                    console.log("Username set:", this.username);
                    console.log("Calling fetchTasks()...");

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
                <h1>{{ sectionTitle }}</h1>



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