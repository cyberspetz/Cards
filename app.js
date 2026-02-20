// ===== Card Data =====
const TOTAL_CARDS = 53;
const deck = [];
for (let i = 0; i < TOTAL_CARDS; i++) {
    deck.push({
        index: i,
        front: `cards/card${i}_front.webp`,
        back: `cards/card${i}_back.webp`
    });
}

const categories = {
    exploration: { title: 'Exploration', subtitle: 'Curiosity', start: 0, end: 11 },
    empathy:     { title: 'Empathy', subtitle: 'Connection', start: 12, end: 21 },
    innovation:  { title: 'Innovation', subtitle: 'Seeing What Isn\'t There Yet', start: 22, end: 31 },
    navigation:  { title: 'Navigation', subtitle: 'Small Steps', start: 32, end: 41 },
    activation:  { title: 'Activation', subtitle: 'Inspired Action', start: 42, end: 52 }
};

// ===== State =====
let currentScreen = 'landing';
let currentCategory = null;
let currentDrawnCard = null;
let spreadCards = [];
let drawReturnScreen = 'landing';

// ===== Navigation =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen-' + id);
    if (screen) {
        screen.classList.add('active');
        currentScreen = id;
        window.scrollTo(0, 0);
    }
}

// Back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        showScreen(target);
    });
});

// ===== Daily Card =====
function getDailyCardIndex() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    // Simple deterministic hash — same card all day, different tomorrow
    // Skip card 0 (rules card) for daily draws
    return 1 + (seed * 2654435761 >>> 0) % (TOTAL_CARDS - 1);
}

function initDailyCard() {
    const idx = getDailyCardIndex();
    const card = deck[idx];
    const dailyEl = document.getElementById('daily-card');
    document.getElementById('daily-front-img').src = card.front;
    document.getElementById('daily-back-img').src = card.back;

    dailyEl.addEventListener('click', () => {
        dailyEl.classList.toggle('flipped');
    });

    // Long press to enlarge
    dailyEl.addEventListener('dblclick', () => {
        openEnlarged(card, 'landing');
    });
}

// ===== Direction Wheel =====
document.querySelectorAll('.wheel-node').forEach((node, index) => {
    node.addEventListener('click', () => {
        const catKey = node.dataset.category;
        currentCategory = catKey;

        // Highlight selected node
        document.querySelectorAll('.wheel-node').forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');

        // Animate mage toward the chosen direction
        const mage = document.getElementById('wheel-mage');
        const angle = index * 72; // degrees clockwise from top
        const rad = angle * Math.PI / 180;
        const dx = Math.sin(rad) * 50;
        const dy = -Math.cos(rad) * 50;
        mage.style.animation = 'none';
        mage.style.transform = `translate(${dx}px, ${dy}px) scale(1.3)`;

        // After animation completes, reset and start draw
        setTimeout(() => {
            mage.style.transform = '';
            mage.style.animation = '';
            node.classList.remove('selected');
            startDraw(catKey);
        }, 600);
    });
});

// ===== Shuffle & Draw (all cards) =====
document.getElementById('btn-shuffle-draw').addEventListener('click', () => {
    currentCategory = null;
    startDraw(null);
});

// ===== Draw Mechanic =====
function getRandomCard(categoryKey) {
    let pool;
    if (categoryKey && categories[categoryKey]) {
        const cat = categories[categoryKey];
        // Exclude card 0 (rules) from draws
        const start = Math.max(cat.start, 1);
        pool = deck.slice(start, cat.end + 1);
    } else {
        pool = deck.slice(1); // exclude card 0
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

function startDraw(categoryKey) {
    const card = getRandomCard(categoryKey);
    currentDrawnCard = card;

    const title = document.getElementById('draw-title');
    if (categoryKey && categories[categoryKey]) {
        title.textContent = categories[categoryKey].title;
    } else {
        title.textContent = 'Shuffle & Draw';
    }

    const drawnEl = document.getElementById('drawn-card');
    drawnEl.classList.add('face-down');
    drawnEl.classList.remove('revealed', 'flipped');

    document.getElementById('drawn-front-img').src = card.front;
    document.getElementById('drawn-back-img').src = card.back;

    document.getElementById('draw-instruction').textContent = 'Tap the card to reveal';
    document.getElementById('draw-instruction').style.display = '';
    document.getElementById('btn-draw-another').style.display = 'none';
    document.getElementById('reflection-area').style.display = 'none';
    document.getElementById('reflection-input').value = '';

    drawReturnScreen = 'landing';
    showScreen('draw');
}

// Card reveal & flip logic
document.getElementById('drawn-card').addEventListener('click', () => {
    const el = document.getElementById('drawn-card');

    if (el.classList.contains('face-down')) {
        // First tap: reveal front
        el.classList.remove('face-down');
        el.classList.add('revealed');
        document.getElementById('draw-instruction').textContent = 'Tap to flip \u2022 Double-tap to enlarge';
        document.getElementById('btn-draw-another').style.display = '';
        document.getElementById('reflection-area').style.display = '';

        // Save to history
        saveToHistory(currentDrawnCard);
    } else {
        // Subsequent taps: flip
        el.classList.toggle('flipped');
    }
});

document.getElementById('drawn-card').addEventListener('dblclick', (e) => {
    e.preventDefault();
    const el = document.getElementById('drawn-card');
    if (!el.classList.contains('face-down') && currentDrawnCard) {
        openEnlarged(currentDrawnCard, 'draw');
    }
});

// Draw another
document.getElementById('btn-draw-another').addEventListener('click', () => {
    startDraw(currentCategory);
});

// ===== 3-Card Spread =====
document.getElementById('btn-three-card').addEventListener('click', () => {
    startSpread(null);
});

function startSpread(categoryKey) {
    // Pick 3 unique cards
    const pool = categoryKey && categories[categoryKey]
        ? deck.slice(Math.max(categories[categoryKey].start, 1), categories[categoryKey].end + 1)
        : deck.slice(1);

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    spreadCards = shuffled.slice(0, 3);

    const cards = document.querySelectorAll('.spread-card');
    cards.forEach((el, i) => {
        el.classList.add('face-down');
        el.classList.remove('revealed', 'flipped');
        const card = spreadCards[i];
        el.querySelector('.spread-card-front img').src = card.front;
        el.querySelector('.spread-card-back img').src = card.back;
    });

    showScreen('spread');
}

// Spread card interactions
document.querySelectorAll('.spread-card').forEach(el => {
    el.addEventListener('click', () => {
        if (el.classList.contains('face-down')) {
            el.classList.remove('face-down');
            el.classList.add('revealed');
        } else {
            el.classList.toggle('flipped');
        }
    });

    el.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (!el.classList.contains('face-down')) {
            const pos = parseInt(el.dataset.pos);
            const card = spreadCards[pos];
            if (card) openEnlarged(card, 'spread');
        }
    });
});

// ===== Enlarged View =====
function openEnlarged(card, returnScreen) {
    document.getElementById('enlarged-front-img').src = card.front;
    document.getElementById('enlarged-back-img').src = card.back;

    // Set the back button to return to the correct screen
    const backBtn = document.querySelector('#screen-enlarged .back-btn');
    backBtn.dataset.target = returnScreen;

    showScreen('enlarged');
}

// ===== Reflection =====
document.getElementById('btn-save-reflection').addEventListener('click', () => {
    const text = document.getElementById('reflection-input').value.trim();
    if (!text || !currentDrawnCard) return;

    saveReflection(currentDrawnCard.index, text);
    document.getElementById('reflection-input').value = '';
    document.getElementById('btn-save-reflection').textContent = 'Saved!';
    setTimeout(() => {
        document.getElementById('btn-save-reflection').textContent = 'Save Reflection';
    }, 1500);
});

// ===== History (localStorage) =====
function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('sm_history') || '[]');
    } catch {
        return [];
    }
}

function saveToHistory(card) {
    const history = getHistory();
    const catName = getCategoryForCard(card.index);
    history.unshift({
        cardIndex: card.index,
        category: catName,
        timestamp: new Date().toISOString(),
        reflection: null
    });
    // Keep last 100 entries
    if (history.length > 100) history.length = 100;
    localStorage.setItem('sm_history', JSON.stringify(history));
}

function saveReflection(cardIndex, text) {
    const history = getHistory();
    // Find the most recent entry for this card
    const entry = history.find(h => h.cardIndex === cardIndex && !h.reflection);
    if (entry) {
        entry.reflection = text;
        localStorage.setItem('sm_history', JSON.stringify(history));
    }
}

function getCategoryForCard(index) {
    for (const [key, cat] of Object.entries(categories)) {
        if (index >= cat.start && index <= cat.end) return cat.title;
    }
    return 'Unknown';
}

function renderHistory() {
    const history = getHistory();
    const list = document.getElementById('history-list');
    const empty = document.getElementById('history-empty');

    list.innerHTML = '';
    if (history.length === 0) {
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';

    history.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-card-preview">
                <img src="${deck[entry.cardIndex].front}" alt="Card ${entry.cardIndex}" />
            </div>
            <div class="history-info">
                <span class="history-category">${entry.category}</span>
                <span class="history-date">${dateStr} at ${timeStr}</span>
                ${entry.reflection ? `<p class="history-reflection">"${entry.reflection}"</p>` : ''}
            </div>
        `;
        item.addEventListener('click', () => {
            openEnlarged(deck[entry.cardIndex], 'history');
        });
        list.appendChild(item);
    });
}

// ===== Browse All =====
function renderBrowse() {
    const container = document.getElementById('browse-categories');
    container.innerHTML = '';

    for (const [key, cat] of Object.entries(categories)) {
        const section = document.createElement('div');
        section.className = 'browse-section';

        const header = document.createElement('h3');
        header.className = 'browse-category-title';
        header.textContent = `${cat.title} (${cat.subtitle})`;
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'browse-grid';

        for (let i = cat.start; i <= cat.end; i++) {
            const card = deck[i];
            const el = document.createElement('div');
            el.className = 'browse-card';
            el.innerHTML = `<img src="${card.front}" alt="Card ${i}" />`;
            el.addEventListener('click', () => {
                openEnlarged(card, 'browse');
            });
            grid.appendChild(el);
        }

        section.appendChild(grid);
        container.appendChild(section);
    }
}

// ===== How to Play — Rules Card =====
function renderRulesCard() {
    const container = document.getElementById('rules-card-container');
    const card = deck[0];
    container.innerHTML = `
        <div class="rules-card-pair">
            <img src="${card.front}" alt="Rules front" class="rules-img" />
            <img src="${card.back}" alt="Rules back" class="rules-img" />
        </div>
    `;
}

// ===== Bottom Nav =====
document.getElementById('btn-how-to-play').addEventListener('click', () => {
    renderRulesCard();
    showScreen('howto');
});

document.getElementById('btn-browse-all').addEventListener('click', () => {
    renderBrowse();
    showScreen('browse');
});

document.getElementById('btn-history').addEventListener('click', () => {
    renderHistory();
    showScreen('history');
});

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        // Force-update: unregister any old service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
            await reg.unregister();
        }
        // Clear all old caches (including the old 'coaching-card-game-cache')
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));

        // Register fresh service worker
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.error('SW registration failed:', err));
    });
}

// ===== Init =====
initDailyCard();
