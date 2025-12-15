/* -----------------------------------------
  Have focus outline only for keyboard users 
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if(e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing')

    window.removeEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDownOnce)
  }

}

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing')

  window.removeEventListener('mousedown', handleMouseDownOnce)
  window.addEventListener('keydown', handleFirstTab)
}

window.addEventListener('keydown', handleFirstTab)

const backToTopButton = document.querySelector(".back-to-top");
let isBackToTopRendered = false;

let alterStyles = (isBackToTopRendered) => {
  backToTopButton.style.visibility = isBackToTopRendered ? "visible" : "hidden";
  backToTopButton.style.opacity = isBackToTopRendered ? 1 : 0;
  backToTopButton.style.transform = isBackToTopRendered
    ? "scale(1)"
    : "scale(0)";
};

window.addEventListener("scroll", () => {
  if (window.scrollY > 700) {
    isBackToTopRendered = true;
    alterStyles(isBackToTopRendered);
  } else {
    isBackToTopRendered = false;
    alterStyles(isBackToTopRendered);
  }
});

/* -----------------------------------------
  Carousel functionality
 ---------------------------------------- */

const initCarousel = () => {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const images = carousel.querySelectorAll('.carousel__image');
  const indicators = carousel.querySelectorAll('.carousel__indicator');
  const prevButton = carousel.querySelector('.carousel__button--prev');
  const nextButton = carousel.querySelector('.carousel__button--next');
  
  let currentIndex = 0;
  const totalImages = images.length;

  const showImage = (index) => {
    // Remove active class from all images and indicators
    images.forEach(img => img.classList.remove('carousel__image--active'));
    indicators.forEach((ind, i) => {
      ind.classList.remove('carousel__indicator--active');
      ind.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    // Add active class to current image and indicator
    images[index].classList.add('carousel__image--active');
    indicators[index].classList.add('carousel__indicator--active');
    indicators[index].setAttribute('aria-selected', 'true');
    
    currentIndex = index;
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % totalImages;
    showImage(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
    showImage(prevIndex);
  };

  // Button event listeners
  if (nextButton) {
    nextButton.addEventListener('click', nextImage);
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', prevImage);
  }

  // Indicator event listeners
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      showImage(index);
    });
  });

  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  });

  // Auto-play (optional - can be disabled if not desired)
  // Uncomment the following lines if you want auto-play:
  /*
  let autoPlayInterval = setInterval(nextImage, 5000);
  
  carousel.addEventListener('mouseenter', () => {
    clearInterval(autoPlayInterval);
  });
  
  carousel.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(nextImage, 5000);
  });
  */
};

// Initialize carousel when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  initCarousel();
}