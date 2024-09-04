<template>
  <div class="my-10">
    <div class="flex justify-center">
      <div>
        <p class="font-bold text-5xl">Résumé de course</p>
      </div>
    </div>
    <div class="flex justify-center">
      <p class="text-lg mt-3" id="dateRace">00/00/0000 à 00:00</p>
    </div>
  </div>

  <div class="flex flex-row place-content-around ms-20">
    <Ucard>
      <p class="my-5">Durée de la course : <span id="duree" class="font-bold">calcul...</span></p>
      <p class="my-5">Vitesse max : <span id="vitesseMax" class="font-bold">calcul...</span></p>
      <p class="my-5">Vitesse min : <span id="vitesseMin" class="font-bold">calcul...</span></p>
      <p class="my-5">Vitesse moyenne : <span id="vitesseMoyenne" class="font-bold">calcul...</span></p>
    </Ucard>

    <canvas ref="lineChart" id="graphResume" class="max-w-xl max-h-60 "></canvas>
  </div>

  <div class="flex justify-center">
    <div class="my-10">
      <UButton color="sky" variant="soft" id="myExport">Exporter Résumé .pdf</UButton>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default {
  mounted() {
    // Exécuter le code après le montage du composant pour s'assurer que le DOM est prêt.
    this.initializeChartAndPDF();
  },
  methods: {

    initializeChartAndPDF() {

      // try {
      //   const response = await fetch('api/coursedata');
      //   const data = await response.json();

      // Données fictives de la course
      const data = [
        { duree: 10, vitesse: 5 },
        { duree: 20, vitesse: 13 },
        { duree: 30, vitesse: 11 },
        { duree: 40, vitesse: 18 },
        { duree: 42, vitesse: 15 },
      ];
      const dateCourse = new Date(2023, 8, 4, 14, 30); // Date fictive de la course (4 septembre 2023 à 14:30)
      const formattedDateCourse = `${String(dateCourse.getDate()).padStart(2, '0')}/${String(dateCourse.getMonth() + 1).padStart(2, '0')}/${dateCourse.getFullYear()} à ${String(dateCourse.getHours()).padStart(2, '0')}:${String(dateCourse.getMinutes()).padStart(2, '0')}`;
      //

      // récupération de la dernière valeur pour limiter l'axe x du graphique
      const maxDuree = Math.max(...data.map(row => row.duree));

      // calcul et affichage des infos
      const formattedDuree = maxDuree >= 60 
      ? `${Math.floor(maxDuree / 60)}m${String(maxDuree % 60).padStart(2, '0')}` 
      : `${maxDuree}s`;
      const vitesseMax = Math.max(...data.map(row => row.vitesse));
      const vitesseMin = Math.min(...data.map(row => row.vitesse));
      const vitesseMoyenne = (data.reduce((sum, row) => sum + row.vitesse, 0) / data.length).toFixed(2);

      document.getElementById('duree').textContent = formattedDuree;
      document.getElementById('vitesseMax').textContent = `${vitesseMax}`;
      document.getElementById('vitesseMin').textContent = `${vitesseMin}`;
      document.getElementById('vitesseMoyenne').textContent = `${vitesseMoyenne}`;
      document.getElementById('dateRace').textContent = formattedDateCourse;
      //

      // Initialiser le graphique Chart.js
      new Chart(document.getElementById('graphResume'), {
        type: 'line',
        data: {
          labels: data.map(row => row.duree),
          datasets: [
            {
              label: 'Vitesse',
              data: data.map(row => row.vitesse),
              tension: 0.3,
            },
          ],
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Durée (secondes)',
              },
              type: 'linear',
              max: maxDuree,
            },
            y: {
              title: {
                display: true,
                text: 'Vitesse (unité)',
              },
              max: 30,
              beginAtZero: true,
            },
          },
        },
      });

      // Fonction pour exporter le PDF
      const downloadChartJs = () => {
        const canvasElement = document.getElementById('graphResume');
        if (!canvasElement) {
          console.error("Le canvas n'a pas été trouvé.");
          return;
        }

        // Date et heure actuelles pour le nom du fichier PDF
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const pdfFileName = `race_resume_${day}${month}${year}_${hours}${minutes}.pdf`;

        // Génération du PDF
        html2canvas(canvasElement).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4',
          });

          const pageWidth = pdf.internal.pageSize.getWidth();

          // Titre du PDF
          pdf.setFontSize(20);
          pdf.text(`Résumé de la course du ${formattedDateCourse}`, pageWidth / 2, 30, { align: 'center' });

          // Ajouter le graphique Chart.js
          const graphWidth = pageWidth - 40; // Margins de 20px de chaque côté
          const aspectRatio = canvas.height / canvas.width;
          const graphHeight = graphWidth * aspectRatio;

          pdf.addImage(imgData, 'PNG', 20, 50, graphWidth, graphHeight);

          // Contenu du PDF
          pdf.setFontSize(12);
          let currentHeight = 50 + graphHeight + 20; // Position sous le graphique
          pdf.text(`Durée de la course : ${formattedDuree}`, 20, currentHeight);
          currentHeight += 20;
          pdf.text(`Vitesse max : ${vitesseMax}`, 20, currentHeight);
          currentHeight += 20;
          pdf.text(`Vitesse min : ${vitesseMin}`, 20, currentHeight);
          currentHeight += 20;
          pdf.text(`Vitesse moyenne : ${vitesseMoyenne}`, 20, currentHeight);

          // Enregistrer le PDF
          pdf.save(pdfFileName);
        }).catch((error) => {
          console.error('Erreur lors de la génération du PDF:', error);
        });
      };

      // Ajouter l'événement au bouton d'exportation
      document.getElementById("myExport").addEventListener("click", downloadChartJs);

      // } catch (error) {
      //     console.error('Error fetching the data:', error);
      //   }

    },
  },
};
</script>
