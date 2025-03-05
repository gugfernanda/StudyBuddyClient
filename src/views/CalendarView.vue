<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default {
    name: "CalendarView",
    components: {
        FullCalendar,
    },

    data() {
        return {
            calendarOptions: {
                plugins: [dayGridPlugin, interactionPlugin],
                initialView: 'dayGridMonth',
                selectable: true,
                editable: true,
                events: [
                    { title: 'Exam Math', start: '2025-03-10' },
                    { title: 'Project Deadline', start: '2025-03-15' },
                ],
                dateClick: this.handleDateClick,
            },
        };
    },
    mounted() {
        console.log("CalendarView component loaded!"); 
    },
    methods: {
        handleDateClick(info) {
            alert('Clicked on: ' + info.dateStr);
        },
    },
};
</script>

<template>
    
    <div class="calendar-container">
        <FullCalendar :options="calendarOptions"/>
    </div>

</template>

<style scoped>

.calendar-container {
    padding: 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

div[style*="display: none"] {
    display: block !important;
}

</style>