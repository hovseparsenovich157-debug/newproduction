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

  // --- Language toggle ---
  const langToggle = document.getElementById('langToggle');
  if(langToggle){
    langToggle.addEventListener('click', ()=>{
      const all = document.querySelectorAll('[data-i18n-lang],[data-i16n-lang],[data-i12n-lang],[data-i10n-lang]');
      all.forEach(el => {
        el.style.display = (el.style.display === 'none') ? '' : 'none';
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
  const playBtn = document.getElementById('playBtn');
  const muteBtn = document.getElementById('muteBtn');
  const fsBtn = document.getElementById('fsBtn');
  const volume = document.getElementById('vol');
  const progress = document.getElementById('progress');
  const progressFilled = document.getElementById('progressFilled');
  const curTime = document.getElementById('curTime');
  const durTime = document.getElementById('durTime');
  const controlsRow = document.querySelector('.controls-row');

  if(!video) return;

  // Disable native controls by default (custom player in normal mode)
  video.controls = false;

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

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
      try {
        const v = parseFloat(volume.value);
        if(!isNaN(v)){
          video.volume = v;
          video.muted = video.volume === 0;
          if(muteBtn) muteBtn.textContent = video.muted ? '🔇' : '🔊';
        }
      } catch(e){
        console.warn('Изменение громкости ограничено на этом устройстве');
      }
    });
  }

  // Fullscreen handling
  function enterFullscreen() {
    if(isIOS && typeof video.webkitEnterFullscreen === 'function') {
      video.webkitEnterFullscreen();
      return;
    }
    if(video.requestFullscreen) video.requestFullscreen();
    else if(video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    else if(video.msRequestFullscreen) video.msRequestFullscreen();
  }

  function exitFullscreen() {
    if(document.exitFullscreen) document.exitFullscreen();
    else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if(document.msExitFullscreen) document.msExitFullscreen();
  }

  if(fsBtn){
    fsBtn.addEventListener('click', ()=>{
      if(isIOS && video.webkitDisplayingFullscreen){
        // exit fullscreen on iOS
        try { video.webkitExitFullscreen(); } catch(e) {}
      } else if(document.fullscreenElement){
        exitFullscreen();
      } else {
        enterFullscreen();
      }
    });
  }

  // Standard fullscreen events
  document.addEventListener('fullscreenchange', ()=>{
    if(document.fullscreenElement){
      video.controls = true;
      if(controlsRow) controlsRow.style.display = 'none';
    } else {
      video.controls = false;
      if(controlsRow) controlsRow.style.display = 'flex';
    }
  });

  // iOS fullscreen events
  video.addEventListener('webkitbeginfullscreen', ()=>{
    video.controls = true;
    if(controlsRow) controlsRow.style.display = 'none';
  });
  video.addEventListener('webkitendfullscreen', ()=>{
    video.controls = false;
    if(controlsRow) controlsRow.style.display = 'flex';
  });

  // Progress bar click (seek)
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

  // Show total duration
  video.addEventListener('loadedmetadata', ()=>{
    if (!video.duration || isNaN(video.duration)) return;
    let m = Math.floor(video.duration / 60);
    let s = Math.floor(video.duration % 60);
    if(s < 10) s = '0' + s;
    if(durTime) durTime.textContent = `${m}:${s}`;
  });

  // Sync mute icon
  video.addEventListener('volumechange', ()=>{
    if(muteBtn) muteBtn.textContent = (video.muted || video.volume === 0) ? '🔇' : '🔊';
    if(volume && typeof video.volume === 'number') volume.value = String(video.volume);
  });

});

// Fullscreen button (универсально для iOS, Android, ПК)
if (fsBtn) {
  fsBtn.addEventListener('click', () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS && typeof video.webkitEnterFullscreen === 'function') {
      // На iPhone/iPad открываем нативный fullscreen
      video.webkitEnterFullscreen();
      return;
    }

    if (!document.fullscreenElement) {
      // На Android и ПК лучше вызывать fullscreen именно на <video>
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
      else if (video.msRequestFullscreen) video.msRequestFullscreen();
    } else {
      // Выход из fullscreen
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  });
}
