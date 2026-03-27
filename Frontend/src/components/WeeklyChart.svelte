<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  export let activities;

  let chartCanvas;
  let chartInstance;

  // Logic: Get last 7 activities, reversed so they read left-to-right
  const last7 = activities.slice(0, 7).reverse();

  onMount(() => {
    // If a chart already exists, destroy it before creating a new one
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        // Create labels from the start_date (e.g., "Mon", "Tue")
        labels: last7.map(a => new Date(a.start_date).toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [{
          label: 'Distance (km)',
          data: last7.map(a => (a.distance / 1000).toFixed(1)), // Convert meters to KM
          backgroundColor: '#e94560',
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // Hide the legend box
          tooltip: {
            backgroundColor: '#333',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#555',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#333' },
            ticks: { color: '#888' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#888' }
          }
        }
      }
    });

    // Cleanup: Destroy chart when component is removed
    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  });
</script>

<div class="chart-container">
  <h3>Recent Volume</h3>
  <div class="canvas-wrapper">
    <canvas bind:this={chartCanvas}></canvas>
  </div>
</div>

<style>
  .chart-container {
    background: transparent; /* Transparent! The parent in App.svelte handles the white box */
    padding: 0; /* Remove padding, parent handles it */
    color: #333;
    height: 100%; /* Fill the parent */
    display: flex;
    flex-direction: column;
  }
  
  h3 { display: none; } /* Hide title, parent App.svelte has it */

  .canvas-wrapper {
    flex-grow: 1;
    position: relative;
    width: 100%;
    min-height: 200px;
  }
</style>