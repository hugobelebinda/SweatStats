<script>
  import { onMount } from "svelte";
  import axios from "axios";
  
  // 1. Grab ID immediately
  const urlParams = new URLSearchParams(window.location.search);
  const stravaIdParam = urlParams.get("stravaId");
  
  // State
  let activities = [];
  let loading = true;
  let stravaId = stravaIdParam;

  // Real Calculated Stats
  let weeklyDistance = 0;
  let weeklyTime = "0h 0m";
  let avgPace = "0:00";

  // Mock Data
  let weight = 104.6;
  let weightGoal = 90.0;
  
  // Last Workout Data
  let lastWorkoutType = "Run";
  let lastWorkoutDate = "Yesterday";
  let lastWorkoutDistance = "0.0"; // <-- NEW variable for distance

  
  onMount(async () => {
    if (stravaId) {
      try {
        const response = await axios.get(`http://localhost:5000/activities?stravaId=${stravaId}`);
        activities = response.data;
        calculateWeeklyStats(activities);
      } catch (error) {
        console.error("Error", error);
      }
    }
    loading = false;
  });

  function calculateWeeklyStats(data) {
    if (!data.length) return;

    // 1. Filter for Last 7 Days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentActivities = data.filter(a => new Date(a.start_date) >= oneWeekAgo);

    // 2. Sum Distance
    const totalDistMeters = recentActivities.reduce((acc, curr) => acc + curr.distance, 0);
    weeklyDistance = (totalDistMeters / 1000).toFixed(1);

    // 3. Sum Time
    const totalSeconds = recentActivities.reduce((acc, curr) => acc + curr.moving_time, 0);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    weeklyTime = `${hrs}h ${mins}m`;

    // 4. Calculate Average Pace
    if (totalDistMeters > 0) {
      const paceSecondsPerKm = totalSeconds / (totalDistMeters / 1000);
      const paceMins = Math.floor(paceSecondsPerKm / 60);
      const paceSecs = Math.floor(paceSecondsPerKm % 60);
      avgPace = `${paceMins}:${paceSecs < 10 ? '0' : ''}${paceSecs}`;
    }

    // 5. Update "Last Workout" (Type, Date, AND Distance)
    if (data.length > 0) {
      lastWorkoutType = data[0].type;
      lastWorkoutDate = new Date(data[0].start_date).toLocaleDateString('en-US', { weekday: 'long' });
      // <-- NEW: Calculate last distance
      lastWorkoutDistance = (data[0].distance / 1000).toFixed(1);
    }
  }

  function login() { window.location.href = "http://localhost:5000/auth"; }
</script>

<main>
  {#if !stravaId}
    <div class="login-center">
      <h1>Welcome to FitDash</h1>
      <button class="primary-btn" on:click={login}>Connect with Strava</button>
    </div>
  {:else}
    
    <div class="app-container">
      
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-circle">⚡</div>
        </div>
        <nav>
          <button class="nav-item active"><span class="icon">🏠</span></button>
          <button class="nav-item"><span class="icon">🏃</span></button>
          <button class="nav-item"><span class="icon">💬</span></button>
          <button class="nav-item"><span class="icon">📊</span></button>
          <button class="nav-item settings"><span class="icon">⚙️</span></button>
        </nav>
      </aside>

      <section class="main-dashboard">
        <header>
          <div class="greeting">
            <h1>Good Morning!</h1>
            <p>You're crushing your goals.</p>
          </div>
          <div class="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Search..." />
          </div>
        </header>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-header">
              <span class="dot pink"></span>
              <h3>Weekly Distance</h3>
            </div>
            <div class="mini-graph">
              <svg viewBox="0 0 100 20"><path d="M0 15 Q25 5 50 10 T100 5" fill="none" stroke="#e94560" stroke-width="2" /></svg>
            </div>
            <h2>{weeklyDistance} <span class="unit">km</span></h2>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="dot marine"></span>
              <h3>Avg Pace</h3>
            </div>
            <div class="mini-graph">
              <svg viewBox="0 0 100 20"><path d="M0 10 L20 15 L40 5 L60 12 L80 8 L100 10" fill="none" stroke="#16213e" stroke-width="2" /></svg>
            </div>
            <h2>{avgPace} <span class="unit">/km</span></h2>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="dot pink"></span>
              <h3>Total Time</h3>
            </div>
             <div class="mini-graph">
              <svg viewBox="0 0 100 20"><path d="M0 18 Q50 0 100 18" fill="none" stroke="#e94560" stroke-width="2" /></svg>
            </div>
            <h2>{weeklyTime}</h2>
          </div>
        </div>

        <div class="middle-section">
          <h3>Body Conditions</h3>
          <div class="condition-grid">
            
            <div class="condition-card">
              <h4>Weight</h4>
              <p class="subtext">Lost X kg</p>
              <div class="bar-chart-placeholder">
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 50%"></div>
                <div class="bar active" style="height: 80%"></div>
                <div class="bar" style="height: 70%"></div>
              </div>
              <div class="value-row">
                 <h2>{weight} <span class="unit">kg</span></h2>
              </div>
            </div>

            <div class="condition-card">
              <h4>Weight Goal</h4>
              <p class="subtext">Target: {weightGoal}kg</p>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width: 85%"></div>
              </div>
               <div class="value-row">
                 <h2> ? % <span class="unit">Done</span></h2>
              </div>
            </div>

            <div class="condition-card circle-card">
              <h4>Last Workout</h4>
              <p class="subtext">{lastWorkoutDate}</p>
              <div class="circle-progress">
                <div class="inner-circle">
                   <h3>{lastWorkoutType}</h3>
                   <p class="circle-distance">{lastWorkoutDistance} km</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="ai-chat-section">
          <div class="chat-header">
            <h3>Coach Dash </h3>
            <span class="status-dot"></span>
          </div>
          <div class="chat-input-area">
             <input type="text" placeholder="Ask coach: 'How do I improve my pace?'" />
             <button class="send-btn">➤</button>
          </div>
        </div>

      </section>

      <aside class="right-panel">
        <div class="body-container">
          <img 
            src="https://images.fineartamerica.com/images-medium-large-5/6-runner-muscles-scieproscience-photo-library.jpg" 
            alt="Body Model" 
            class="body-image" 
          />
          
          <div class="heart-rate-card">
            <div class="hr-icon">❤️</div>
            <div class="hr-info">
               <h4>Heart Rate</h4>
               <p>Not Connected</p>
            </div>
            <div class="hr-wave">
               <svg viewBox="0 0 100 30">
                 <polyline points="0,15 20,15 25,5 30,25 35,15 100,15" fill="none" stroke="#e94560" stroke-width="2"/>
               </svg>
            </div>
          </div>
        </div>
      </aside>

    </div>
  {/if}
</main>

<style>
  /* --- GLOBAL VARIABLES & RESET --- */
  :global(body) { 
    margin: 0; padding: 0; 
    background-color: #f3f7f9; 
    font-family: 'Inter', sans-serif; 
    color: #16213e; 
    height: 100vh;
    overflow: hidden;
  }

  h1, h2, h3, h4 { margin: 0; font-weight: 700; }
  p { margin: 0; }

  /* --- LAYOUT GRID --- */
  .app-container {
    display: grid;
    grid-template-columns: 80px 1fr 350px; /* Sidebar | Main | Right Panel */
    height: 100vh;
    padding: 20px;
    gap: 20px;
    box-sizing: border-box;
  }

  /* --- 1. SIDEBAR --- */
  .sidebar {
    background: white;
    border-radius: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
    box-shadow: 0 10px 20px rgba(0,0,0,0.02);
  }
  .logo-circle {
    width: 45px; height: 45px;
    background: linear-gradient(135deg, #16213e 0%, #e94560 100%);
    border-radius: 50%;
    color: white; display: flex; align-items: center; justify-content: center; font-size: 20px;
    margin-bottom: 60px;
    box-shadow: 0 5px 15px rgba(233, 69, 96, 0.4);
  }
  .nav-item {
    width: 50px; height: 50px;
    border-radius: 15px;
    border: none; background: transparent;
    cursor: pointer; margin-bottom: 20px;
    display: flex; align-items: center; justify-content: center;
    transition: 0.2s;
    font-size: 20px;
    color: #9ca3af;
  }
  .nav-item.active {
    background: #16213e;
    color: white;
    box-shadow: 0 5px 15px rgba(22, 33, 62, 0.3);
  }
  .settings { margin-top: auto; }

  /* --- 2. MAIN DASHBOARD --- */
  .main-dashboard {
    display: flex;
    flex-direction: column;
    gap: 25px;
    overflow-y: auto;
    padding-right: 10px; /* Scrollbar space */
  }

  header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }
  .greeting h1 { font-size: 24px; color: #16213e; }
  .greeting p { font-size: 14px; color: #9ca3af; margin-top: 5px; }
  
  .search-bar {
    background: white; padding: 12px 20px; border-radius: 50px;
    display: flex; align-items: center; gap: 10px; width: 250px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.02);
  }
  .search-bar input { border: none; outline: none; width: 100%; color: #16213e; font-weight: 500; }

  /* Top Stats Row */
  .stats-row {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  }
  .stat-card {
    background: white; padding: 25px; border-radius: 25px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.02);
    position: relative;
  }
  .stat-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; }
  .dot.pink { background: #e94560; }
  .dot.marine { background: #16213e; }
  .stat-header h3 { font-size: 14px; color: #6b7280; font-weight: 600; }
  
  .stat-card h2 { font-size: 28px; color: #16213e; }
  .unit { font-size: 14px; color: #9ca3af; font-weight: 500; }
  
  .mini-graph { 
    position: absolute; right: 20px; top: 40px; width: 60px; height: 30px; opacity: 0.5;
  }

  /* Middle Section */
  .middle-section h3 { font-size: 18px; margin-bottom: 20px; }
  .condition-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;
  }
  .condition-card {
    background: white; padding: 20px; border-radius: 25px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.02);
    display: flex; flex-direction: column; justify-content: space-between;
    height: 140px;
  }
  .condition-card h4 { font-size: 14px; color: #16213e; }
  .subtext { font-size: 12px; color: #9ca3af; margin-top: 5px; }
  .value-row { margin-top: auto; }

  /* Fake Bar Chart */
  .bar-chart-placeholder {
    display: flex; align-items: flex-end; gap: 5px; height: 40px; margin: 15px 0;
  }
  .bar { width: 6px; background: #f3f4f6; border-radius: 3px; }
  .bar.active { background: #16213e; }

  /* Fake Progress Bar */
  .progress-bar-container {
    width: 100%; height: 8px; background: #f3f4f6; border-radius: 4px; margin-top: 30px;
  }
  .progress-bar { height: 100%; background: #e94560; border-radius: 4px; }

  /* Circle Card (UPDATED) */
  .circle-card { align-items: center; text-align: center; }
  .circle-progress {
    width: 70px; height: 70px; border-radius: 50%;
    background: conic-gradient(#16213e 70%, #f3f4f6 0);
    display: flex; align-items: center; justify-content: center;
    margin-top: 10px;
  }
  /* UPDATED inner circle layout */
  .inner-circle {
    width: 55px; height: 55px; background: white; border-radius: 50%;
    display: flex; flex-direction: column; /* Stack text vertically */
    align-items: center; justify-content: center;
  }
  .inner-circle h3 { font-size: 12px; }
  /* NEW style for distance in circle */
  .circle-distance { font-size: 10px; color: #9ca3af; font-weight: 600; }

  /* Bottom Section: AI Chat */
  .ai-chat-section {
    background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
    border-radius: 25px; padding: 25px;
    color: white; margin-top: auto; /* Push to bottom if space allows */
  }
  .chat-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
  .status-dot { width: 8px; height: 8px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 10px #00ff88; }
  
  .chat-input-area {
    display: flex; gap: 10px;
  }
  .chat-input-area input {
    flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 12px; padding: 12px; color: white; outline: none;
  }
  .chat-input-area input::placeholder { color: rgba(255,255,255,0.5); }
  .send-btn {
    background: #e94560; border: none; width: 45px; border-radius: 12px;
    color: white; cursor: pointer; font-size: 18px;
  }

  /* --- 3. RIGHT PANEL (UPDATED) --- */
  .right-panel {
    background: #f8f9fc;
    border-radius: 30px;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .body-container {
    height: 100%; width: 100%;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    position: relative;
  }

  /* UPDATED IMAGE STYLES */
  .body-image {
    max-height: 80%;
    border-radius: 180px; 
    opacity: 0.55;
    filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.1));
  }

  /* UPDATED HEART RATE CARD POSITION */
  .heart-rate-card {
    position: absolute; 
    top: 58%; 
    transform: translateY(-50%); /* Center vertically on that point */
    /* removed bottom: 30px */
    background: white; padding: 15px 20px; border-radius: 20px;
    opacity: 0.80;
    display: flex; align-items: center; gap: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    width: 80%;
  }
  .hr-icon { font-size: 24px; color: #e94560; }
  .hr-info h4 { font-size: 14px; margin-bottom: 2px; }
  .hr-info p { font-size: 12px; color: #9ca3af; }
  .hr-wave { width: 60px; height: 30px; margin-left: auto; }

  /* Login Styles */
  .login-center { text-align: center; margin-top: 20vh; }
  .primary-btn { 
    padding: 15px 40px; background: #e94560; color: white; 
    border: none; border-radius: 50px; font-size: 18px; font-weight: bold; cursor: pointer; 
    box-shadow: 0 10px 20px rgba(233, 69, 96, 0.4);
  }
</style>