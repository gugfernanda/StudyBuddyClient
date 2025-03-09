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
            showEditModal: false,
            editedEvent: {
                id: null,
                title: "",
                description: "",
                startTime: "",
                endTime: ""
            },
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
            //console.log("Clicked event:", info.event);
            this.eventDetails = {
                id: info.event.id || null,
                title: info.event.title,
                description: info.event.extendedProps?.description || "No description available",
                start: info.event.start ? info.event.start.toLocaleString() : "Unknown",
                end: info.event.end ? info.event.end.toLocaleString() : "Unknown",
                visible: true

            };
        },

        openEditModal() {

            if (!this.eventDetails.id) {
                console.error("No event selected for editing.");
                return;
            }

            //console.log("Editing event:", this.eventDetails);

            const formatDateTime = (date) => {
                if (!date || date === "Unknown") return "";
                const d = new Date(date);
                if (isNaN(d.getTime())) return "";
                return d.toISOString().slice(0, 16);
            };

            this.editedEvent = {
                id: this.eventDetails.id,
                title: this.eventDetails.title || "",
                description: this.eventDetails.description || "",
                startTime: formatDateTime(this.eventDetails.start),
                endTime: formatDateTime(this.eventDetails.end)
            };

            this.showEditModal = true;
            this.eventDetails.visible = false;
        },

        async handleDeleteEvent(eventId) {
            if(!confirm("Are you sure you want to delete this event?")) return;

            try {
                await EventService.deleteEvent(eventId);
                this.events = this.events.filter(event => event.id !== eventId);
                this.calendarOptions.events = { ...this.calendarOptions, events: [...this.events] };
                this.eventDetails.visible = false;
            } catch(error) {
                console.error("Error deleting event:", error);
            }
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
                    start: new Date(createdEvent.startTime),
                    end: new Date(createdEvent.endTime),
                    id: createdEvent.id,
                    extendedProps: { description: createdEvent.description }
                });

                this.calendarOptions.events = {...this.calendarOptions, events: [...this.events]};
                this.showModal = false;
                this.newEventTitle = "";
            } catch(error) {
                console.error("Error adding event:", error);
            }
        },

        async updateEvent() {
            try {
                if (!this.editedEvent.id) {
                    console.error("No event ID found for update.");
                    return;
                }

                const updatedEvent = await EventService.updateEvent(this.editedEvent.id, {
                    title: this.editedEvent.title,
                    description: this.editedEvent.description,
                    startTime: this.editedEvent.startTime,
                    endTime: this.editedEvent.endTime
                });

                if (!updatedEvent || !updatedEvent.id) {
                    console.error("Update failed, no event data received.");
                    return;
                }

                const index = this.events.findIndex(event =>event.id === updatedEvent.id);
                if(index !== -1) {
                    this.events[index] = {
                            ...this.events[index],
                            title: updatedEvent.title,
                            start: updatedEvent.startTime,
                            end: updatedEvent.endTime,
                            extendedProps: { description: updatedEvent.description }
                        };
                    }

                    this.calendarOptions.events = {...this.calendarOptions, events: [...this.events]};
                    this.showEditModal = false;
                } catch(error) {
                    console.error("Error updating event:", error);
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
            <button class="delete-btn" @click="handleDeleteEvent(eventDetails.id)">
                    <i class="mdi mdi-trash-can-outline"></i>
            </button>
            <div class="modal-header">
                <h2 class="modal-title">{{ eventDetails.title }}</h2>
                <!-- <button class="delete-btn" @click="handleDeleteEvent(eventDetails.id)">
                    <i class="mdi mdi-trash-can-outline"></i>
                </button> -->
                
            </div>
                
            
            <p><strong>Start:</strong> {{ eventDetails.start }}</p>
            <p><strong>End:</strong> {{ eventDetails.end }}</p>
            <p><strong>Description:</strong> {{ eventDetails.description }}</p>
            <div class="button-container">
                <button class="edit-btn" @click="openEditModal">Edit</button>
                <button class="close-btn" @click="eventDetails.visible = false">Close</button>
            </div>


        </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay">
        <div class="modal">
            <h2>Edit Event</h2>

            <input v-model="editedEvent.title" type="text" placeholder="Event Title" />
            <textarea v-model="editedEvent.description" placeholder="Event Description"></textarea>

            <div class="time-picker">
                <label for="edit-start">Starts</label>
                <div class="date-time-container">
                    <input type="datetime-local" id="edit-start" v-model="editedEvent.startTime" />
                </div>
            </div>

            <div class="time-picker">
                <label for="edit-end">Ends</label>
                <div class="date-time-container">
                    <input type="datetime-local" id="edit-end" v-model="editedEvent.endTime" />
                </div>
            </div>

            <button class="save-btn" @click="updateEvent">Save Changes</button>
            <button class="cancel-btn" @click="showEditModal = false">Cancel</button>
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

.edit-btn {
    background: #e91ea5;
    color: white;
}

.edit-btn:hover {
    background: #c2185b;
}

.close-btn {
    background: #002241;
    color: white;
}

.close-btn:hover {
    background: #004080;
}

.calendar-container {
    padding: 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

:deep(.fc-daygrid-day-number) {
    color: #002241 !important;
    font-weight: bold;
}

:deep(.fc-col-header-cell a) {
    color: #002241 !important;
    font-weight: bold;
}

:deep(.fc-col-header-cell:first-child a), 
:deep(.fc-col-header-cell:last-child a) { 
    color: #e91ea5 !important;
}


:deep(.fc-day-today) {
    background-color: #d3e9fc !important; 
    border: 2px solid #002241 !important; 
}


:deep(.fc-event) {
    background-color: #e91ea5 !important;
    border-color: #e91ea5 !important;
    color: white !important;
    border-radius: 5px;
    padding: 3px;
}


:deep(.fc-daygrid-event-dot) {
    background-color: #ffcc00 !important; 
    width: 8px !important;
    height: 8px !important;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
    border:#ffcc00;
}


:deep(.fc-button.fc-today-button) {
    background-color: #e91ea5 !important; 
    color: white !important; 
    border-radius: 8px !important; 
    padding: 6px 12px !important;
    font-weight: bold !important;
    border: none !important;
}

:deep(.fc-button.fc-today-button:hover) {
    background-color: #c2185b !important; 
}


:deep(.fc-button.fc-prev-button), 
:deep(.fc-button.fc-next-button) {
    background-color: #002241 !important;
    color: white !important;
    border-radius: 50% !important;
    width: 40px !important;
    height: 40px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none !important;
    font-size: 18px !important; 
    transition: all 0.2s ease-in-out;
}

:deep(.fc-button-group) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px; 
    margin-top: 5px; 
}

:deep(.fc-button.fc-prev-button:hover), 
:deep(.fc-button.fc-next-button:hover) {
    background-color: #004080 !important;
    transform: scale(1.1);
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


.modal input, textarea {
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

.date-time-container input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
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

.button-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
}

.button-container button {
    flex: 1;
    max-width: 150px;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
}

.modal {
    position: relative;
    background: white;
    padding: 20px;
    width: 350px;
    border-radius: 10px;
    text-align: center;
}



.modal-header {
    display: flex;
    justify-content: center;
    align-items:  center;
    position: relative;
    padding: 10px;
    width: 100%;
}

.delete-btn {
    position: absolute;
    top: -10px;
    /* right: 100px; */
    left: 145px;
    background: none;
    border: none;
    font-size: 23px;
    cursor: pointer;
    color: #d9534f;
    transition: color 0.2s ease-in-out;
    z-index: 10;
}

.delete-btn:hover {
    color: #c9302c;
}

.modal-title {
    font-size: 22px;
    font-weight: bold;
    flex-grow: 1;
    text-align: center;
}

</style>
