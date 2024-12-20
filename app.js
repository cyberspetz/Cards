// Sample card data with front and back images
const deck = [];

// Make sure the correct front and back images for the deck are loaded
for (let i = 0; i < 53; i++) {
    deck.push({
        front: `cards/card${i}_front.png`,  // Correct path to the front image
        back: `cards/card${i}_back.png`     // Correct path to the back image
    });
}

// Card categories
const categories = {
    exploration: { title: "Exploration (Curiosity)", start: 0, end: 11, gridId: "exploration-grid" },
    empathy: { title: "Empathy (Connection)", start: 12, end: 21, gridId: "empathy-grid" },
    innovation: { title: "Innovation (Seeing what isn’t there yet)", start: 22, end: 31, gridId: "innovation-grid" },
    navigation: { title: "Navigation (Small Steps)", start: 32, end: 41, gridId: "navigation-grid" },
    activation: { title: "Activation (Inspired Action)", start: 42, end: 52, gridId: "activation-grid" }
};

// Function to create the card grid for each category
function createCardGrid(category) {
    const grid = document.getElementById(category.gridId);

    for (let i = category.start; i <= category.end; i++) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        // handle separatly a first card to mark for the rules.
        if (i==0) {
            cardElement.classList.add('card-0');
        }
        cardElement.setAttribute('data-index', i);

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${deck[i].front}" alt="Card ${i} Front" />
                </div>
                <div class="card-back">
                    <img src="${deck[i].back}" alt="Card ${i} Back" />
                </div>
            </div>
        `;

        // Add event listener to handle flip and enlarge/shrink
        cardElement.addEventListener('click', (event) => {
            // If the card is already enlarged, shrink it back
            if (cardElement.classList.contains('enlarged')) {
                cardElement.classList.remove('enlarged');
            } else {
                // Enlarge the card to fullscreen
                cardElement.classList.add('enlarged');
            }

            // Toggle the flip when card is clicked
            cardElement.classList.toggle('flipped');
        });

        // Append card to the grid
        grid.appendChild(cardElement);
    }
}

// Generate the card grids for each category
for (const key in categories) {
    createCardGrid(categories[key]);
}

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function () {
        const frontImage = this.querySelector('.card-front img').src;
        const backImage = this.querySelector('.card-back img').src;

        const enlargedView = document.getElementById('enlarged-view');
        const frontContainer = document.querySelector('.enlarged-card-front');
        const backContainer = document.querySelector('.enlarged-card-back');

        // Show the front and back images in the enlarged view
        frontContainer.innerHTML = `<img src="${frontImage}" alt="Card Front">`;
        backContainer.innerHTML = `<img src="${backImage}" alt="Card Back">`;

        // Show the enlarged view
        enlargedView.classList.add('visible');
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}



// Add event listener to close enlarged view on click
document.getElementById('enlarged-view').addEventListener('click', function () {
    this.classList.remove('visible');
});

