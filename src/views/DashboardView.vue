<script>

import SidebarDashboard from "../components/SidebarDashboard.vue";

export default {
    name: "DashboardView",
    components: { SidebarDashboard },
    data() {
        return {
            currentSection: "tasks"
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
        }
    }
};

</script>



<template>
    <div class="dashboard-container">
        <SidebarDashboard :currentSection="currentSection" @sectionChanged="changeSection" />

        <main class="content">
            <h1>{{ sectionTitle }}</h1>
            <div v-if="currentSection === 'tasks'">
                <p>Here will be the task list...</p>

            </div>
            <div v-if="currentSection === 'completed'">
                <p>Here will be the completed tasks...</p>

            </div>
            <div v-if="currentSection === 'categories'">
                <p>Here will be the categories...</p>

            </div>
        </main>

    </div>
</template>

<style scoped>

.dashboard-container {
    display: flex;
    height: 100vh;
    width: 100vw;
}

.content {
    flex-grow: 1;
    padding: 20px;
    background-color: #f4f4f4;
}

h1 {
    color: #002241;
}

</style>