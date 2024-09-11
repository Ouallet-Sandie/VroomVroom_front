<template>
  <div>
    <h2>Données de la course</h2>
    <p>Vitesse : {{ speed }} km/h</p>
    <p>Distance : {{ distance }} m</p>
    <p>Batterie : {{ battery }} %</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'RaceData',
  setup() {
    const speed = ref<number>(0)
    const distance = ref<number>(0)
    const battery = ref<number>(0)

    onMounted(() => {
      console.log('Tentative de connexion au WebSocket backend...')

      // Connexion au serveur WebSocket
      const ws = new WebSocket('ws://localhost:8080')

      ws.onopen = () => {
        console.log('Connexion WebSocket établie avec succès.')
      }

      ws.onmessage = (event) => {
        console.log('Message WebSocket brut:', event.data)  // Affiche le message brut reçu

        try {
          const data = JSON.parse(event.data)
          console.log('Message WebSocket traité:', data)

          // Mise à jour des données en fonction du topic
          switch (data.topic) {
            case 'esp32/speed':
              speed.value = parseFloat(data.message)
              break
            case 'esp32/distance':
              distance.value = parseFloat(data.message)
              break
            case 'esp32/battery':
              battery.value = parseFloat(data.message)
              break
          }
        } catch (err) {
          console.error('Erreur lors du traitement du message WebSocket:', err)
        }
      }

      ws.onerror = (err) => {
        console.error('Erreur WebSocket:', err)
      }

      ws.onclose = () => {
        console.log('Connexion WebSocket fermée.')
      }
    })

    return {
      speed,
      distance,
      battery,
    }
  },
})
</script>