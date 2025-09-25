/* Carousel behavior + theme toggle + responsive video handling */
const slides = document.querySelectorAll('.slide');
const dotsWrap = document.querySelector('.dots');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
let index = 0;
let autoplayInterval = 2000;
let timer = null;

// build dots
if (dotsWrap) {
  slides.forEach((s,i)=>{
    const btn = document.createElement('button');
    btn.className = 'dot' + (i===0? ' active':'');
    btn.setAttribute('aria-label', 'Перейти к слайду ' + (i+1));
    btn.addEventListener('click', ()=> goTo(i));
    dotsWrap.appendChild(btn);
  });
}

function activate(i){
  slides.forEach((s,idx)=>{
    s.classList.toggle('active', idx===i);
    const media = s.querySelector('.carousel-media');
    if(media){
      if(media.tagName === 'VIDEO'){
        if(idx===i){
          media.currentTime = 0;
          media.muted = true;
          const p = media.play();
          if(p && p.catch) p.catch(()=>{});
        } else {
          media.pause();
          try{ media.currentTime = 0 }catch(e){}
        }
      }
    }
  });
  document.querySelectorAll('.dot').forEach((d,di)=> d.classList.toggle('active', di===i));
}

function goTo(i){
  index = (i + slides.length) % slides.length;
  activate(index);
  resetTimer();
}

if (nextBtn) nextBtn.addEventListener('click', ()=> goTo(index+1));
if (prevBtn) prevBtn.addEventListener('click', ()=> goTo(index-1));

function startTimer(){
  timer = setInterval(()=> goTo(index+1), autoplayInterval);
}
function resetTimer(){
  if(timer) { clearInterval(timer); startTimer(); }
}

const carouselEl = document.querySelector('.carousel');
if (carouselEl){
  carouselEl.addEventListener('pointerenter', ()=> { if(timer){ clearInterval(timer); timer = null } });
  carouselEl.addEventListener('pointerleave', ()=> { if(!timer) startTimer(); });
}

activate(0);
startTimer();

/* Theme toggle */
const themeBtn = document.getElementById('themeBtn');
const root = document.documentElement;
const saved = localStorage.getItem('site-theme');
if(saved) root.setAttribute('data-theme', saved);
else {
  const darkPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', darkPref ? 'dark' : 'light');
}
if (themeBtn){
  themeBtn.addEventListener('click', ()=>{
    const now = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', now);
    localStorage.setItem('site-theme', now);
  });
}

/* keyboard navigation */
document.addEventListener('keyup', (e)=>{
  if(e.key === 'ArrowRight') goTo(index+1);
  if(e.key === 'ArrowLeft') goTo(index-1);
});

function unlockVideos(){
  document.querySelectorAll('video').forEach(v=>{ v.muted = true; const p=v.play(); if(p && p.catch) p.catch(()=>{}); });
  window.removeEventListener('pointerdown', unlockVideos);
  window.removeEventListener('keydown', unlockVideos);
}
window.addEventListener('pointerdown', unlockVideos);
window.addEventListener('keydown', unlockVideos);

/* ----------- Fullscreen Handler (как на старом сайте) ----------- */
const video = document.getElementById("playerVideo");
const fsBtn = document.getElementById("fsBtn");

if (video && fsBtn) {
  fsBtn.addEventListener("click", () => {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen(); // Safari desktop
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();   // iPhone Safari
    }
  });
}
