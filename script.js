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
const noButtonWrapper = document.getElementById('noButtonWrapper');
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
 * Generates a random position for the NO button wrapper that doesn't collide with YES button
 * @returns {Object} Object with left and top CSS values
 */
function getRandomPosition() {
    const containerRect = buttonContainer.getBoundingClientRect();
    const wrapperRect = noButtonWrapper.getBoundingClientRect();
    const yesBtnBounds = getElementBounds(yesBtn);
    
    // Calculate available space for NO button wrapper movement
    const maxX = containerRect.width - wrapperRect.width;
    const maxY = containerRect.height - wrapperRect.height;
    
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
            width: wrapperRect.width,
            height: wrapperRect.height
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
 * Positions it to touch the top of the NO button
 */
function showGif() {
    console.log('showGif() called');
    
    // Get the current position of the NO button
    const noBtnRect = noBtn.getBoundingClientRect();
    
    console.log('NO Button getBoundingClientRect:', {
        left: noBtnRect.left,
        top: noBtnRect.top,
        width: noBtnRect.width,
        height: noBtnRect.height,
        right: noBtnRect.right,
        bottom: noBtnRect.bottom
    });
    
    // Create img element for the GIF
    const img = document.createElement('img');
    img.src = reactionGifs[0]; // Always use the Snoopy GIF
    img.alt = 'Sneaky Snoopy';
    
    // Clear previous GIF and add new one
    gifContainer.innerHTML = '';
    gifContainer.appendChild(img);
    
    // The container has 10px padding on all sides (from CSS)
    const containerPadding = 10;
    const imgWidth = 150; // From CSS clamp
    const containerWidth = imgWidth + (containerPadding * 2); // 170px total
    const containerHeight = 170; // Approximate with padding
    
    // Calculate position to center horizontally and touch top of button
    const leftPosition = noBtnRect.left + (noBtnRect.width / 2) - (containerWidth / 2);
    const topPosition = noBtnRect.top - containerHeight; // Touch the top of NO button
    
    console.log('Setting GIF Container position:', {
        left: leftPosition,
        top: topPosition,
        containerWidth: containerWidth,
        containerHeight: containerHeight,
        calculation: `Button top (${noBtnRect.top}) - Container height (${containerHeight}) = ${topPosition}`
    });
    
    gifContainer.style.left = `${leftPosition}px`;
    gifContainer.style.top = `${topPosition}px`;
    
    // Show the GIF
    gifContainer.classList.add('show');
    console.log('GIF Container should now be visible with class "show"');
}

/**
 * Moves the NO button wrapper to a new random position when cursor/touch gets close
 */
function moveNoButton() {
    if (isMoving) return; // Prevent overlapping movements
    
    isMoving = true;
    noButtonWrapper.classList.add('moving');
    
    // Switch wrapper to absolute positioning on first move
    noButtonWrapper.style.position = 'absolute';
    
    // Generate and apply new position to the wrapper
    const newPosition = getRandomPosition();
    noButtonWrapper.style.left = newPosition.left;
    noButtonWrapper.style.top = newPosition.top;
    
    // Show the GIF after button has moved (delay allows position to update)
    showGif();
    
    // Re-enable movement after animation completes
    setTimeout(() => {
        isMoving = false;
        noButtonWrapper.classList.remove('moving');
    }, 300);
}

/**
 * Checks if cursor/touch is near the NO button wrapper and moves it if so
 * @param {number} clientX - X coordinate of cursor/touch
 * @param {number} clientY - Y coordinate of cursor/touch
 */
function checkProximityAndMove(clientX, clientY) {
    const wrapperBounds = getElementBounds(noButtonWrapper);
    const distance = getDistance(
        clientX - buttonContainer.getBoundingClientRect().left,
        clientY - buttonContainer.getBoundingClientRect().top,
        wrapperBounds.centerX,
        wrapperBounds.centerY
    );
    
    // If cursor/touch is within detection radius, move the button
    if (distance < DETECTION_RADIUS) {
        moveNoButton();
    }
}

// ========================================
// EVENT LISTENERS FOR NO BUTTON EVASION
// ========================================

// Mouse hover on NO button (desktop) - just show GIF for now
noBtn.addEventListener('mouseenter', (e) => {
    console.log('Mouse entered NO button');
    showGif();
});

// Mouse leave NO button
noBtn.addEventListener('mouseleave', (e) => {
    console.log('Mouse left NO button');
    gifContainer.classList.remove('show');
});

// Touch on NO button (mobile) - just show GIF for now
noBtn.addEventListener('touchstart', (e) => {
    console.log('Touch on NO button');
    e.preventDefault();
    showGif();
});

/* COMMENTED OUT - Movement logic disabled for testing
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
*/

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
        // If wrapper has already moved (is absolute), reposition it
        if (noButtonWrapper.style.position === 'absolute') {
            const newPosition = getRandomPosition();
            noButtonWrapper.style.left = newPosition.left;
            noButtonWrapper.style.top = newPosition.top;
        }
    }, 250);
});