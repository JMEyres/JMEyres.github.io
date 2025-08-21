  const cards = document.querySelectorAll('.card');
  const scrollArrow = document.getElementById('scrollArrow');

  function animateCards() {
    const triggerBottom = window.innerHeight * 0.85;

    cards.forEach((card, index) => {
      const cardTop = card.getBoundingClientRect().top;

      // Staggered fade-in
      if (cardTop < triggerBottom && !card.classList.contains('visible')) {
        setTimeout(() => {
          card.classList.add('visible');
        }, index * 150);
      } else if (cardTop >= triggerBottom && card.classList.contains('visible')) {
        card.classList.remove('visible');
      }
    });
  }

  function fadeArrowOnScroll() {
    if (window.scrollY > 50) {
      scrollArrow.style.opacity = 0;
    } else {
      scrollArrow.style.opacity = 1;
    }
  }

  window.addEventListener('scroll', () => {
    animateCards();
    fadeArrowOnScroll();
  });
  window.addEventListener('load', () => {
    animateCards();
    fadeArrowOnScroll();
  });

  AOS.init({
  duration: 1000,
  easing: 'ease-in-out',
  once: true
});