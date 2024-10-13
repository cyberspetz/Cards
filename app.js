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
