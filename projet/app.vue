<template>
  <div>
    <div v-for="(data, raceId) in raceData" :key="raceId" class="chart-container">
      <h2>Race ID: {{ raceId }}</h2>
      <canvas :id="'chart-' + raceId"></canvas>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  setup() {
    const raceData = ref({})

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/stats_every_5_seconds')
        const data = await response.json()

        // Transform the data to group by race_id
        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.race_id]) {
            acc[item.race_id] = { labels: [], data: [] }
          }
          acc[item.race_id].labels.push(new Date(item.date).toLocaleTimeString())
          acc[item.race_id].data.push(item.speed)
          return acc
        }, {})

        raceData.value = groupedData

        // Ensure DOM is updated before rendering charts
        await nextTick()
        renderCharts()
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const renderCharts = () => {
      Object.keys(raceData.value).forEach(raceId => {
        const ctx = document.getElementById('chart-' + raceId).getContext('2d')
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: raceData.value[raceId].labels,
            datasets: [{
              label: `Speed for Race ${raceId}`,
              data: raceData.value[raceId].data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Time'
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 20
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Speed'
                },
                suggestedMin: 0
              }
            }
          }
        })
      })
    }

    onMounted(fetchData)

    return { raceData }
  }
}
</script>

<style scoped>
.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 20px;
}

.chart-container {
  width: 400px;
  height: 250px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  position: relative;
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.chart-title {
  text-align: center;
  margin: 0;
  padding: 10px;
  font-size: 16px;
  color: #333;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
}

canvas {
  width: 100% !important;
  height: auto !important;
}
</style>
