<script>

export default {
    data() {
        return {
            timeLeft: 25 * 60,
            isRunning: false,
            interval: null,
            session: "pomodoro",
        };
    },

    computed: {
        formattedTime() {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        },
        progress() {
            let totalTime = this.session === "pomodoro" ? 25 * 60 :
                        this.session === "shortBreak" ? 5 * 60 :
                        15 * 60;

            return (this.timeLeft / totalTime) * 283;
        },
    },
    methods: {
        startTimer() {
            if(!this.isRunning) {
                this.isRunning = true;
                this.interval = setInterval(() => {
                    if(this.timeLeft > 0) {
                        this.timeLeft--;
                    } else {
                        this.stopTimer();
                        alert("Pomodoro complete! Time for a break.");
                    }
                }, 1000);
            }
        },

        setSession(sessionType) {
            this.session = sessionType;
            this.isRunning = false;
            clearInterval(this.interval);

            if (sessionType === "pomodoro") {
                this.timeLeft = 25 * 60;
            } else if (sessionType === "shortBreak") {
                this.timeLeft = 5 * 60;
            } else if (sessionType === "longBreak") {
                this.timeLeft = 15 * 60;
            }
            this.progress = 283; 
        },   
        
        pauseTimer() {
            this.isRunning = false;
            clearInterval(this.interval);
        },

        resetTimer() {
            clearInterval(this.interval);
            this.isRunning = false;
            this.setSession(this.session);
        },

        stopTimer() {
            clearInterval(this.interval);
            this.isRunning = false;
        },

        goBack() {
            this.$router.push("/dashboard");
        },
    },
    beforeUnmount() {
        clearInterval(this.interval);
    }
};

</script>

<template>
    <div class="pomodoro-wrapper">
    <div class="pomodoro-container">
        <h1>Pomodoro Timer</h1>

        <div class="session-buttons">
                <button @click="setSession('pomodoro')" :class="{ active: session === 'pomodoro' }">Pomodoro</button>
                <button @click="setSession('shortBreak')" :class="{ active: session === 'shortBreak' }">Short Break</button>
                <button @click="setSession('longBreak')" :class="{ active: session === 'longBreak' }">Long Break</button>
        </div>

        <div class="circle">
            <svg width="200" height="200" viewBox="0 0 100 100">
                <circle 
                    cx="50" cy="50" r="45" stroke="white" stroke-width="5" fill="none" 
                />
                <circle
                    cx="50" cy="50" r="45" stroke="#002241" stroke-width="5" fill="none" 
                    stroke-dasharray="283" :stroke-dashoffset="progress" stroke-linecap="round"
                />
            </svg>
            <div class="timer">{{ formattedTime }}</div>
        </div>
        <div class="controls">
            <button @click="startTimer" v-if="!isRunning">Start</button>
            <button @click="pauseTimer" v-if="isRunning">Pause</button>
            <button @click="resetTimer">Reset</button>
        </div>

        <button class="back-button" @click="goBack">
            <i class="mdi mdi-arrow-left"></i> Back to Dashboard
        </button>

    </div>
</div>
</template>

<style scoped>

.pomodoro-wrapper {
    height: 100%;
    margin: 0;
    padding: 0;
    background: radial-gradient(circle, #1a1a2e, #0f3460, #002241); 
    display: flex;
    justify-content: center;
    align-items: center;
}


.pomodoro-container {
    text-align: center;
    background: #eeeeee;  
    color: #002241;  
    padding: 40px;
    border-radius: 20px;
    width: 450px;
    height: auto; 
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); 
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    border: 1px solid #e0e0e0; 
}

h1 {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 15px; 
    margin-top: -20px; 
}


.title {
    margin-top: -10px;
    font-size: 24px;
    font-weight: bold;
}

.session-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: -10px;
}

.session-buttons button {
    padding: 6px 12px;
    border: none;
    cursor: pointer;
    background-color: #ddd;
    color: #002241;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
    transition: 0.3s;
    width: auto;
    min-width: 80px;
}

.session-buttons button.active {
    background-color: #002241;
    color: white;
}

.session-buttons button:hover {
    background-color: #d81b80;
    color: white;
}


.pomodoro-title {
    font-size: 25px;
    font-weight: bold;
}

.circle {
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.timer {
    position: absolute;
    font-size: 28px;
    font-weight: bold;
    color: #002241;
}

.controls {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 15px; 
}



.controls button, .back-button {
  width: 100%;
  padding: 16px;
  border: none;
  cursor: pointer;
  background-color: #e91ea5;
  color: white;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 10px rgba(233, 30, 165, 0.3);
}

.controls button:hover, .back-button:hover {
  background-color: #d81b80;
  transform: scale(1.05);
}


.controls button:hover, .back-button:hover {
  background-color: #d81b80;
  transform: scale(1.05);
}

.back-button {
    margin-top: 10px;
    background-color: #e91ea5; 
}

.back-button:hover {
    background-color: #d81b80;
}


</style>