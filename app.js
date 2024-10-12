const deck = [];
for (let i = 1; i <= 52; i++) {
    deck.push({
        front: `/cards/card${i}_front.png`,
        back: `/cards/card${i}_back.png`
    });
}

let currentCard = null;
let isFrontSide = true;

var elem = document.querySelector('input[type="range"]');
var target = document.querySelector('.value');

var rangeValue = function(){
var newValue = elem.value;
  
  
}

elem.addEventListener("input", selectCard);


// Select a card from the deck based on user input
function selectCard() {

    const cardNumber = elem.value;;
    newValue = elem.value;
    target.innerHTML = newValue;
    
    if (isNaN(cardNumber) || cardNumber < 1 || cardNumber > 52) {
        alert("Please enter a valid card number (1-52).");
        return;
    }

    currentCard = deck[cardNumber - 1];
    isFrontSide = true;
    document.getElementById('card').src = currentCard.front;
}

// Select a card from the deck based on user input
function luckyCard() {
    const cardNumber = Math.floor(Math.random() * 52) + 1;

    if (isNaN(cardNumber) || cardNumber < 1 || cardNumber > 52) {
        alert("Please enter a valid card number (1-52).");
        return;
    }

    currentCard = deck[cardNumber - 1];
    isFrontSide = true;
  
    target.innerHTML = cardNumber;
    document.getElementById('card').src = currentCard.front;
}

// Flip the card on tap
function flipCard() {
    if (!currentCard) {
        alert("Please select a card first!");
        return;
    }

    if (isFrontSide) {
        document.getElementById('card').src = currentCard.back;
    } else {
        document.getElementById('card').src = currentCard.front;
    }

    isFrontSide = !isFrontSide;
}


