<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventService from '../services/EventService.js';
import AuthService from '../services/AuthService.js';
import ScheduleImport from '../services/ScheduleImport.js';
import { translations } from "../translations.js";
import { useLanguage } from "../language.js";

const { lang } = useLanguage();

export default {
    name: "CalendarView",
    components: {
        FullCalendar,
    },

    data() {
        return {
            username: "",
            events: [],
            calendarOptions: {},
            eventDetails: {
            title: "",
            description: "",
            start: "",
            end: "",
            scheduleLabel: "",
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
            showImportModal: false,
            showLabelTip: false,
            importDto: {
                title: '',
                description: '',
                dayOfWeek: 'MONDAY',
                startTime: '08:00',
                endTime: '09:00',
                scheduleLabel: '',
                startDate: '',
                repeatUntil: ''
            },
            toggleDropdown: false,
            importUrl: "",
            importSheet: "",
            importGroup: "",
            importSeries: "",
            importStart: "",
            importEnd: "",
            importTab: 'manual',
            showDeleteModal: false,
            deleteLabel: '',
        };
    },
    computed: {
        t() {
            return translations[lang.value];
        }
    },

    async created() {
        this.calendarOptions = {
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
            },
            
        };
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
                const eventsFromServer = await EventService.getUserEvents(this.username);
                const plainEvents = eventsFromServer.map(event => ({
                  title: event.title,
                  start: event.startTime,
                  end: event.endTime,
                  id: event.id,
                  extendedProps: {
                    description: event.description,
                    scheduleLabel: event.scheduleLabel
                  }
                }));

                this.calendarOptions.events = plainEvents;
                this.events = plainEvents;

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
                scheduleLabel: info.event.extendedProps?.scheduleLabel || '',
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

            const formatDateTime = (dateString) => {
                //console.log("Original date value:", dateString); 

                if (!dateString || dateString === "Unknown" || dateString === undefined) return "";

                try {
                    const dateParts = dateString.split(", ")[0].split("/"); 
                    const timePart = dateString.split(", ")[1];

                    if (dateParts.length !== 3 || !timePart) {
                        console.error("Invalid date format:", dateString);
                        return "";
                    }

                    const formattedDateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timePart}`;

                    //console.log("Formatted date string:", formattedDateString);

                    const d = new Date(formattedDateString);

                    if (isNaN(d.getTime())) {
                        console.error("Invalid date:", formattedDateString);
                        return "";
                    }
                    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
                    
                    return localDate.toISOString().slice(0, 16);
                } catch (error) {
                    console.error("Error formatting date:", error);
                    return "";
                }
            };

            this.editedEvent = {
                id: this.eventDetails.id,
                title: this.eventDetails.title || "",
                description: this.eventDetails.description || "",
                startTime: formatDateTime(this.eventDetails.start),
                endTime: formatDateTime(this.eventDetails.end)
            };

            //console.log("Formatted event:", this.editedEvent);

            this.showEditModal = true;
            this.eventDetails.visible = false;
        },

        async handleDeleteEvent(eventId) {
            if(!confirm("Are you sure you want to delete this event?")) return;

            try {
                await EventService.deleteEvent(eventId);
                this.events = this.events.filter(event => event.id !== eventId);
                this.calendarOptions.events = [...this.events];
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
                    extendedProps: { 
                      description: createdEvent.description,
                      scheduleLabel: createdEvent.scheduleLabel
                     }
                });

                this.calendarOptions.events = [...this.events];
                this.showModal = false;
                this.newEventTitle = "";
                this.newEventDescription = "";
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

                    this.calendarOptions.events =[...this.events];
                    this.showEditModal = false;
                } catch(error) {
                    console.error("Error updating event:", error);
                }
        
        },

        async importManualSchedule() {
            try {
                await ScheduleImport.importManualSchedule(this.importDto)
                this.showImportModal = false
                Object.assign(this.importDto, {
                    title: '',
                    description: '',
                    dayOfWeek: 'MONDAY',
                    startTime: '08:00',
                    endTime: '09:00',
                    scheduleLabel: '',
                    startDate: '',
                    repeatUntil: ''
                })
                await this.fetchEvents()
                alert(this.t.importSuccess)
            } catch {
                alert(this.t.importFail)
            }
        },

        async importScheduleByUrl() {
            try {
                const payload = {
                    url: this.importUrl,
                    sheetName: this.importSheet,
                    groupName: this.importGroup,
                    series: this.importSeries || null,
                    startDate: this.importStart,
                    endDate: this.importEnd
                };

                await ScheduleImport.importScheduleByUrl(payload);

                this.showImportModal = false;
                this.toggleDropdown = false;

                this.importUrl = "";
                this.importSheet = "";
                this.importGroup = "";
                this.importSeries = "";
                this.importStart = "";
                this.importEnd = "";

                await this.fetchEvents();
                alert(this.t.importSuccess);
            } catch(e) {
                alert(this.t.importFail);
                console.error("Import by URL failed:", e);
            }
        },

        closeImportModal() {
            this.showImportModal = false;
            this.importTab = 'manual';
            Object.assign(this.importDto, {
                title: '', description:'', startTime: '08:00', endTime: '09:00',
                scheduleLabel: '', startDate: '', repeatUntil: ''
            })
            this.importUrl = this.importSheet = this.importGroup = this.importSeries = '';
            this.importStart = this.importEnd = '';  
        },

        async deleteScheduleByLabel() {
            if(!this.deleteLabel.trim()) {
                alert(this.t.labelEmpty || 'Label required!');
                return;
            }

            if(!confirm(this.t.confirmDelete || 'Sigur ștergi?')) return;

            try {
                await ScheduleImport.deleteManualSchedule(this.deleteLabel);
                this.showDeleteModal = false;
                this.deleteLabel = '';
                await this.fetchEvents();
                alert(this.t.deleteSuccess || 'Orar șters cu succes!');
            } catch(e) {
                alert(this.t.deleteFail || 'Eroare la ștergere!');
                console.error(e);
            }
        },

        closeDeleteModal() {
            this.showDeleteModal = false;
            this.deleteLabel = '';
        }
    },
};
</script>

<template>
  <div class="calendar-view">

 
    <div class="import-header">
      <div class="relative inline-block text-left">
        <button class="save-btn" @click="toggleDropdown = !toggleDropdown">
          {{ t.addSchedule }}
          <span class="arrow" :class="{ rotate180: toggleDropdown }">▼</span>
        </button>

        <div v-if="toggleDropdown" class="dropdown-box">
          <button class="dropdown-option"
                  @click="showImportModal = true; importTab = 'manual'; toggleDropdown = false">
            + {{ t.addManually }}
          </button>
          <button class="dropdown-option"
                  @click="showImportModal = true; importTab = 'url'; toggleDropdown = false">
            ⇪ {{ t.importFromUrl }}
          </button>

          <button class="dropdown-option"
                @click="showDeleteModal = true; toggleDropdown = false">
            <i class="mdi mdi-trash-can-outline" style="margin-right:6px"></i> <!-- iconă -->
            {{ t.deleteByLabel }}
        </button>
          
        </div>
      </div>
    </div>

    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>


    <div v-if="eventDetails.visible" class="modal-overlay">
      <div class="modal">
        <button class="delete-btn" @click="handleDeleteEvent(eventDetails.id)">
          <i class="mdi mdi-trash-can-outline" />
        </button>

        <div class="modal-header">
          <h2 class="modal-title">{{ eventDetails.title }}</h2>
        </div>

        <p><strong>{{ t.start }}:</strong> {{ eventDetails.start }}</p>
        <p><strong>{{ t.end   }}:</strong> {{ eventDetails.end   }}</p>
        <p><strong>{{ t.description }}:</strong> {{ eventDetails.description }}</p>
        <p v-if="eventDetails.scheduleLabel">
          <strong>{{ t.scheduleLabel }}:</strong>
          {{ eventDetails.scheduleLabel }}
        </p>

        <div class="button-container">
          <button class="edit-btn"  @click="openEditModal">{{ t.edit }}</button>
          <button class="close-btn" @click="eventDetails.visible = false">{{ t.cancel }}</button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ t.edit }}</h2>

        <input v-model="editedEvent.title"       type="text" placeholder="Event Title" />
        <textarea v-model="editedEvent.description" placeholder="Event Description" />

        <div class="time-picker">
          <label>{{ t.start }}</label>
          <input type="datetime-local" v-model="editedEvent.startTime" />
        </div>

        <div class="time-picker">
          <label>{{ t.end }}</label>
          <input type="datetime-local" v-model="editedEvent.endTime" />
        </div>

        <button class="save-btn"   @click="updateEvent">{{ t.save   }}</button>
        <button class="cancel-btn" @click="showEditModal = false">{{ t.cancel }}</button>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay"> 
        <div class="modal" style="width:320px">           
            <h2>{{ t.deleteByLabel }}</h2> 

            <input v-model="deleteLabel"                  
                    type="text"
                    :placeholder="t.scheduleLabel"/>

            <button class="save-btn" @click="deleteScheduleByLabel"> 
                {{ t.delete || 'Șterge' }}
            </button>
            <button class="cancel-btn" @click="closeDeleteModal">    
                {{ t.cancel }}
            </button>
        </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ t.addEvent }}</h2>

        <input    v-model="newEventTitle"       type="text" placeholder="Event Title" />
        <textarea v-model="newEventDescription"             placeholder="Event Description" />

        <div class="time-picker">
          <label>{{ t.start }}</label>
          <input type="date" v-model="newEventStartDate" />
          <input type="time" v-model="newEventStartTime" />
        </div>

        <div class="time-picker">
          <label>{{ t.end }}</label>
          <input type="date" v-model="newEventEndDate" />
          <input type="time" v-model="newEventEndTime" />
        </div>

        <button class="save-btn"   @click="addEvent">{{ t.save   }}</button>
        <button class="cancel-btn" @click="showModal = false">{{ t.cancel }}</button>
      </div>
    </div>

    <div v-if="showImportModal" class="modal-overlay import-modal-overlay">
      <div class="modal import-modal">


        <div class="tab-header">
          <button :class="{ active: importTab === 'manual' }"
                  @click="importTab = 'manual'">
            {{ t.addManualSchedule }}
          </button>
          <button :class="{ active: importTab === 'url' }"
                  @click="importTab = 'url'">
            {{ t.importFromUrl }}
          </button>
        </div>

        <div v-show="importTab === 'manual'">

          <input v-model="importDto.title"       type="text"    :placeholder="t.title" />
          <textarea v-model="importDto.description"             :placeholder="t.description" />

          <div class="form-row-inline">
            <label>{{ t.dayOfWeek }}</label>
            <select v-model="importDto.dayOfWeek" class="form-input">
              <option v-for="d in ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']"
                      :key="d" :value="d">
                {{ t.days[d.toLowerCase()] }}
              </option>
            </select>
          </div>

          <div class="time-picker">
            <label>{{ t.start }}</label>
            <input type="time" v-model="importDto.startTime" />
          </div>
          <div class="time-picker">
            <label>{{ t.end }}</label>
            <input type="time" v-model="importDto.endTime" />
          </div>

          <div class="schedule-label-container">
            <input v-model="importDto.scheduleLabel"
                   type="text"  :placeholder="t.scheduleLabel"
                   class="form-control" />
            <span class="help-icon">?</span>
            <div class="tooltip-box">{{ t.scheduleLabelHelp }}</div>
          </div>

          <div class="form-row">
            <label>{{ t.startDate }}</label>
            <input type="date" v-model="importDto.startDate" class="date-input" />
          </div>
          <div class="form-row">
            <label>{{ t.repeatUntil }}</label>
            <input type="date" v-model="importDto.repeatUntil" class="date-input" />
          </div>

          <button class="save-btn" @click="importManualSchedule">
            {{ t.import }}
          </button>
        </div>


        <div v-show="importTab === 'url'">
          <input v-model="importUrl"    type="text" :placeholder=t.googleSheetsUrl />
          <input v-model="importSheet"  type="text" :placeholder=t.sheetName />
          <input v-model="importGroup"  type="text" :placeholder=t.group />
          <input v-model="importSeries" type="text" :placeholder=t.series />

          <div class="form-row">
            <label>{{ t.startDate }}</label>
            <input type="date" v-model="importStart" class="date-input" />
          </div>
          <div class="form-row">
            <label>{{ t.repeatUntil }}</label>
            <input type="date" v-model="importEnd" class="date-input" />
          </div>

          <button class="save-btn" @click="importScheduleByUrl">
            {{ t.importUrl }}
          </button>
        </div>

        <button class="cancel-btn" @click="closeImportModal">
          {{ t.cancel }}
        </button>
      </div>
    </div>
  </div>
</template>



<style scoped>

.arrow {
  display:inline-block;       
  transition:transform .25s;    
}

.rotate180 {  
    transform:rotate(180deg);
}

.dropdown-box {
  position: absolute;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 1000;
  width: 200px;
}

.tab-header {
  display: flex;
  justify-content: center; 
  gap: .5rem; 
  margin-bottom: 1rem;
}

.tab-header button {
  flex: 1;
  padding:8px 0; 
  background: #eee; 
  border: none; 
  cursor: pointer;
  font-weight: 600; 
  border-radius: 6px 6px 0 0;
}

.tab-header button.active {
    background:#e91ea5; 
    color:#fff;
}


.dropdown-option {
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  background: white;
  color: #002241;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.dropdown-option:hover {
  background-color: #f3f3f3;
}


.form-row-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row-inline label {
  flex: 0 0 auto;
  white-space: nowrap;
  font-weight: bold;
}

.form-row-inline .form-input {
    flex: 1;
    max-width: 200px;    
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #002241;
}


.form-row {
  display: grid;
  grid-template-columns: 180px 1fr; 
  align-items: center;
  margin-bottom: 1rem;
}

.form-row label {
  flex: 0 0 auto;         
  font-weight: bold;
  color: #002241;
  margin-right: 1rem;
  white-space: nowrap;
}

.form-row .date-input {
  flex: 1;                 
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}


.schedule-label-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
}

.schedule-label-container .form-control {
  flex: 1;
}

.schedule-label-container .help-icon {
  width: 2rem;
  height: 2rem;
  background-color: #e91ea5; 
  color: white;
  border: none;
  border-radius: 0.25rem;      
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.schedule-label-container .tooltip-box {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  color: #002241;
  padding: 0.75rem;
  border: 1px solid #e91ea5;
  border-radius: 0.25rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  white-space: normal;
  width: 200px;
  margin-top: 0.5rem;
  z-index: 10;
  display: none;
}

.schedule-label-container .help-icon:hover + .tooltip-box {
  display: block;
}


.import-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1em;
}

.import-header .save-btn {
  background-color: #e91ea5;       
  color: white;
  width: auto !important;          
  padding: 6px 12px !important;    
  font-size: 1rem !important;      
  border-radius: 0.375rem !important;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.import-header .save-btn:hover {
  background-color: #c2185b;
}


.import-modal-overlay {
  display: flex !important;
  justify-content: center;
  align-items: flex-start;
  padding-top: 0rem;
  background: rgba(0,0,0,0.5);

}

.modal {
    position: relative;
    background: white;
    padding: 20px;
    width: 350px;
    border-radius: 10px;
    text-align: center;
}


.import-modal {
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 400px;
  box-sizing: border-box;
}




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
    margin-bottom: 5px;
    width: 100%;
}

.time-picker label {
    width: 80px; 
    font-weight: bold;
    text-align: left; 
}

.date-time-container {
    display: flex;
    gap: 8px; 
    flex: 1;
}

.date-time-container input {
    flex: 1;
    padding: 5px;
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
