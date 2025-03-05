<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventService from '../services/EventService.js';
import AuthService from '../services/AuthService.js';

export default {
    name: "CalendarView",
    components: {
        FullCalendar,
    },

    data() {
        return {
            username: "",
            events: [],
            calendarOptions: {
                plugins: [dayGridPlugin, interactionPlugin],
                initialView: 'dayGridMonth',
                selectable: true,
                editable: true,
                events: [],
                dateClick: this.handleDateClick,
            },
            newEventTitle: "",
            selectedDate: "",
            showModal: false,
        };
    },
    async created() {
        await this.loadUserAndEvents();
    },
    methods: {

        async loadUserAndEvents() {
            try {
                const user = await AuthService.getCurrentUser();
                if(user && user.username) {
                    this.username = user.username;
                    await this.fetchEvents();
                } else {
                    console.warn("User not authenticated");
                }
            } catch(error)  {
                console.error("Error fetching user:", error);
            }
        },

        async fetchEvents() {
            try {
                if(!this.username) return;
                const eventsFromServer = await EventService.getUserEvents(this.username);
                this.events = eventsFromServer.map(event => ({
                    title: event.title,
                    startTime: event.startTime,
                    id: event.id,
                }));
                this.calendarOptions.events = this.events;
            } catch(error) {
                console.error("Error fetching events:", error);
            }
        },

        handleDateClick(info) {
            this.selectedDate = info.dateStr;
            this.showModal = true;
        },

        async addEvent() {
            if(!this.newEventTitle.trim()) {
                alert("Event title cannot be empty!");
                return;
            }

            if(!this.username) {
                alert("User not found. Please log in.");
                return;
            }

            const newEvent = {
                title: this.newEventTitle,
                description: "New event",
                startTime: this.selectedDate,
                endTime: this.selectedDate,
                username: this.username,
            };

            try {
                const createdEvent = await EventService.createEvent(newEvent);
                this.events.push({
                    title: createdEvent.title,
                    startTime: createdEvent.startTime,
                    id: createdEvent.id,
                });

                this.calendarOptions.events = [...this.events];
                this.showModal = false;
                this.newEventTitle = "";
            } catch(error) {
                console.error("Error adding event:", error);
            }
        },
    },
};
</script>

<template>
    
    <div class="calendar-container">
        <FullCalendar :options="calendarOptions" />
    </div>

    <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <h2>Add Event</h2>
            <input v-model="newEventTitle" type="text" placeholder="Event Title" />
            <p>Selected Date: {{ selectedDate }}</p>
            <button @click="addEvent">Save</button>
            <button @click="showModal = false">Cancel</button>
        </div>
    </div>

</template>

<style scoped>

.calendar-container {
    padding: 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Modal Styling */
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
    text-align: center;
}

.modal input {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button {
    margin: 5px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:first-of-type {
    background: #e91ea5;
    color: white;
}

button:last-of-type {
    background: #002241;
    color: white;
}

</style>