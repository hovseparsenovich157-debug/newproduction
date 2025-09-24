/* Player logic: play/pause, progress, volume, PIP, fullscreen, collapse.
   Works on mobile (playsinline) and desktop. Designed to be touch-friendly. */
(function(){
  const playerWrap = document.getElementById('site-player');
  const video = document.getElementById('player-video');
  const playBtn = document.getElementById('play-btn');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const progress = document.getElementById('progress');
  const progressFilled = document.getElementById('progress-filled');
  const timeLabel = document.getElementById('time');
  const muteBtn = document.getElementById('mute-btn');
  const volume = document.getElementById('volume');
  const fsBtn = document.getElementById('fs-btn');
  const pipBtn = document.getElementById('pip-btn');
  const thumbPlay = document.getElementById('toggle-play-thumb');
  const collapseBtn = document.getElementById('player-collapse');

  // Friendly defaults
  video.preload = 'metadata';
  video.playsInline = true;
  video.muted = false;

  function updatePlayState(){
    if(video.paused){
      iconPlay.style.display = 'inline';
      iconPause.style.display = 'none';
      playBtn.setAttribute('aria-pressed','false');
      thumbPlay.setAttribute('aria-label','Воспроизвести');
    } else {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'inline';
      playBtn.setAttribute('aria-pressed','true');
      thumbPlay.setAttribute('aria-label','Пауза');
    }
  }

  playBtn.addEventListener('click', ()=> {
    if(video.paused) video.play().catch(()=>{});
    else video.pause();
    updatePlayState();
  });
  thumbPlay.addEventListener('click', ()=> {
    if(video.paused) video.play().catch(()=>{});
    else video.pause();
    updatePlayState();
  });

  // Update progress
  video.addEventListener('timeupdate', ()=> {
    const pct = (video.currentTime / (video.duration || 1)) * 100;
    progressFilled.style.width = pct + '%';
    const cur = formatTime(video.currentTime);
    const dur = formatTime(video.duration || 0);
    timeLabel.textContent = cur + ' / ' + dur;
    progress.setAttribute('aria-valuenow', Math.floor(pct));
  });
  // Seek on click/tap
  function seek(e){
    const rect = progress.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    video.currentTime = pct * (video.duration || 0);
  }
  let seeking = false;
  progress.addEventListener('pointerdown', (e)=> { seeking=true; seek(e); });
  window.addEventListener('pointermove', (e)=> { if(seeking) seek(e); });
  window.addEventListener('pointerup', ()=> seeking=false);

  // volume & mute
  muteBtn.addEventListener('click', ()=> {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? '🔈' : '🔊';
    volume.value = video.muted ? 0 : video.volume;
  });
  volume.addEventListener('input', (e)=> {
    video.volume = parseFloat(e.target.value);
    video.muted = video.volume === 0;
    muteBtn.textContent = video.muted ? '🔈' : '🔊';
  });

  // pip (if supported)
  pipBtn.addEventListener('click', async ()=> {
    if(document.pictureInPictureEnabled){
      try{
        if(video !== document.pictureInPictureElement) await video.requestPictureInPicture();
        else await document.exitPictureInPicture();
      }catch(e){ console.warn('PIP error', e) }
    } else {
      // fallback: toggle small-screen collapse
      playerWrap.classList.toggle('collapsed');
    }
  });

  // fullscreen
  fsBtn.addEventListener('click', ()=> {
    const el = video;
    if(!document.fullscreenElement){
      if(el.requestFullscreen) el.requestFullscreen().catch(()=>{});
      else if(el.webkitEnterFullscreen) el.webkitEnterFullscreen(); // iOS Safari fullscreen for video tag
    } else {
      document.exitFullscreen().catch(()=>{});
    }
  });

  // time formatting
  function formatTime(t){
    if(!isFinite(t)) return '0:00';
    const m = Math.floor(t/60);
    const s = Math.floor(t%60);
    return m + ':' + (s<10? '0'+s : s);
  }

  // update UI on play/pause
  video.addEventListener('play', updatePlayState);
  video.addEventListener('pause', updatePlayState);

  // show duration when metadata loaded
  video.addEventListener('loadedmetadata', ()=> {
    timeLabel.textContent = formatTime(0) + ' / ' + formatTime(video.duration || 0);
  });

  // collapse control
  collapseBtn.addEventListener('click', ()=> {
    playerWrap.classList.toggle('collapsed');
    collapseBtn.textContent = playerWrap.classList.contains('collapsed') ? '▼' : '▲';
  });

  // accessibility: space toggles play when focus on button
  playBtn.addEventListener('keydown', (e)=> {
    if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); playBtn.click(); }
  });

  // attempt unlock on first interaction to satisfy autoplay policies on mobile
  function unlock(){
    video.muted = video.muted || false;
    const p = video.play();
    if(p && p.catch) p.catch(()=>{});
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  }
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  // initial UI state
  updatePlayState();

})();
