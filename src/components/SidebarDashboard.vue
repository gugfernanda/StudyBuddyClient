<script>
import AuthService from "../services/AuthService.js";

export default {
    name: "SidebarDashboard",
    props: ["currentSection"],
    methods: {
        changeSection(section) {
            this.$emit("sectionChanged", section);
        },
        async logout() {
            try {
                await AuthService.logout();
                alert("Logged out!");
                this.$router.push("/");
            } catch (error) {
                console.error("Logout failed", error);
                alert("Logout failed. Please try againn");
            }
        }
    }
};

</script>

<template>
    <aside class="sidebar">
        <h2>Study Buddy</h2>
        <nav>
            <ul>
                <li @click="changeSection('tasks')" :class="{ active: currentSection === 'tasks' }">My Tasks</li>
                <li @click="changeSection('completed')" :class="{ active: currentSection === 'completed' }">Completed</li>
                <li @click="changeSection('categories')" :class="{ active: currentSection === 'categories'}">Categories</li>
                <li class="logout" @click="logout">Logout</li>
            </ul>
        </nav>
    </aside>
</template>

<style scoped>

.sidebar {
    width: 250px;
    background-color: #002241;
    color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.sidebar h2 {
    text-align: center;
    margin-bottom: 20px;
}

.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar ul li {
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.sidebar ul li:hover, .active {
    background-color: #004080;
}

.logout {
    margin-top: auto;
    color: red;
    font-weight: bold;
}

</style>