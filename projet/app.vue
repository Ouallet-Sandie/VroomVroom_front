<template>

  <div class="my-10">
  
    <div class="flex justify-center">
      <div>
        <p class="font-bold text-5xl">Résumé de course</p>
      </div>
    </div>
  
    <div class="flex justify-center">
      <p class="text-lg mt-3">Date 00/00/0000 à 00:00 </p>
    </div>
  
  </div>
  
  
  <div class="flex flex-row place-content-around ms-20">
    <Ucard>
        <p class="my-5">Durée de la course : <span class="font-bold">value</span></p>
        <p class="my-5">Vitesse max : <span class="font-bold">value</span></p>
        <p class="my-5">Vitesse min : <span class="font-bold">value</span></p>
        <p class="my-5">Vitesse moyenne : <span class="font-bold">value</span></p>
    </Ucard>

    <canvas ref="lineChart" id="graphResume" class="max-w-xl max-h-60 " />

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



  (async function() {

    // try {
    //   // Fetching data from the API
    //   const response = await fetch('api/coursedata');
    //   const data = await response.json();
    const data = 
      [
        { duree: 10, vitesse: 5 },
        { duree: 20, vitesse: 13 },
        { duree: 30, vitesse: 11 },
        { duree: 40, vitesse: 18 },
        { duree: 48, vitesse: 18 },
      ];

    const maxDuree = Math.max(...data.map(row => row.duree));
    
    new Chart(
      document.getElementById('graphResume'),
      {
        type: 'line',
        data: {
          labels: data.map(row => row.duree),
          datasets: [
            { 
              label: 'Vitesse',
              data: data.map(row => row.vitesse),
              // data: data.map(row => ({x: row.duree, y: row.vitesse})),
              tension: 0.3 //courbure de la ligne
            }
          ]
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Durée (secondes)'
              },
              type: 'linear',
              max: maxDuree,
            },
            y: {
              title: {
                display: true,
                text: 'Vitesse (unité)'
              },
              max: 30,
              beginAtZero: true
            }
          },   
        }
      }
    );
  // } catch (error) {
  //     console.error('Error fetching the data:', error);
  //   }



  // EXPORT PDF
  const downloadChartJs = () => {
    const canvasElement = document.getElementById('graphResume');
    
    // Vérifier si l'élément canvas existe
    if (!canvasElement) {
      console.error("Le canvas n'a pas été trouvé.");
      return;
    }

    // Nom du fichier PDF
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');  

    const pdfFileName = `race_resume_${day}${month}${year}_${hours}${minutes}.pdf`;

    // Génération du pdf
    html2canvas(canvasElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Titre du pdf
      pdf.setFontSize(20);
      pdf.text(`Résumé de la course du (date a ajouter)`, pageWidth / 2, 30, { align: 'center' })

      // Ajouter le graphique Chart.js
      const graphWidth = pageWidth - 40; // Margins de 20px de chaque côté
      const aspectRatio = canvas.height / canvas.width;
      const graphHeight = graphWidth * aspectRatio;

      pdf.addImage(imgData, 'PNG', 20, 50, graphWidth, graphHeight);

      // CONTENT
      pdf.setFontSize(12);
      let currentHeight = 50 + graphHeight + 20; // Position sous le graphique

      pdf.text(`Durée de la course : [valeur fictive]`, 20, currentHeight);
      currentHeight += 20; // Espacement vertical
      pdf.text(`Vitesse max : [valeur fictive]`, 20, currentHeight);
      currentHeight += 20;
      pdf.text(`Vitesse min : [valeur fictive]`, 20, currentHeight);
      currentHeight += 20;
      pdf.text(`Vitesse moyenne : [valeur fictive]`, 20, currentHeight);

      // Enregistrer le PDF
      pdf.save(pdfFileName);


    }).catch((error) => {
      console.error('Erreur lors de la génération du PDF:', error);
    });
  };

  document.getElementById("myExport").addEventListener("click", downloadChartJs);
    
  })();
  
</script>
