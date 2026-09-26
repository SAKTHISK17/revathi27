(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const photos = [
    { src: 'r2.png', alt: 'Revathi celebrating' },
    { src: 'r1.png', alt: 'Revathi and Guna together' },
    { src: 'r3.png', alt: 'A beautiful memory of Revathi' },
    { src: 'r4.jpg', alt: 'Revathi smiling' },
    { src: 'r5.jpg', alt: 'A happy moment with Revathi' },
    { src: 'r6.jpg', alt: 'A memory worth keeping' },
    { src: '1000218220.jpg', alt: 'A wedding memory' },
    { src: '1000218223.jpg', alt: 'A wedding memory' },
    { src: '1000218224.jpg', alt: 'A wedding memory' },
    { src: '1000218225.jpg', alt: 'A wedding memory' },
    { src: '1000218226.jpg', alt: 'A wedding memory' },
    { src: '4X3A8131.JPG', alt: 'Revathi and Guna on their wedding day' },
    { src: '4X3A8136.JPG', alt: 'Revathi and Guna on their wedding day' },
    { src: '4X3A8258.JPG', alt: 'A wedding portrait' },
    { src: '4X3A8268.JPG', alt: 'A wedding portrait' },
    { src: '4X3A8271.JPG', alt: 'A wedding portrait' },
    { src: '4X3A8314.JPG', alt: 'A wedding celebration' },
    { src: '4X3A8330.JPG', alt: 'A wedding celebration' },
    { src: 'DEE23332.JPG', alt: 'A candid wedding moment' },
    { src: 'DEE23372.JPG', alt: 'A candid wedding moment' },
    { src: 'IMG_20250813_222409.jpg', alt: 'A portrait from the wedding' },
    { src: 'IMG_20250813_223011.jpg', alt: 'A portrait from the wedding' },
    { src: 'IMG_20250813_223704.jpg', alt: 'A portrait from the wedding' },
    { src: 'SM247385.JPG', alt: 'A joyful wedding memory' },
    { src: 'SM247500.JPG', alt: 'A joyful wedding memory' },
    { src: 'SM247558.JPG', alt: 'A joyful wedding memory' },
    { src: 'SM247581.JPG', alt: 'A joyful wedding memory' },
    { src: 'SM247737.JPG', alt: 'A joyful wedding memory' }
  ];
  photos.forEach((photo, index) => {
    photo.thumb = `gallery-thumbs/${String(index + 1).padStart(2, '0')}.webp`;
  });

  /* ---------- cinematic entrance + soundtrack ---------- */
  const intro = document.getElementById('intro');
  const beginBtn = document.getElementById('beginBtn');
  const enterSilent = document.getElementById('enterSilent');
  const bgAudio = document.getElementById('bgAudio');
  const musicBtn = document.getElementById('musicBtn');
  const musicPlayer = document.getElementById('musicPlayer');
  let playing = false;
  let targetVolume = 0.68;
  let volumeAnimation = null;

  bgAudio.volume = 0;

  function setMusicState(active) {
    playing = active;
    musicPlayer.classList.toggle('is-playing', active);
    musicBtn.setAttribute('aria-pressed', String(active));
    musicBtn.setAttribute('aria-label', active ? 'Pause music' : 'Play music');
  }

  function fadeVolume(to, duration = 900) {
    if (!playing && to > 0) return;
    if (volumeAnimation) cancelAnimationFrame(volumeAnimation);
    const from = bgAudio.volume;
    const safeTarget = Math.min(0.82, Math.max(0, to));
    const start = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      bgAudio.volume = from + (safeTarget - from) * eased;
      if (progress < 1) volumeAnimation = requestAnimationFrame(step);
    }
    volumeAnimation = requestAnimationFrame(step);
  }

  async function startMusic() {
    try {
      await bgAudio.play();
      setMusicState(true);
      fadeVolume(targetVolume, 1800);
      return true;
    } catch (error) {
      setMusicState(false);
      console.warn('The soundtrack could not start:', error);
      return false;
    }
  }

  function revealExperience(withSound) {
    document.body.classList.remove('is-locked');
    intro.classList.add('is-leaving');
    intro.setAttribute('aria-hidden', 'true');
    if (withSound) startMusic();
    window.setTimeout(() => { intro.style.display = 'none'; }, 850);
    window.setTimeout(() => fireConfetti(55, true), 500);
  }

  beginBtn.addEventListener('click', () => revealExperience(true));
  enterSilent.addEventListener('click', () => revealExperience(false));

  // Handy for visual QA without changing the experience guests receive.
  if (new URLSearchParams(window.location.search).has('preview')) {
    document.body.classList.remove('is-locked');
    document.body.classList.add('preview-mode');
    intro.style.display = 'none';
    intro.setAttribute('aria-hidden', 'true');
    document.documentElement.style.scrollBehavior = 'auto';
    if (window.location.hash) {
      window.setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView(), 100);
    }
  }

  musicBtn.addEventListener('click', async () => {
    if (!playing) {
      await startMusic();
    } else {
      fadeVolume(0, 350);
      window.setTimeout(() => {
        if (playing) return;
        bgAudio.pause();
      }, 380);
      setMusicState(false);
    }
  });

  bgAudio.addEventListener('ended', () => setMusicState(false));
  document.addEventListener('visibilitychange', () => {
    if (!playing) return;
    fadeVolume(document.hidden ? 0.04 : targetVolume, document.hidden ? 300 : 900);
  });

  const volumeSections = [...document.querySelectorAll('section[data-volume]')];
  function updateSceneVolume() {
    if (!playing || !volumeSections.length) return;
    const center = window.innerHeight * 0.48;
    let closest = volumeSections[0];
    let distance = Infinity;
    volumeSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = Math.max(rect.top, Math.min(center, rect.bottom));
      const currentDistance = Math.abs(sectionCenter - center);
      if (currentDistance < distance) {
        distance = currentDistance;
        closest = section;
      }
    });
    const next = Number(closest.dataset.volume || 0.48);
    if (Math.abs(next - targetVolume) > 0.01) {
      targetVolume = next;
      fadeVolume(targetVolume, 1200);
    }
  }

  /* ---------- navigation, scrolling, reveal ---------- */
  const siteNav = document.getElementById('siteNav');
  const navToggle = document.getElementById('navToggle');
  const navDrawer = document.getElementById('navDrawer');
  const progressLine = document.getElementById('progressLine');
  let scrollTicking = false;

  function closeDrawer() {
    navDrawer.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', () => {
    const open = navDrawer.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navDrawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));

  function updateScrollEffects() {
    const root = document.documentElement;
    const maximum = root.scrollHeight - root.clientHeight;
    progressLine.style.width = `${maximum > 0 ? (root.scrollTop / maximum) * 100 : 0}%`;
    siteNav.classList.toggle('is-scrolled', window.scrollY > 30);
    updateSceneVolume();
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateScrollEffects);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollEffects();

  document.getElementById('scrollCue').addEventListener('click', () => {
    document.getElementById('story').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const revealItems = document.querySelectorAll('[data-reveal], [data-beat]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  if (canHover && !reduceMotion) {
    const cursorGlow = document.getElementById('cursorGlow');
    window.addEventListener('pointermove', event => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });

    const portraitWrap = document.getElementById('heroPortrait');
    const portrait = portraitWrap.querySelector('.hero-portrait');
    portraitWrap.addEventListener('pointermove', event => {
      const rect = portraitWrap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      portrait.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -8}deg)`;
    });
    portraitWrap.addEventListener('pointerleave', () => {
      portrait.style.transform = 'rotateY(-4deg) rotateX(1deg)';
    });
  }

  /* ---------- gallery + swipeable lightbox ---------- */
  const photoGrid = document.getElementById('photoGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCount = document.getElementById('lightboxCount');
  const memoryAmbient = document.getElementById('memoryAmbient');
  const memoryCounter = document.getElementById('memoryCounter');
  const memoryProgress = document.getElementById('memoryProgress');
  const memoryPrev = document.getElementById('memoryPrev');
  const memoryNext = document.getElementById('memoryNext');
  let lightboxIndex = 0;
  let lightboxTouchX = null;
  let memoryIndex = 0;
  let memoryScrollFrame = null;

  photos.forEach((photo, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'photo-item';
    item.setAttribute('aria-label', `Open photo ${index + 1}`);
    const image = document.createElement('img');
    image.src = photo.thumb;
    image.alt = photo.alt;
    image.loading = index < 4 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      if (!image.dataset.fallback) {
        image.dataset.fallback = 'true';
        image.src = photo.src;
      } else {
        item.style.display = 'none';
      }
    });
    const number = document.createElement('span');
    number.className = 'photo-index';
    number.textContent = String(index + 1).padStart(2, '0');
    const caption = document.createElement('span');
    caption.className = 'photo-caption';
    caption.innerHTML = `<span>Memory ${String(index + 1).padStart(2, '0')}</span><small>view full frame ↗</small>`;
    item.append(image, number, caption);
    item.addEventListener('click', () => openLightbox(index));
    photoGrid.appendChild(item);
  });

  const memoryCards = [...photoGrid.querySelectorAll('.photo-item')];
  photoGrid.tabIndex = 0;

  function changeMemoryAmbient(index) {
    const nextSource = photos[index].thumb;
    if (memoryAmbient.getAttribute('src') === nextSource) return;
    memoryAmbient.classList.add('is-changing');
    const reveal = () => memoryAmbient.classList.remove('is-changing');
    memoryAmbient.addEventListener('load', reveal, { once: true });
    memoryAmbient.src = nextSource;
    if (memoryAmbient.complete) requestAnimationFrame(reveal);
  }

  function setMemoryState(index, shouldScroll = false) {
    const nextIndex = Math.max(0, Math.min(index, memoryCards.length - 1));
    const changed = nextIndex !== memoryIndex;
    memoryIndex = nextIndex;
    memoryCards.forEach((card, current) => {
      card.classList.toggle('is-current', current === memoryIndex);
      card.classList.toggle('is-before', current < memoryIndex);
      card.classList.toggle('is-after', current > memoryIndex);
    });
    memoryCounter.textContent = `${String(memoryIndex + 1).padStart(2, '0')} / ${String(memoryCards.length).padStart(2, '0')}`;
    memoryProgress.style.width = `${((memoryIndex + 1) / memoryCards.length) * 100}%`;
    memoryPrev.disabled = memoryIndex === 0;
    memoryNext.disabled = memoryIndex === memoryCards.length - 1;
    if (changed) changeMemoryAmbient(memoryIndex);

    if (shouldScroll) {
      const card = memoryCards[memoryIndex];
      const destination = card.offsetLeft - (photoGrid.clientWidth - card.offsetWidth) / 2;
      photoGrid.scrollTo({ left: destination, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  function findCenteredMemory() {
    const center = photoGrid.scrollLeft + photoGrid.clientWidth / 2;
    let closest = 0;
    let closestDistance = Infinity;
    memoryCards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (distance < closestDistance) {
        closest = index;
        closestDistance = distance;
      }
    });
    setMemoryState(closest);
  }

  photoGrid.addEventListener('scroll', () => {
    if (memoryScrollFrame) return;
    memoryScrollFrame = requestAnimationFrame(() => {
      findCenteredMemory();
      memoryScrollFrame = null;
    });
  }, { passive: true });
  photoGrid.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    setMemoryState(memoryIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
  });
  memoryPrev.addEventListener('click', () => setMemoryState(memoryIndex - 1, true));
  memoryNext.addEventListener('click', () => setMemoryState(memoryIndex + 1, true));
  window.addEventListener('resize', () => setMemoryState(memoryIndex, true), { passive: true });
  setMemoryState(0);

  function renderLightbox() {
    const photo = photos[lightboxIndex];
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;
    lightboxCount.textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${photos.length}`;
  }

  function openLightbox(index) {
    lightboxIndex = index;
    renderLightbox();
    lightbox.classList.add('is-active');
    document.body.classList.add('is-locked');
    fadeVolume(Math.min(targetVolume, 0.24), 500);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-active');
    document.body.classList.remove('is-locked');
    lightboxImg.src = '';
    if (playing) fadeVolume(targetVolume, 650);
  }

  function moveLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + photos.length) % photos.length;
    lightboxImg.animate(
      [{ opacity: 0.25, transform: `translateX(${direction * 14}px)` }, { opacity: 1, transform: 'translateX(0)' }],
      { duration: reduceMotion ? 1 : 280, easing: 'ease-out' }
    );
    renderLightbox();
  }

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => moveLightbox(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener('touchstart', event => { lightboxTouchX = event.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', event => {
    if (lightboxTouchX === null) return;
    const delta = event.changedTouches[0].clientX - lightboxTouchX;
    if (Math.abs(delta) > 45) moveLightbox(delta < 0 ? 1 : -1);
    lightboxTouchX = null;
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (lightbox.classList.contains('is-active')) closeLightbox();
      else closeDrawer();
    }
    if (!lightbox.classList.contains('is-active')) return;
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });

  /* ---------- their love story ---------- */
  const loveChapters = [
    {
      chapter: 'Chapter One · The invite', title: 'Where it started',
      text: 'Her squad was short a player, and a friend added a stranger named Guna to fill the spot. Neither of them knew that one invite would change everything.',
      quote: '“Hey, Guna… welcome to our squad.”', image: 'image_1.png', bg: '#35162f'
    },
    {
      chapter: 'Chapter Two · The voice', title: 'A voice worth noticing',
      text: 'His voice was calm, a little husky, a little funny. Match after match, the games became less about winning and more about hearing him talk.',
      quote: '“Oru game player mattum illa avan… oru vibe-yum irundhuchu.”', image: 'image_2.png', bg: '#54233f'
    },
    {
      chapter: 'Chapter Three · The habit', title: 'Every morning, a habit',
      text: 'Numbers were exchanged. Calls became routine — a voice on the ride to work, someone who listened before offering advice, someone who felt like home before either of them said it out loud.',
      image: 'image_3.png', bg: '#62304d'
    },
    {
      chapter: 'Chapter Four · The silence', title: 'The day she missed',
      text: 'One day, no call came — and the silence said more than either of them expected. That night, a text arrived, and for the first time, neither of them pretended anymore.',
      quote: '“Pesama irundha, naan enna vida mudiyadhu nu theriyudhu.”', image: 'image_4.png', bg: '#442037'
    },
    {
      chapter: 'Chapter Five · The yes', title: 'Coffee shop, no more guessing',
      text: 'Over coffee, he finally said what they’d both been circling for months. She didn’t have to think twice.',
      quote: '“Nee enna life la introduce panna hero nu feel panren.”', image: 'image_5.png', bg: '#7b3156'
    },
    {
      chapter: 'Chapter Six · Forever', title: 'Happy ending, new beginning',
      text: 'What started as two players filling a squad became two people building a life. On June 6, 2025, Revathi married Guna — and the story that began as a game became the realest thing she’s ever known.',
      quote: 'Virtual players. Real love.', image: 'image_6.png', bg: '#9b5e58'
    }
  ];

  const storyCard = document.getElementById('storyCard');
  const storyProgress = document.getElementById('storyProgress');
  const storyStage = document.getElementById('storyStage');
  const storyAmbientImg = document.getElementById('storyAmbientImg');
  const storyCounter = document.getElementById('storyCounter');
  const storyPrev = document.getElementById('tapLeft');
  const storyNext = document.getElementById('tapRight');
  let storyIndex = 0;
  let storyTouchX = null;
  let storyAnimating = false;

  loveChapters.forEach(() => {
    const segment = document.createElement('div');
    segment.className = 'story-progress-seg';
    storyProgress.appendChild(segment);
  });
  const progressSegments = storyProgress.querySelectorAll('.story-progress-seg');

  function commitStory(index, direction) {
    storyIndex = index;
    const chapter = loveChapters[storyIndex];
    storyCard.style.setProperty('--story-bg', chapter.bg);
    storyCard.innerHTML = `
      <div class="story-img"><img src="${chapter.image}" alt="" loading="lazy"></div>
      <p class="story-chapter">${chapter.chapter}</p>
      <h3 class="story-title">${chapter.title}</h3>
      <p class="story-text">${chapter.text}</p>
      ${chapter.quote ? `<p class="story-quote">${chapter.quote}</p>` : ''}`;
    progressSegments.forEach((segment, current) => {
      segment.classList.toggle('is-done', current < storyIndex);
      segment.classList.toggle('is-active', current === storyIndex);
    });
    storyCounter.textContent = `${String(storyIndex + 1).padStart(2, '0')} / ${String(loveChapters.length).padStart(2, '0')}`;
    storyPrev.disabled = storyIndex === 0;
    storyNext.disabled = storyIndex === loveChapters.length - 1;

    storyAmbientImg.classList.add('is-changing');
    const revealAmbient = () => storyAmbientImg.classList.remove('is-changing');
    storyAmbientImg.addEventListener('load', revealAmbient, { once: true });
    storyAmbientImg.src = chapter.image;
    if (storyAmbientImg.complete) requestAnimationFrame(revealAmbient);

    storyCard.className = 'story-card';
    if (direction && !reduceMotion) {
      void storyCard.offsetWidth;
      storyCard.classList.add(direction > 0 ? 'story-enter-right' : 'story-enter-left');
    }

    [loveChapters[storyIndex - 1], loveChapters[storyIndex + 1]].forEach(adjacent => {
      if (adjacent) new Image().src = adjacent.image;
    });
  }

  function renderStory(index, direction = 0) {
    const nextIndex = Math.max(0, Math.min(index, loveChapters.length - 1));
    if (storyAnimating || (nextIndex === storyIndex && direction)) return;
    if (!direction || reduceMotion) {
      commitStory(nextIndex, direction);
      return;
    }

    storyAnimating = true;
    storyCard.classList.add(direction > 0 ? 'story-exit-left' : 'story-exit-right');
    window.setTimeout(() => {
      commitStory(nextIndex, direction);
      window.setTimeout(() => { storyAnimating = false; }, 520);
    }, 220);
  }

  renderStory(0);
  storyPrev.addEventListener('click', () => renderStory(storyIndex - 1, -1));
  storyNext.addEventListener('click', () => renderStory(storyIndex + 1, 1));
  storyStage.addEventListener('touchstart', event => { storyTouchX = event.changedTouches[0].clientX; }, { passive: true });
  storyStage.addEventListener('touchend', event => {
    if (storyTouchX === null) return;
    const delta = event.changedTouches[0].clientX - storyTouchX;
    if (Math.abs(delta) > 38) {
      const direction = delta < 0 ? 1 : -1;
      renderStory(storyIndex + direction, direction);
    }
    storyTouchX = null;
  }, { passive: true });

  /* ---------- game tabs ---------- */
  const tabs = [...document.querySelectorAll('.game-tab')];
  const panels = {
    match: document.getElementById('panel-match'), wheel: document.getElementById('panel-wheel'),
    balloons: document.getElementById('panel-balloons'), wish: document.getElementById('panel-wish')
  };
  let wheelBuilt = false;

  function activateGame(tab) {
    tabs.forEach(current => {
      const active = current === tab;
      current.classList.toggle('is-active', active);
      current.setAttribute('aria-selected', String(active));
    });
    Object.values(panels).forEach(panel => { panel.classList.remove('is-active'); panel.hidden = true; });
    const target = panels[tab.dataset.game];
    target.hidden = false;
    target.classList.add('is-active');
    if (tab.dataset.game === 'wheel' && !wheelBuilt) buildWheel();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateGame(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      next.focus();
      activateGame(next);
    });
  });

  /* ---------- memory match ---------- */
  const matchGrid = document.getElementById('matchGrid');
  const matchMoves = document.getElementById('matchMoves');
  const matchWin = document.getElementById('matchWin');
  let moves = 0;
  let flipped = [];
  let matchLocked = false;
  let matchedCount = 0;

  function shuffled(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const random = Math.floor(Math.random() * (index + 1));
      [result[index], result[random]] = [result[random], result[index]];
    }
    return result;
  }

  function buildMatchGrid() {
    matchGrid.innerHTML = '';
    moves = 0;
    flipped = [];
    matchLocked = false;
    matchedCount = 0;
    matchMoves.textContent = '0 moves';
    matchWin.hidden = true;
    const choices = shuffled(photos.slice(0, 12)).slice(0, 6);
    const deck = shuffled([...choices, ...choices]);

    deck.forEach((photo, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'match-card';
      card.dataset.src = photo.src;
      card.setAttribute('aria-label', `Turn over memory card ${index + 1}`);
      card.innerHTML = `<span class="match-card-inner"><span class="match-face match-face-back">R</span><span class="match-face match-face-front"><img src="${photo.thumb}" alt=""></span></span>`;
      card.addEventListener('click', () => flipCard(card));
      matchGrid.appendChild(card);
    });
  }

  function flipCard(card) {
    if (matchLocked || card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
    card.classList.add('is-flipped');
    flipped.push(card);
    if (flipped.length !== 2) return;

    moves += 1;
    matchMoves.textContent = `${moves} ${moves === 1 ? 'move' : 'moves'}`;
    matchLocked = true;
    const [first, second] = flipped;
    if (first.dataset.src === second.dataset.src) {
      first.classList.add('is-matched');
      second.classList.add('is-matched');
      matchedCount += 2;
      flipped = [];
      matchLocked = false;
      if (matchedCount === matchGrid.children.length) {
        matchWin.hidden = false;
        fireConfetti(70);
      }
    } else {
      window.setTimeout(() => {
        first.classList.remove('is-flipped');
        second.classList.remove('is-flipped');
        flipped = [];
        matchLocked = false;
      }, 750);
    }
  }
  document.getElementById('matchReset').addEventListener('click', buildMatchGrid);
  buildMatchGrid();

  /* ---------- spin wheel ---------- */
  const wheelFacts = [
    'Got married, June 6, 2025', 'Best advice at 2 a.m.', 'Turning 27 and glowing',
    'Most loyal friend around', 'Living her happiest chapter', 'Still the main character'
  ];
  const wheelColors = ['#7b3156', '#d98a9f', '#35162f', '#b66e72', '#8e4161', '#d4a657'];
  const wheel = document.getElementById('wheel');
  let currentRotation = 0;

  function buildWheel() {
    wheelBuilt = true;
    const slice = 360 / wheelFacts.length;
    wheel.style.background = `conic-gradient(${wheelFacts.map((_, index) => `${wheelColors[index]} ${index * slice}deg ${(index + 1) * slice}deg`).join(',')})`;
    wheelFacts.forEach((fact, index) => {
      const spoke = document.createElement('div');
      spoke.className = 'wheel-spoke';
      spoke.style.transform = `rotate(${index * slice + slice / 2 - 90}deg)`;
      const label = document.createElement('div');
      label.className = 'wheel-seg-label';
      label.textContent = fact;
      spoke.appendChild(label);
      wheel.appendChild(spoke);
    });
  }

  document.getElementById('spinBtn').addEventListener('click', () => {
    if (!wheelBuilt) buildWheel();
    const result = document.getElementById('wheelResult');
    const slice = 360 / wheelFacts.length;
    const target = Math.floor(Math.random() * wheelFacts.length);
    currentRotation += 1440 + (360 - (target * slice + slice / 2)) - (currentRotation % 360);
    wheel.style.transition = reduceMotion ? 'none' : 'transform 3.3s cubic-bezier(.12,.8,.16,1)';
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    result.textContent = '';
    window.setTimeout(() => {
      result.textContent = wheelFacts[target];
      fireConfetti(25);
    }, reduceMotion ? 0 : 3300);
  });

  /* ---------- balloons ---------- */
  const balloonMessages = [
    'Certified sunshine, no notes', 'The best hype friend in existence', '27 looks incredible on you',
    'Still the loudest laugh in the room', 'Glow-up of the century', 'The friend everyone wishes they had',
    'Main character energy, always', 'Somehow gets better with age', 'Living proof that good things happen'
  ];
  const balloonColors = ['#7b3156', '#e8bd72', '#d98a9f', '#b66e72', '#925177', '#f1c7c2'];
  const balloonGrid = document.getElementById('balloonGrid');

  shuffled(balloonMessages).slice(0, 6).forEach((message, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'balloon-item';
    item.setAttribute('aria-label', 'Pop this balloon');
    item.innerHTML = `<svg class="balloon-shape" viewBox="0 0 60 76" aria-hidden="true"><path d="M30 0C13 0 4 14 4 28c0 16 11 28 22 32.5L26 52h8l-4 8.5C41 56.5 56 44 56 28 56 14 47 0 30 0Z" fill="${balloonColors[index]}"/><line x1="30" y1="60" x2="30" y2="76" stroke="${balloonColors[index]}" stroke-width="1.4"/></svg><span class="balloon-message">${message}</span>`;
    item.addEventListener('click', () => {
      if (item.classList.contains('is-popped')) return;
      item.classList.add('is-popped');
      item.setAttribute('aria-label', message);
      fireConfetti(18);
    });
    balloonGrid.appendChild(item);
  });

  /* ---------- wish + confetti ---------- */
  const wishBtn = document.getElementById('wishBtn');
  const wishMessage = document.getElementById('wishMessage');
  let wished = false;
  wishBtn.addEventListener('click', () => {
    if (!wished) {
      wished = true;
      wishMessage.hidden = false;
      wishBtn.querySelector('span').textContent = 'Wish made';
    }
    fireConfetti(90);
    if (playing) {
      const previous = targetVolume;
      fadeVolume(Math.min(0.76, previous + 0.18), 350);
      window.setTimeout(() => fadeVolume(previous, 1200), 1700);
    }
  });

  function fireConfetti(amount = 40, fromCenter = false) {
    if (reduceMotion) return;
    const colors = ['#e8bd72', '#ffe2a6', '#d98a9f', '#f1c7c2', '#7b3156', '#fff9f1'];
    for (let index = 0; index < amount; index++) {
      const piece = document.createElement('i');
      const size = Math.random() * 6 + 3;
      piece.className = 'confetti-piece';
      piece.style.left = fromCenter ? `${45 + Math.random() * 10}%` : `${Math.random() * 100}%`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * (Math.random() > 0.55 ? 1 : 2.2)}px`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.6 ? '50%' : '1px';
      document.body.appendChild(piece);
      const horizontal = fromCenter ? (Math.random() - 0.5) * window.innerWidth : (Math.random() - 0.5) * 140;
      const animation = piece.animate([
        { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate3d(${horizontal}px,${window.innerHeight + 50}px,0) rotate(${360 + Math.random() * 720}deg)`, opacity: 0 }
      ], { duration: 2100 + Math.random() * 1800, easing: 'cubic-bezier(.2,.65,.35,1)' });
      animation.onfinish = () => piece.remove();
    }
  }
})();
