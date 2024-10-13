const deck = [];
const categories = {
    exploration: { start: 0, end: 11, gridId: 'exploration-grid' },
    empathy: { start: 12, end: 21, gridId: 'empathy-grid' },
    innovation: { start: 22, end: 31, gridId: 'innovation-grid' },
    navigation: { start: 32, end: 41, gridId: 'navigation-grid' },
    activation: { start: 42, end: 52, gridId: 'activation-grid' },
};

// Make sure the correct front and back images for the deck are loaded
for (let i = 0; i < 53; i++) {
    deck.push({
        front: `cards/card${i}_front.png`,  // Correct path to the front image
        back: `cards/card${i}_back.png`     // Correct path to the back image
    });
}

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

        // Add event listener to flip the card when clicked
        cardElement.addEventListener('click', () => {
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
