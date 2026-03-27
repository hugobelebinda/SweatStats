<script>
  export let activity;

  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric'
    });
  }
</script>

<div class="card">
  <div class="icon">
    {#if activity.type === 'Run'}🏃{:else if activity.type === 'Ride'}🚴{:else}🏋️{/if}
  </div>
  <div class="details">
    <h3>{activity.name}</h3>
    <p class="stats">
      <span>{(activity.distance / 1000).toFixed(2)} km</span>
      <span>•</span>
      <span>{formatTime(activity.moving_time)}</span>
    </p>
    <small>{formatDate(activity.start_date)}</small>
  </div>
</div>

<style>
  .card {
    display: flex;
    align-items: center;
    background: #ffffff;
    color: #1a1a2e;
    padding: 15px;
    border-radius: 18px;
    margin-bottom: 12px;
    border: 1px solid #f0f0f0;
    transition: transform 0.2s;
  }
  .card:hover { transform: translateY(-2px); border-color: #e94560; }
  
  .icon { 
    font-size: 20px; margin-right: 15px; 
    
  
    background: #fff0f3; 
    color: #e94560; 
    
    padding: 12px; border-radius: 14px; 
  }
  
  h3 { margin: 0 0 5px 0; font-size: 15px; font-weight: 700; color: #1a1a2e; }
  .stats { margin: 0; color: #533483;  font-size: 13px; font-weight: 500; }
  small { margin-top: 4px; display: block; color: #9ca3af; font-size: 11px; }
</style>