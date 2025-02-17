<script>
import AuthService from "../services/AuthService.js";

export default {
    name: "SidebarGeneral",
    methods: {
        async logout() {
            try {
                await AuthService.logout();
                alert("Logged out!");
                this.$router.push("/");
            } catch(error) {
                console.error("Logout failed", error);
                alert("Logout failed. Please try again.");
            }
        }
    }
};
</script>



<template>
    <aside class="sidebar">
        <h2>Navigation</h2>
        <nav>
            <ul>
                <li @click="$router.push('/')">Home</li>
                <li @click="$router.push('/dashboard')">Dashboard</li>
                <li @click="$router.push('/settings')">Settings</li>
                <li class="logout" @click="logout">Logout</li>
            </ul>
        </nav>
    </aside>
</template>


<style scoped>

.sidebar {
    width: 250px;
    background-color: #001f3f;
    color: white;
    padding: 20px;
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

.sidebar ul li:hover {
    background-color: #004080;
}

.logout {
    color: red;
    font-weight: bold;
}

</style>