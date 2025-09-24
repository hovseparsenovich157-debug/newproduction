
/* Carousel behavior + theme toggle + responsive video handling */
const slides = document.querySelectorAll('.slide');
const dotsWrap = document.querySelector('.dots');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
let index = 0;
let autoplayInterval = 2000;
let timer = null;

// build dots
slides.forEach((s,i)=>{
  const btn = document.createElement('button');
  btn.className = 'dot' + (i===0? ' active':'');
  btn.setAttribute('aria-label', 'Перейти к слайду ' + (i+1));
  btn.addEventListener('click', ()=> goTo(i));
  dotsWrap.appendChild(btn);
});

function activate(i){
  slides.forEach((s,idx)=>{
    s.classList.toggle('active', idx===i);
    const media = s.querySelector('.carousel-media');
    if(media){
      if(media.tagName === 'VIDEO'){
        if(idx===i){
          // try to play when active; autoplay policies require muted & playsinline
          media.currentTime = 0;
          media.muted = true;
          const p = media.play();
          // ignore promise errors (browsers may block play until user interaction)
          if(p && p.catch) p.catch(()=>{});
        } else {
          media.pause();
          try{ media.currentTime = 0 }catch(e){}
        }
      }
    }
  });
  // update dots
  document.querySelectorAll('.dot').forEach((d,di)=> d.classList.toggle('active', di===i));
}

// navigate
function goTo(i){
  index = (i + slides.length) % slides.length;
  activate(index);
  resetTimer();
}

nextBtn.addEventListener('click', ()=> goTo(index+1));
prevBtn.addEventListener('click', ()=> goTo(index-1));

// autoplay
function startTimer(){
  timer = setInterval(()=> goTo(index+1), autoplayInterval);
}
function resetTimer(){
  if(timer) { clearInterval(timer); startTimer(); }
}

// pause on pointer enter (desktop) and resume on leave
const carouselEl = document.querySelector('.carousel');
carouselEl.addEventListener('pointerenter', ()=> { if(timer){ clearInterval(timer); timer = null } });
carouselEl.addEventListener('pointerleave', ()=> { if(!timer) startTimer(); });

// init
activate(0);
startTimer();

/* Theme toggle */
const themeBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
const saved = localStorage.getItem('site-theme');
if(saved) root.setAttribute('data-theme', saved);
else {
  // prefer system
  const darkPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', darkPref ? 'dark' : 'light');
}
themeBtn.addEventListener('click', ()=>{
  const now = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', now);
  localStorage.setItem('site-theme', now);
});

/* Make sure carousel adapts well to orientation changes */
window.addEventListener('resize', ()=> {
  // keep aspect handling, but if video is taller than container, force object-fit: contain (CSS already does)
  document.querySelectorAll('.carousel-media').forEach(m=>{
    // no-op placeholder: CSS handles actual resizing. This keeps the code present for advanced tuning.
  });
});

/* Improve keyboard navigation */
document.addEventListener('keyup', (e)=>{
  if(e.key === 'ArrowRight') goTo(index+1);
  if(e.key === 'ArrowLeft') goTo(index-1);
});

// On first user interaction attempt to play any muted videos to satisfy autoplay policies
function unlockVideos(){
  document.querySelectorAll('video').forEach(v=>{ v.muted = true; const p=v.play(); if(p && p.catch) p.catch(()=>{}); });
  window.removeEventListener('pointerdown', unlockVideos);
  window.removeEventListener('keydown', unlockVideos);
}
window.addEventListener('pointerdown', unlockVideos);
window.addEventListener('keydown', unlockVideos);
