document.addEventListener('DOMContentLoaded', () => {
  // --- Carousel ---
  const slides = document.querySelectorAll('.slide');
  let idx = 0;
  function show(i){ slides.forEach((s,n)=> s.classList.toggle('active', n===i)); }
  function next(){ idx = (idx+1) % slides.length; show(idx); }
  function prev(){ idx = (idx-1+slides.length) % slides.length; show(idx); }
  const arrowRight = document.getElementById('arrowRight');
  const arrowLeft = document.getElementById('arrowLeft');
  if(arrowRight) arrowRight.addEventListener('click', next);
  if(arrowLeft) arrowLeft.addEventListener('click', prev);
  if(slides.length) show(0);
  setInterval(next, 2000);

  // --- Theme toggle ---
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');
  if(themeBtn){
    themeBtn.addEventListener('click', ()=>{
      body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // --- Language toggle (упрощено) ---
  const langToggle = document.getElementById('langToggle');
  let currentLang = "en";
  if(langToggle){
    langToggle.addEventListener('click', ()=>{
      currentLang = (currentLang === "en") ? "ru" : "en";
      document.querySelectorAll("[data-i18n-lang],[data-i16n-lang],[data-i12n-lang],[data-i10n-lang]")
        .forEach(el => {
          const attr = el.getAttribute("data-i18n-lang") || el.getAttribute("data-i16n-lang") || el.getAttribute("data-i12n-lang") || el.getAttribute("data-i10n-lang");
          el.style.display = (attr === currentLang) ? "" : "none";
        });
    });
  }

  // --- Home button ---
  const homeBtn = document.getElementById('homeBtn');
  if(homeBtn){
    homeBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
  }

  // --- Video controls ---
  const video = document.getElementById('playerVideo');
  if(!video) return;

  const playBtn = document.getElementById('playBtn');
  const muteBtn = document.getElementById('muteBtn');
  const fsBtn = document.getElementById('fsBtn');
  const volume = document.getElementById('vol');
  const progress = document.getElementById('progress');
  const progressFilled = document.getElementById('progressFilled');
  const curTime = document.getElementById('curTime');
  const durTime = document.getElementById('durTime');
  const controlsRow = document.querySelector('.controls-row');
  const playerCard = document.querySelector('.player-card');

  video.controls = false;

  // Play / Pause
  if(playBtn){
    playBtn.addEventListener('click', ()=>{
      if(video.paused){
        video.play().catch(()=>{});
        playBtn.textContent = '⏸';
      } else {
        video.pause();
        playBtn.textContent = '▶';
      }
    });
  }

  // Mute toggle
  if(muteBtn){
    muteBtn.addEventListener('click', ()=>{
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? '🔇' : '🔊';
    });
  }

  // Volume slider
  if(volume){
    volume.addEventListener('input', ()=>{
      const v = parseFloat(volume.value);
      if(!isNaN(v)){
        video.volume = v;
        video.muted = video.volume === 0;
        if(muteBtn) muteBtn.textContent = video.muted ? '🔇' : '🔊';
      }
    });
  }

  // --- Fullscreen button (теперь кастомный fullscreen на контейнере) ---
  if (fsBtn && playerCard) {
    fsBtn.addEventListener('click', () => {
      if(document.fullscreenElement){
        document.exitFullscreen();
      } else if(playerCard.requestFullscreen){
        playerCard.requestFullscreen(); // ПК + Android + новые Safari
      } else if(playerCard.webkitRequestFullscreen){
        playerCard.webkitRequestFullscreen(); // старые Safari
      } else {
        alert("Fullscreen недоступен на этом устройстве");
      }
    });
  }

  // Fullscreen change
  document.addEventListener('fullscreenchange', () => {
    if(document.fullscreenElement){
      // при fullscreen можно скрыть системные контролы
      video.controls = false;
      if(controlsRow) controlsRow.style.display = 'flex';
    } else {
      video.controls = false;
      if(controlsRow) controlsRow.style.display = 'flex';
    }
  });

  // Progress bar click
  if(progress){
    progress.addEventListener('click', (e)=>{
      if (!video.duration || isNaN(video.duration)) return;
      const rect = progress.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * video.duration;
    });
  }

  // Update progress
  video.addEventListener('timeupdate', ()=>{
    if (!video.duration || isNaN(video.duration)) return;
    const percent = (video.currentTime / video.duration) * 100;
    if(progressFilled) progressFilled.style.width = percent + '%';
    let m = Math.floor(video.currentTime / 60);
    let s = Math.floor(video.currentTime % 60);
    if(s < 10) s = '0' + s;
    if(curTime) curTime.textContent = `${m}:${s}`;
  });

  // Total duration
  video.addEventListener('loadedmetadata', ()=>{
    if (!video.duration || isNaN(video.duration)) return;
    let m = Math.floor(video.duration / 60);
    let s = Math.floor(video.duration % 60);
    if(s < 10) s = '0' + s;
    if(durTime) durTime.textContent = `${m}:${s}`;
  });

  // Sync mute icon
  video.addEventListener('volumechange', ()=>{
    if(muteBtn) muteBtn.textContent = (video.muted || video.volume===0)?'🔇':'🔊';
    if(volume && typeof video.volume==='number') volume.value = String(video.volume);
  });
});
