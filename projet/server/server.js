// server.js
import WebSocket from 'ws'
import mqtt from 'mqtt'

// Connexion au broker MQTT
const mqttClient = mqtt.connect('mqtt://13.60.74.162:1883', {
  username: 'guest',
  password: 'guest',
})

// Création du serveur WebSocket
const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  console.log('Client connecté via WebSocket')

  // Souscription aux topics MQTT
  mqttClient.on('connect', () => {
    console.log('Connecté au broker MQTT')
    mqttClient.subscribe('esp32/speed')
    mqttClient.subscribe('esp32/distance')
    mqttClient.subscribe('esp32/battery')
  })

  // Recevoir les messages MQTT et les envoyer au client WebSocket
  mqttClient.on('message', (topic, message) => {
    const data = {
      topic,
      message: message.toString(),
    }
    console.log('Message MQTT reçu:', data)
    ws.send(JSON.stringify(data))  // Envoi des messages au client WebSocket
    console.log('Message envoyé au client WebSocket')
  })

  ws.on('close', () => {
    console.log('Client déconnecté du WebSocket')
  })
})