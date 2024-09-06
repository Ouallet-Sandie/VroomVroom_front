<template>
    <div class="my-10">
      <div class="flex justify-center">
        <div>
          <p class="font-bold text-4xl">Résumé de course <span id="raceID">{{ raceID }}</span></p>
        </div>
      </div>
      <div class="flex justify-center">
        <p class="text-lg mt-3" id="dateRace">{{ formattedDateCourse }}</p>
      </div>
    </div>
  
    <div class="flex flex-row place-content-around ms-20">
      <Ucard>
        <p class="my-5">Durée de la course : <span id="duree" class="font-bold">{{ formattedDuree }}</span></p>
        <p class="my-5">Vitesse min : <span id="vitesseMin" class="font-bold" style="color:green">{{ vitesseMin }} km/h</span></p>
        <p class="my-5">Vitesse max : <span id="vitesseMax" class="font-bold" style="color:red">{{ vitesseMax }} km/h</span></p>
        <p class="my-5">Vitesse moyenne : <span id="vitesseMoyenne" class="font-bold">{{ vitesseMoyenne }} km/h</span></p>
        <p class="my-5">Batterie : <span id="battery" class="font-bold">{{ battery }} V</span></p>
        <p class="my-5">Distance : <span id="distance" class="font-bold">{{ distance }} m</span></p>
      </Ucard>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    data() {
      return {
        raceID: null,
        formattedDateCourse: '',
        formattedDuree: 'calcul...',
        vitesseMin: 'calcul...',
        vitesseMax: 'calcul...',
        vitesseMoyenne: 'calcul...',
        battery: 'calcul...',
        distance: 'calcul...',
        speeds: [],
        totalDistance: 0,
        courseStartTime: null,
      };
    },
    methods: {
      updateData(newData) {
        if (newData.type === 'summary') {
          // Mise à jour à la fin de la course
          this.raceID = newData.id;
          this.vitesseMin = newData.vitesseMin;
          this.vitesseMax = newData.vitesseMax;
          this.vitesseMoyenne = newData.vitesseMoyenne;
          this.battery = newData.battery;
          this.distance = newData.distance;
          this.formattedDateCourse = new Date(newData.date).toLocaleString();
          
          console.log('Statistiques mises à jour :', {
            raceID: this.raceID,
            vitesseMin: this.vitesseMin,
            vitesseMax: this.vitesseMax,
            vitesseMoyenne: this.vitesseMoyenne,
            battery: this.battery,
            distance: this.distance,
            formattedDateCourse: this.formattedDateCourse
          });
        } else {
          // Mise à jour en temps réel pendant la course
          const elapsedSeconds = (new Date(newData.date) - this.courseStartTime) / 1000;
          console.log('Temps écoulé (secondes) :', elapsedSeconds);
  
          // Mise à jour des vitesses
          this.speeds.push(newData.speed);
          this.vitesseMin = Math.min(...this.speeds);
          this.vitesseMax = Math.max(...this.speeds);
          this.vitesseMoyenne = (this.speeds.reduce((sum, speed) => sum + speed, 0) / this.speeds.length).toFixed(2);
  
          // Mise à jour de la distance cumulée
          this.totalDistance += newData.distance;
          this.distance = this.totalDistance.toFixed(2);
  
          // Mise à jour de la batterie
          this.battery = newData.battery.toFixed(2);
  
          // Mise à jour de la durée affichée
          this.formattedDuree = `${elapsedSeconds.toFixed(1)} s`;
        }
      },
      connectWebSocket() {
        const ws = new WebSocket('ws://localhost:5001');
  
        ws.onopen = () => {
          console.log('WebSocket connection opened');
        };
  
        ws.onmessage = (event) => {
          const messageData = JSON.parse(event.data);
          console.log('Données reçues via WebSocket :', messageData);
          this.updateData(messageData); // Mettre à jour les données reçues
        };
  
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
  
        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.courseStartTime = new Date(); // Enregistrer l'heure de départ de la course
        this.connectWebSocket(); // Connexion au WebSocket pour récupérer les données
      });
    },
  };
  </script>
  
  <style scoped>
  .my-10 {
    margin: 2.5rem 0;
  }
  
  .flex {
    display: flex;
  }
  
  .justify-center {
    justify-content: center;
  }
  
  .flex-row {
    flex-direction: row;
  }
  
  .place-content-around {
    justify-content: space-around;
  }
  
  .ms-20 {
    margin-inline-start: 5rem;
  }
  
  .my-5 {
    margin: 1.25rem 0;
  }
  
  .font-bold {
    font-weight: 700;
  }
  
  .text-green {
    color: green;
  }
  
  .text-red {
    color: red;
  }
  
  .text-lg {
    font-size: 1.125rem;
  }
  
  .text-4xl {
    font-size: 2.25rem;
    font-weight: bold;
  }
  
  .mt-3 {
    margin-top: 0.75rem;
  }
  </style>