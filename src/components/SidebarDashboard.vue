<script>
import AuthService from "../services/AuthService.js";
import { translations } from "../translations.js";
import { useLanguage } from "../language.js";

export default {
    name: "SidebarDashboard",
    props: ["currentSection"],
    computed: {

        t(){
            const { lang } = useLanguage();
            return translations[lang.value];
        }
    },
    methods: {
        changeSection(section) {
            this.$emit("sectionChanged", section);
            if (section === "tasks") {
                this.$emit("fetchTasks");
            } 
            
        },
        async handleTasksClick() {
            this.changeSection("tasks");
            this.$emit("fetchTasks");
        },
        async handleCalendarClick() {
            this.changeSection("calendar");
            //this.$emit("calendar");
        },
        async handleStatsClick() {
            this.changeSection("stats");
            this.$router.push("/stats");
        },
        async logout() {
            try {
                await AuthService.logout();
                alert(this.t.logoutSuccess);
                this.$router.push("/");
            } catch (error) {
                console.error("Logout failed", error);
                alert(this.t.logoutFail);
            }
        }
    }
};

</script>

<template>
     <aside class="sidebar">
        <h2 class="logo">SB</h2>
        <nav>
            <ul>
                <li @click="handleTasksClick" :class="{ active: currentSection === 'tasks' }">
                    <span class="mdi mdi-format-list-bulleted"></span> {{ t.myTasks }}
                </li>
                <li @click="changeSection('calendar')" :class="{ active: currentSection === 'calendar'}">
                    <span class="mdi mdi-calendar-month"></span> {{ t.academicCalendar }}
                </li>
                <li @click="changeSection('pomodoro')" :class="{ active: currentSection === 'pomodoro'}">
                    <span class="mdi mdi-timer"></span> {{ t.pomodoroTimer }}
                </li>
                <li @click="handleStatsClick" :class="{ active: currentSection === 'stats' }">
                    <span class="mdi mdi-chart-bar"></span> {{ t.stats }}
                </li>
                <li class="logout" @click="logout">
                    <span class="mdi mdi-logout"></span> {{ t.logout }}
                </li>
            </ul>
        </nav>
    </aside>
</template>

<style scoped>

.sidebar {
    width: 220px;
    background-color: #002241;
    color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.logo {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #e91ea5;
}


.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar ul li {
    padding: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.3s;
}

.sidebar ul li span {
    font-size: 20px;
}

.sidebar ul li:hover, .active {
    background-color: #004080;
    border-radius: 5px;
}

.logout {
    margin-top: auto;
    color: #e91ea5;
    font-weight: bold;
}

</style>