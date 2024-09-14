<script>
import { onMounted, ref, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  setup() {
    const raceData = ref({})
    const stats = ref({})

    const fetchData = async () => {
      try {
        const [dataResponse, statsResponse] = await Promise.all([
          fetch('/stats_every_5_seconds'), // Utilise le proxy pour cette route
          fetch('/get_stats_races') // Utilise le proxy pour cette route
        ])

        const data = await dataResponse.json()
        const statsData = await statsResponse.json()

        // Transform the data to group by race_id
        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.race_id]) {
            acc[item.race_id] = { labels: [], data: [] }
          }
          acc[item.race_id].labels.push(new Date(item.date).toLocaleTimeString())
          acc[item.race_id].data.push(item.speed)
          return acc
        }, {})

        // Store the statistics by race_id
        const statsByRaceId = statsData.reduce((acc, item) => {
          acc[item.sensor_data_race_id] = item
          return acc
        }, {})

        raceData.value = groupedData
        stats.value = statsByRaceId

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

    return { raceData, stats }
  }
}
</script>