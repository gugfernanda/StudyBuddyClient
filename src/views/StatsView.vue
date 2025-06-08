<script>
import { watch } from "vue";
import SidebarDashboard from "../components/SidebarDashboard.vue";
import NavBar from "../components/NavBar.vue";
import StatsService from "../services/StatsService";
import AuthService from "../services/AuthService";
import { translations } from "../translations.js";
import { useLanguage } from "../language.js";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default {
  name: "StatsView",
  components: { SidebarDashboard, NavBar },
  data() {
    return {
      currentSection: "stats",
      loading: true,
      errorMessage: "",
      statsData: null,          
      monthlyStatsData: null,   
      chartInstance: null,
      monthlyChartInstance: null,
    };
  },
  computed: {
    t() {
      return translations[useLanguage().lang.value];
    },
    currentLang() {
      return useLanguage().lang.value;
    }
  },
  methods: {
    changeSection(section) {
      if (section === "tasks" || section === "calendar") {
        this.$router.push({
          path: "/dashboard",
          query: { section: section }
        });
      } else if(section === "pomodoro") {
        this.$router.push("/pomodoro")
      }
    },

    renderChart() {
      if (!this.statsData || !this.statsData.completedStats) return;

      const canvasEl = document.getElementById("weeklyChart");
      if (!canvasEl) return;

      const ctx = canvasEl.getContext("2d");
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const labels = this.statsData.completedStats.map(e => {
        const dateObj = new Date(e.date);
        const locale = this.currentLang === 'ro' ? 'ro-RO' : 'en-US';
        return dateObj.toLocaleDateString(locale, {
          day: '2-digit',
          month: 'short'
        });
      });


      const dataPoints = this.statsData.completedStats.map(e => e.count);

      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: this.t.completedTasksPerDay,
            data: dataPoints,
            backgroundColor: "#e91ea5",
            borderColor: "#c2185b",
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2,
          scales: {
            x: { 
              grid: {
                color: "#e0e0e0"
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 7
              },
              title: { 
                display: true, 
                text: this.t.day, 
                font: { size: 14 }
              } 
            },
            y: { 
              grid: {
                color: "#e0e0e0"
              },
              ticks: {
                precision: 0,
                stepSize: 1,
                font: { size: 12 }
              },
              beginAtZero: true, 
              title: { 
                display: true, 
                text: this.t.tasksCount,
                font: { size: 14 }
              } 
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} ${this.t.tasks}` } }
          }
        },
        elements: {
          bar: {
            borderRadius: 6,
            barThickness: "flex",
            maxBarThickness: 35,
            categoryPercentage: 0.6,
            barPercentage: 0.7
          }
        }
      });
    },

    renderMonthlyChart() {
      if (!this.monthlyStatsData || !this.monthlyStatsData.completedStats) return;
      const canvasEl2 = document.getElementById("monthlyChart");
      if (!canvasEl2) return;

      const ctx2 = canvasEl2.getContext("2d");
      if (this.monthlyChartInstance) {
        this.monthlyChartInstance.destroy();
      }

      const locale = this.currentLang === 'ro' ? 'ro-RO' : 'en-US';
        const labels2 = this.monthlyStatsData.completedStats.map(e => {
          const dateObj = new Date(e.date);
          return dateObj.toLocaleDateString(locale, { month: "long" });
        });

      const dataPoints2 = this.monthlyStatsData.completedStats.map(e => e.count);

      this.monthlyChartInstance = new Chart(ctx2, {
        type: "bar",
        data: {
          labels: labels2,
          datasets: [{
            label: this.t.completedTasksPerDayMonthly,
            data: dataPoints2,
            backgroundColor: "#002241",
            borderColor: "#00172e",
            borderWidth: 1,
            //barpercentage: 0.8,
            //categoryPercentage: 0.9,
          },
        ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,  
          aspectRatio: 2,
          scales: {
            x: { 
              grid: {
                color: "#e0e0e0"
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 7
              },
              title: { 
                display: true, 
                text: this.t.month, 
                font: { size: 14 }
              } 
            },
            y: { 
              grid: {
                color: "#e0e0e0"
              },
              ticks: {
                precision: 0,
                stepSize: 1,
                font: { size: 12 }
              },
              beginAtZero: true, 
              title: { 
                display: true, 
                text: this.t.tasksCount,
                font: { size: 14 }
              } 
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} ${this.t.tasks}` } }
          }
        },
        elements: {
          bar: {
            borderRadius: 6,
            barThickness: "flex",
            maxBarThickness: 35,
            categoryPercentage: 0.6,
            barPercentage: 0.7
          }
        }
      });
    },
  },

  async created() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.username) {
        this.errorMessage = this.t.notLoggedIn;
        this.loading = false;
        return;
      }
      const fullUser = await AuthService.getUserByUsername(user.username);
      const userId = fullUser.id;
      if (!userId) {
        throw new Error("Nu s-a putut determina ID-ul utilizatorului");
      }

      this.statsData = await StatsService.getWeeklyStats(userId);
      this.monthlyStatsData = await StatsService.getMonthlyStats(userId);
      this.errorMessage = "";
    } catch (err) {
      console.error("Error fetching stats:", err);
      this.errorMessage = this.t.errorLoadStats;
    } finally {
      this.loading = false;
    }
  },

  mounted() {
    watch(
      () => [this.statsData, this.loading],
      ([newStats, newLoading]) => {
        if (newStats && newLoading === false) {
          this.$nextTick(() => {
            this.renderChart();
          });
        }
      }
    );
    watch(
      () => [this.monthlyStatsData, this.loading],
      ([newMonthly, newLoading]) => {
        if (newMonthly && newLoading === false) {
          this.$nextTick(() => {
            this.renderMonthlyChart();
          });
        }
      }
    );
    watch(
      () => this.currentLang,
      () => {
        this.$nextTick(() => {
          this.renderChart();
          this.renderMonthlyChart();
        });
      }
    );

  },

  beforeUnmount() {
    if (this.chartInstance) this.chartInstance.destroy();
    if (this.monthlyChartInstance) this.monthlyChartInstance.destroy();
  },
};
</script>

<template>
  <div class="dashboard-container">
    <SidebarDashboard 
      :currentSection="currentSection"
      @sectionChanged="changeSection"
     />

    <div class="main-content">
      <NavBar />

      <div class="dashboard-content stats-content">
        <div class="header">
          <h1>{{ t.statsTitle }}</h1>
        </div>

        <p v-if="loading">{{ t.loadingStats }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div v-if="!loading && !errorMessage" class="chart-container">
          <div class="summary-cards">
            <div class="card">
              <h2>{{ t.completedThisWeek }}</h2>
              <p>{{ statsData.totalCompleted }}</p>
            </div>
            <div class="card">
              <h2>{{ t.overdueToday }}</h2>
              <p>{{ statsData.overdueToday }}</p>
            </div>
          </div>

          <div class="two-charts-wrapper">
            <div class="chart-box">
              <h3>{{ t.completedTasksPerDay }}</h3>
              <canvas id="weeklyChart"></canvas>
            </div>
            <div class="chart-box">
              <h3>{{ t.completedTasksPerDayMonthly }}</h3>
              <canvas id="monthlyChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}
.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f4f4f4;
  overflow-y: auto;
}
.dashboard-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 19px;
}
.header h1 {
  color: #002241;
  margin-bottom: 0.75rem;
  font-size: 28px;
}
.error {
  color: red;
  font-weight: bold;
  margin-bottom: 12px;
}

.chart-container {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  max-width: 85vw;       
  margin: 0 auto;
}

.two-charts-wrapper {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
}

.chart-box {
  flex: 0 1 45%;
  min-width: 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  box-sizing: border-box;
}
.chart-box h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.chart-box canvas {
  width: 100% !important;
  height: 300px !important;
  margin-bottom: 4px;
}

.summary-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.card {
  flex: 1;
  background: #e91ea5;
  color: white;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  min-width: 0;
}
.card h2 {
  font-size: 14px;
  margin-bottom: 4px;
}
.card p {
  font-size: 20px;
  margin: 0;
  line-height: 1.2;
}
</style>
