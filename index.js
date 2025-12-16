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

const initCarousel = (carousel) => {
  if (!carousel) return;

  const images = carousel.querySelectorAll('.carousel__image');
  const videos = carousel.querySelectorAll('.carousel__video');
  const iframes = carousel.querySelectorAll('.carousel__iframe');
  const indicators = carousel.querySelectorAll('.carousel__indicator');
  const prevButton = carousel.querySelector('.carousel__button--prev');
  const nextButton = carousel.querySelector('.carousel__button--next');
  
  // Collect all media items in order
  const allMediaItems = [];
  const mediaTypes = [];
  
  // Get the container
  const container = carousel.querySelector('.carousel__container');
  if (!container) return;
  
  // Add items in the order they appear in the DOM
  Array.from(container.children).forEach(node => {
    if (node.classList.contains('carousel__image')) {
      allMediaItems.push(node);
      mediaTypes.push('image');
    } else if (node.classList.contains('carousel__video')) {
      allMediaItems.push(node);
      mediaTypes.push('video');
    } else if (node.classList.contains('carousel__iframe')) {
      allMediaItems.push(node);
      mediaTypes.push('iframe');
    }
  });
  
  if (allMediaItems.length === 0) return;
  
  let currentIndex = 0;
  const totalItems = allMediaItems.length;

  const showItem = (index) => {
    // Pause all videos first
    videos.forEach(video => {
      video.pause();
      video.classList.remove('carousel__video--active');
    });
    
    // Remove active class from all images
    images.forEach(img => img.classList.remove('carousel__image--active'));
    
    // Remove active class from all iframes
    iframes.forEach(iframe => iframe.classList.remove('carousel__iframe--active'));
    
    // Update indicators
    indicators.forEach((ind, i) => {
      ind.classList.remove('carousel__indicator--active');
      ind.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    // Add active class to current item based on its type
    const currentItem = allMediaItems[index];
    const currentType = mediaTypes[index];
    
    if (currentType === 'video') {
      currentItem.classList.add('carousel__video--active');
      // Play the active video
      currentItem.play().catch(e => {
        // Handle autoplay restrictions
        console.log('Video autoplay prevented:', e);
      });
    } else if (currentType === 'iframe') {
      currentItem.classList.add('carousel__iframe--active');
    } else {
      currentItem.classList.add('carousel__image--active');
    }
    
    indicators[index].classList.add('carousel__indicator--active');
    indicators[index].setAttribute('aria-selected', 'true');
    
    currentIndex = index;
  };

  const nextItem = () => {
    const nextIndex = (currentIndex + 1) % totalItems;
    showItem(nextIndex);
  };

  const prevItem = () => {
    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
    showItem(prevIndex);
  };

  // Button event listeners
  if (nextButton) {
    nextButton.addEventListener('click', nextItem);
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', prevItem);
  }

  // Indicator event listeners
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      showItem(index);
    });
  });

  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevItem();
    } else if (e.key === 'ArrowRight') {
      nextItem();
    }
  });

  // Initialize first item
  showItem(0);
};

const initAllCarousels = () => {
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    initCarousel(carousel);
  });
};

// Initialize carousels when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllCarousels);
} else {
  initAllCarousels();
}

/* -----------------------------------------
  Scroll stacking animation
 ---------------------------------------- */

const initScrollStacking = () => {
  const sections = document.querySelectorAll('section:not(.contact)');
  if (sections.length === 0) return;

  let ticking = false;
  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top;
          const sectionBottom = rect.bottom;
          const sectionHeight = rect.height;
          
          // Calculate section's position relative to viewport
          const isInViewport = sectionTop < windowHeight && sectionBottom > 0;
          const isAboveViewport = sectionBottom <= 0;
          const isBelowViewport = sectionTop >= windowHeight;
          
          // Stack sections that are in or entering the viewport
          if (isInViewport) {
            // Section is visible - stack it
            if (!section.classList.contains('stacked')) {
              section.classList.add('stacked');
            }
          } else if (scrollDirection === 'down' && isAboveViewport) {
            // Scrolling down and section has passed - keep it stacked briefly
            // This creates the stacking effect
            if (sectionBottom > -100) {
              section.classList.add('stacked');
            } else {
              section.classList.remove('stacked');
            }
          } else if (scrollDirection === 'up' && isBelowViewport) {
            // Scrolling up and section hasn't entered yet - don't stack
            section.classList.remove('stacked');
          } else if (isBelowViewport && sectionTop > windowHeight + 200) {
            // Section is far below - remove stacking
            section.classList.remove('stacked');
          }
        });
        
        lastScrollY = scrollY;
        ticking = false;
      });
      
      ticking = true;
    }
  };

  // Initial check
  handleScroll();
  
  // Throttled scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Also handle resize
  window.addEventListener('resize', handleScroll, { passive: true });
};

// Initialize scroll stacking when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollStacking);
} else {
  initScrollStacking();
}