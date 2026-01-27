// ========================================
// PAGE NAVIGATION
// ========================================

/**
 * Switches between pages by toggling the 'active' class
 * @param {string} hidePageId - ID of the page to hide
 * @param {string} showPageId - ID of the page to show
 */
function switchPage(hidePageId, showPageId) {
    const hidePage = document.getElementById(hidePageId);
    const showPage = document.getElementById(showPageId);
    
    hidePage.classList.remove('active');
    showPage.classList.add('active');
}

// ========================================
// PAGE 1: INITIAL BUTTON
// ========================================

const nextBtn = document.getElementById('nextBtn');

nextBtn.addEventListener('click', () => {
    switchPage('page1', 'page2');
});

// ========================================
// PAGE 2: VALENTINE QUESTION LOGIC
// ========================================

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const gifContainer = document.getElementById('gifContainer');
const buttonContainer = document.querySelector('.button-container');

// Array of funny reaction GIFs that appear when NO button moves
// Using sneaky Snoopy peeking GIF
const reactionGifs = [
    'https://media.tenor.com/LM1w7EKwl_0AAAAM/sneaky-snoopy.gif',
];

// Detection radius for mouse/touch proximity to NO button (in pixels)
const DETECTION_RADIUS = 100;

// Track if NO button is currently being moved to prevent overlapping movements
let isMoving = false;

/**
 * Calculates Euclidean distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} Distance between points
 */
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Gets the bounding rectangle of an element relative to its container
 * @param {HTMLElement} element - The element to get bounds for
 * @returns {Object} Object containing x, y, width, height, centerX, centerY
 */
function getElementBounds(element) {
    const rect = element.getBoundingClientRect();
    const containerRect = buttonContainer.getBoundingClientRect();
    
    return {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
        centerX: rect.left - containerRect.left + rect.width / 2,
        centerY: rect.top - containerRect.top + rect.height / 2,
        right: rect.left - containerRect.left + rect.width,
        bottom: rect.top - containerRect.top + rect.height
    };
}

/**
 * Checks if two rectangular bounds overlap (collision detection)
 * @param {Object} bounds1 - First element bounds
 * @param {Object} bounds2 - Second element bounds
 * @returns {boolean} True if elements overlap
 */
function checkCollision(bounds1, bounds2) {
    return !(bounds1.x + bounds1.width < bounds2.x ||
             bounds2.x + bounds2.width < bounds1.x ||
             bounds1.y + bounds1.height < bounds2.y ||
             bounds2.y + bounds2.height < bounds1.y);
}

/**
 * Generates a random position for the NO button that doesn't collide with YES button
 * @returns {Object} Object with left and top CSS values
 */
function getRandomPosition() {
    const containerRect = buttonContainer.getBoundingClientRect();
    const noBtnRect = noBtn.getBoundingClientRect();
    const yesBtnBounds = getElementBounds(yesBtn);
    
    // Calculate available space for NO button movement
    const maxX = containerRect.width - noBtnRect.width;
    const maxY = containerRect.height - noBtnRect.height;
    
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loop
    
    // Keep trying random positions until we find one that doesn't collide
    while (attempts < maxAttempts) {
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;
        
        // Create hypothetical bounds for this position
        const hypotheticalBounds = {
            x: randomX,
            y: randomY,
            width: noBtnRect.width,
            height: noBtnRect.height
        };
        
        // Add collision margin (20px buffer around YES button)
        const collisionMargin = 20;
        const expandedYesBounds = {
            x: yesBtnBounds.x - collisionMargin,
            y: yesBtnBounds.y - collisionMargin,
            width: yesBtnBounds.width + collisionMargin * 2,
            height: yesBtnBounds.height + collisionMargin * 2
        };
        
        // If no collision, return this position
        if (!checkCollision(hypotheticalBounds, expandedYesBounds)) {
            return {
                left: `${randomX}px`,
                top: `${randomY}px`
            };
        }
        
        attempts++;
    }
    
    // Fallback: position at opposite corner from YES button
    const yesCenterX = yesBtnBounds.centerX;
    const yesCenterY = yesBtnBounds.centerY;
    
    return {
        left: yesCenterX > maxX / 2 ? '0px' : `${maxX}px`,
        top: yesCenterY > maxY / 2 ? '0px' : `${maxY}px`
    };
}

/**
 * Displays a reaction GIF above the NO button
 * @param {number} x - X coordinate for GIF position (viewport-relative)
 * @param {number} y - Y coordinate for GIF position (viewport-relative)
 */
function showGif(x, y) {
    // Create img element for the GIF
    const img = document.createElement('img');
    img.src = reactionGifs[0]; // Always use the Snoopy GIF
    img.alt = 'Sneaky Snoopy';
    
    // Clear previous GIF and add new one
    gifContainer.innerHTML = '';
    gifContainer.appendChild(img);
    
    // Center the GIF horizontally on the button and position above it
    // Since gifContainer is fixed, we use viewport coordinates
    const gifWidth = 150; // Approximate width from CSS clamp
    gifContainer.style.left = `${x - (gifWidth / 2)}px`;
    gifContainer.style.top = `${y - 180}px`; // Position well above the button
    gifContainer.classList.add('show');
    
    // Hide GIF after 1.5 seconds
    setTimeout(() => {
        gifContainer.classList.remove('show');
    }, 1500);
}

/**
 * Moves the NO button to a new random position when cursor/touch gets close
 */
function moveNoButton() {
    if (isMoving) return; // Prevent overlapping movements
    
    isMoving = true;
    noBtn.classList.add('moving');
    
    // Switch to absolute positioning on first move
    noBtn.style.position = 'absolute';
    
    // Get current position for GIF display
    const currentRect = noBtn.getBoundingClientRect();
    const containerRect = buttonContainer.getBoundingClientRect();
    
    // Calculate position relative to viewport for fixed positioning
    const gifX = currentRect.left + (currentRect.width / 2);
    const gifY = currentRect.top;
    
    showGif(gifX, gifY);
    
    // Generate and apply new position
    const newPosition = getRandomPosition();
    noBtn.style.left = newPosition.left;
    noBtn.style.top = newPosition.top;
    
    // Re-enable movement after animation completes
    setTimeout(() => {
        isMoving = false;
        noBtn.classList.remove('moving');
    }, 300);
}

/**
 * Checks if cursor/touch is near the NO button and moves it if so
 * @param {number} clientX - X coordinate of cursor/touch
 * @param {number} clientY - Y coordinate of cursor/touch
 */
function checkProximityAndMove(clientX, clientY) {
    const noBtnBounds = getElementBounds(noBtn);
    const distance = getDistance(
        clientX - buttonContainer.getBoundingClientRect().left,
        clientY - buttonContainer.getBoundingClientRect().top,
        noBtnBounds.centerX,
        noBtnBounds.centerY
    );
    
    // If cursor/touch is within detection radius, move the button
    if (distance < DETECTION_RADIUS) {
        moveNoButton();
    }
}

// ========================================
// EVENT LISTENERS FOR NO BUTTON EVASION
// ========================================

// Mouse movement detection (desktop)
buttonContainer.addEventListener('mousemove', (e) => {
    checkProximityAndMove(e.clientX, e.clientY);
});

// Touch movement detection (mobile)
buttonContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        checkProximityAndMove(touch.clientX, touch.clientY);
    }
}, { passive: true });

// Direct click on NO button (as last resort)
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
});

// Touch start on NO button (mobile)
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
});

// ========================================
// YES BUTTON - PROCEED TO CELEBRATION
// ========================================

yesBtn.addEventListener('click', () => {
    switchPage('page2', 'page3');
});

// ========================================
// INITIALIZATION
// ========================================

// Reinitialize collision detection on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // If button has already moved (is absolute), reposition it
        if (noBtn.style.position === 'absolute') {
            const newPosition = getRandomPosition();
            noBtn.style.left = newPosition.left;
            noBtn.style.top = newPosition.top;
        }
    }, 250);
});