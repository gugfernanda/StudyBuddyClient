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
                eventClick: this.handleEventClick,
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: 'short'
                }
            },
            eventDetails: {
            title: "",
            description: "",
            start: "",
            end: "",
            visible: false
            },
            newEventTitle: "",
            newEventDescription: "",
            newEventStartDate: "",
            newEventStartTime: "",
            newEventEndDate:"",
            newEventEndTime:"",
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
                if (!this.username) {
                    console.warn("No username found, skipping fetch.");
                    return;
                }

                //console.log("Fetching events for:", this.username); // Debugging

                const eventsFromServer = await EventService.getUserEvents(this.username);
                //console.log("Fetched events:", eventsFromServer); // Debugging

                this.events = eventsFromServer.map(event => ({
                    title: event.title,
                    start: event.startTime ? new Date(event.startTime) : null,
                    end: event.endTime ? new Date(event.endTime) : null, 
                    id: event.id,
                    extendedProps: {
                        description: event.description
                    }
                }));

                this.calendarOptions = {
                    ...this.calendarOptions,
                    events: [...this.events] 
                };

                } catch (error) {
                    console.error("Error fetching events:", error);
                }
        },

        handleDateClick(info) {
            this.selectedDate = info.dateStr;
            this.newEventStartDate = info.dateStr;
            this.newEventStartTime = "09:00";
            this.newEventEndDate = info.dateStr;
            this.newEventEndTime = "10:00";
            this.showModal = true;
        },

        handleEventClick(info) {
            this.eventDetails = {
                title: info.event.title,
                description: info.event.extendedProps?.description || "No description available",
                start: info.event.start ? info.event.start.toLocaleString() : "Unknown",
                end: info.event.end ? info.event.end.toLocaleString() : "Unknown",
                visible: true

            };
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
                description: this.newEventDescription,
                startTime: `${this.newEventStartDate}T${this.newEventStartTime}`,
                endTime: `${this.newEventEndDate}T${this.newEventEndTime}`,
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

    <div v-if="eventDetails.visible" class="modal-overlay">
        <div class="modal">
            <h2>{{ eventDetails.title }}</h2>
            <p><strong>Start:</strong> {{ eventDetails.start }}</p>
            <p><strong>End:</strong> {{ eventDetails.end }}</p>
            <p><strong>Description:</strong> {{ eventDetails.description }}</p>
            <button @click="eventDetails.visible = false">Close</button>
        </div>
    </div>


    <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <h2>Add Event</h2>

            <input v-model="newEventTitle" type="text" placeholder="Event Title" />

            <textarea v-model="newEventDescription" placeholder="Event Description"></textarea>

            <div class="time-picker">
                <label for="start-date">Starts</label>
                <div class="date-time-container">
                    <input type="date" id="start-date" v-model="newEventStartDate"/>
                    <input type="time" v-model="newEventStartTime"/>
                </div>
            </div>

            <div class="time-picker">
                <label for="end-date">Ends</label>
                <div class="date-time-container">
                    <input type="date" id="end-date" v-model="newEventEndDate"/>
                    <input type="time" v-model="newEventEndTime"/>
                </div>
            </div>

            <button class="save-btn" @click="addEvent">Save</button>
            <button class="cancel-btn" @click="showModal = false">Cancel</button>
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
    z-index: 9999;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    z-index: 10000;
}

.modal input {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.time-picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    width: 100%;
}


.time-picker label {
    width: 80px; 
    font-weight: bold;
    text-align: left; 
}

.date-time-container {
    display: flex;
    gap: 10px; 
    flex: 1;
}

.date-time-container label {
    width: 60px;
    font-weight: bold;
}

.date-time-container input{
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

textarea {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    resize: none;
}

.save-btn {
    background: #e91ea5;
    color: white;
    padding: 10px;
    width: 100%;
    margin-top: 10px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
}

.cancel-btn {
    background: #002241;
    color: white;
    padding: 10px;
    width: 100%;
    margin-top: 5px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
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