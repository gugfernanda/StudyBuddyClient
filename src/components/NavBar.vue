<script>
import AuthService from '../services/AuthService.js';
import NotificationService from "../services/NotificationService.js";

export default {
    name: "NavBar",
    data() {
        // const user = JSON.parse(localStorage.getItem("user"));
        // console.log("Local user: ", user)
        return {
            showNotifications: false,
            notifications: [],
            unreadCount: 0,
            userId: null,
        };
    },
    mounted() {
        AuthService.getCurrentUser().then(async user => {
            //console.log("User from backend:", user);
            if(user?.username) {
                const userWithId = await AuthService.getUserByUsername(user.username);
                //console.log("✅ User with ID:", userWithId);
                this.userId = userWithId.id;
                this.fetchNotifications();
            }
        }).catch(error => {
            console.error("Failed to load current user", error);
        })
    },
    methods: { 
        async fetchNotifications() {
            try {
                //console.log("📨 Fetching notifications for userId:", this.userId);

                this.notifications = await NotificationService.getNotifications(this.userId);
                this.unreadCount = await NotificationService.getUnreadCount(this.userId);
                //console.log("✅ Notifications:", this.notifications);
            } catch(error) {
                console.error("Faiked to load notifications", error);
            }
        },

        async markAsRead() {
            try {
                await NotificationService.markAllAsRead(this.userId);
                this.unreadCount = 0;
            } catch(error) {
                console.error("Failed to mark notifications as read", error);
            }
        },

        toggleNotifications() {
            this.showNotifications = !this.showNotifications;
            if(this.showNotifications && this.unreadCount > 0) {
                this.markAsRead();
            }
        }
    }
};

</script>

<template>
   <header class="navbar">
        <div class="title">Study Buddy</div>
        <div class="user-actions">
            <input type="text" placeholder="Search..." class="search-bar">
            <div class="icons-container">
                <div class="notification-wrapper">
                
                    <button class="icon-button" @click="toggleNotifications">
                        <span class="mdi mdi-bell"></span>
                        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
                    </button>
                    <div v-if="showNotifications" class="dropdown">
                        <div v-if="notifications.length === 0" class="no-notifs">No notifications</div>
                        <div v-for="notif in notifications" :key="notif.id" class="notif-item">
                            <p>{{ notif.message }}</p>
                            <small>{{ new Date(notif.createdAt).toLocaleDateString() }}</small>
                        </div>
                    </div>
                </div>
                    <button class="icon-button">
                        <span class="mdi mdi-account"></span>
                    </button>
            </div>
        </div>
    </header>
</template>

<style scoped>

.navbar {
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
    font-size: 20px;
    font-weight: bold;
    color: #002241;
}

.user-actions {
    display: flex;
    align-items: center;
    gap: 10px; 
}

.search-bar {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    width: 250px;
}


.icons-container {
    display: flex;
    align-items: center;
    gap: 5px;
}

.icon-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 22px;
    padding: 5px;
    color: #002241;
    position: relative;
}

.icon-button:hover {
    color: #e91ea5;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #e91ea5;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
}

.notification-wrapper {
  position: relative;
}

.dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  z-index: 999;
}

.notif-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.notif-item p {
  margin: 0;
  font-weight: 500;
}

.notif-item small {
  color: gray;
  font-size: 12px;
}

.no-notifs {
  padding: 10px;
  text-align: center;
  color: gray;
}

</style>