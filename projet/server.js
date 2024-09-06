import WebSocket, { WebSocketServer } from 'ws';

// Crée un serveur WebSocket sur le port 5001
const wss = new WebSocketServer({ port: 5001 });

// Variables pour suivre l'ID des courses et les données
let raceId = 1;
let intervalId;

// Fonction pour générer des données simulées pour une course
const generateCarData = (raceId, distance, battery) => {
  return {
    id: raceId, // ID de la course
    distance: distance, // Distance parcourue
    speed: Math.random() * 50 + 20, // Générer une vitesse aléatoire
    date: new Date().toISOString(), // Date et heure actuelles
    battery: battery, // Batterie restante
    track: Math.floor(Math.random() * 10) + 1, // Numéro de piste entre 1 et 10
  };
};

// Fonction pour démarrer une nouvelle course d'une minute
const startNewRace = (ws) => {
  const courseStartTime = Date.now();
  let distance = 0;
  let battery = Math.random() * 1 + 6; // Batterie initiale
  const speeds = []; // Tableau pour stocker toutes les vitesses de la course

  intervalId = setInterval(() => {
    const now = Date.now();
    const elapsedSeconds = (now - courseStartTime) / 1000;

    // Générer les données pour la course en cours
    const carData = generateCarData(raceId, distance, battery);
    speeds.push(carData.speed); // Stocker les vitesses

    // Incrémenter la distance et réduire la batterie
    distance += carData.speed * 0.5; // Supposons que chaque cycle de 5 secondes ajoute de la distance
    battery -= 0.01; // Simuler une diminution de la batterie

    // Envoyer les données au client
    ws.send(JSON.stringify(carData));
    console.log('Données envoyées :', carData);

    // Si une minute est écoulée, terminer la course
    if (elapsedSeconds >= 60) {
      clearInterval(intervalId);

      // Calculer les statistiques de la course
      const vitesseMin = Math.min(...speeds);
      const vitesseMax = Math.max(...speeds);
      const vitesseMoyenne = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;

      // Envoyer les statistiques finales de la course au client
      const courseSummary = {
        id: raceId, // ID de la course
        vitesseMin,
        vitesseMax,
        vitesseMoyenne: vitesseMoyenne.toFixed(2),
        distance: distance.toFixed(2), // Distance totale parcourue
        battery: battery.toFixed(2), // Batterie restante à la fin de la course
        date: new Date().toISOString(), // Date de fin de la course
      };

      ws.send(JSON.stringify({ type: 'summary', ...courseSummary }));
      console.log('Résumé de la course envoyé :', courseSummary);

      // Démarrer une nouvelle course après la fin de celle-ci
      raceId++; // Augmenter l'ID de la course pour la prochaine course
      startNewRace(ws); // Démarrer une nouvelle course
    }
  }, 5000); // Intervalle de 5 secondes pour simuler les mises à jour en temps réel
};

// Gérer la connexion d'un nouveau client
wss.on('connection', (ws) => {
  console.log('Client connected');
  startNewRace(ws); // Démarrer une course dès qu'un client se connecte

  // Gérer la déconnexion du client
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId); // Arrêter l'envoi de données si le client se déconnecte
  });

  // Gérer les erreurs
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server is running on ws://localhost:5001');
