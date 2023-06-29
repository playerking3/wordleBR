// Criação das cartas
const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const cards = [];

for (let suit of suits) {
  for (let rank of ranks) {
    cards.push({ suit, rank });
  }
}

// Embaralha as cartas
shuffle(cards);

// Distribui as cartas nas pilhas
const tableauPiles = [];
const foundationPiles = [];

for (let i = 0; i < 10; i++) {
  tableauPiles.push([]);
}

for (let i = 0; i < 8; i++) {
  foundationPiles.push([]);
}

for (let i = 0; i < tableauPiles.length; i++) {
  for (let j = 0; j < i + 5; j++) {
    let card = cards.pop();
    if (j === i + 4) {
      card.faceUp = true;
    } else {
      card.faceUp = false;
    }
    tableauPiles[i].push(card);
  }
}

// Função para embaralhar as cartas
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Função para criar uma carta HTML
function createCardElement(card) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.innerHTML = `<div class="card-suit">${card.suit}</div><div class="card-rank">${card.rank}</div>`;
  if (!card.faceUp) {
    cardElement.classList.add("card-back");
  }
  return cardElement;
}

// Função para atualizar as pilhas de cartas na tela
function updatePiles() {
  stockElement.innerHTML = "";

  for (let card of cards) {
    const cardElement = createCardElement(card);
    stockElement.appendChild(cardElement);
  }

  tableauElement.innerHTML = "";

  for (let pile of tableauPiles) {
    const pileElement = document.createElement("div");
    pileElement.className = "pile";

    for (let card of pile) {
      const cardElement = createCardElement(card);
      pileElement.appendChild(cardElement);
    }

    tableauElement.appendChild(pileElement);
  }

  foundationElement.innerHTML = "";

  for (let pile of foundationPiles) {
    const pileElement = document.createElement("div");
    pileElement.className = "pile";

    for (let card of pile) {
      const cardElement = createCardElement(card);
      pileElement.appendChild(cardElement);
    }

    foundationElement.appendChild(pileElement);
  }
}

// Variáveis de estado do jogo
let selectedCard = null;
let sourcePile = null;
let validMoves = [];

// Função para selecionar uma carta
function selectCard(card, pile) {
  if (!card.faceUp) {
    return;
  }

  if (selectedCard === card) {
    card.classList.remove("selected");
    selectedCard = null;
    sourcePile = null;
    validMoves = [];
  } else if (validMoves.includes(pile)) {
    card.classList.add("selected");
    if (selectedCard) {
      moveCard(selectedCard, sourcePile, card, pile);
    } else {
      selectedCard = card;
      sourcePile = pile;
    }
  } else {
    if (selectedCard) {
      selectedCard.classList.remove("selected");
    }
    card.classList.add("selected");
    selectedCard = card;
    sourcePile = pile;
    validMoves = getValidMoves(card);
  }
}

// Função para mover uma carta de uma pilha para outra
function moveCard(card, sourcePile, targetCard, targetPile) {
  const cardsToMove = sourcePile.splice(sourcePile.indexOf(card));

  for (let i = 0; i < cardsToMove.length; i++) {
    targetPile.push(cardsToMove[i]);
    if (i === cardsToMove.length - 1) {
      cardsToMove[i].faceUp = true;
    }
  }

  updatePiles();
  checkForWin();
}

// Função para obter as pilhas válidas para mover uma carta
function getValidMoves(card) {
  const validMoves = [];
  for (let i = 0; i < tableauPiles.length; i++) {
    const pile = tableauPiles[i];
    if (pile.length === 0) {
      validMoves.push(pile);
    } else {
      const topCard = pile[pile.length - 1];
      if (canStack(card, topCard)) {
        validMoves.push(pile);
      }
    }
  }
  for (let i = 0; i < foundationPiles.length; i++) {
    const pile = foundationPiles[i];
    const topCard = pile[pile.length - 1];
    if (canStack(card, topCard)) {
      validMoves.push(pile);
    }
  }
  return validMoves;
}

// Função para verificar se uma carta pode ser empilhada em cima de outra
function canStack(card1, card2) {
  const isDifferentColor = (card1.suit === "♠" || card1.suit === "♣") && (card2.suit === "♥" || card2.suit === "♦");
  const isSequentialRank = ranks.indexOf(card1.rank) + 1 === ranks.indexOf(card2.rank);
  return isDifferentColor && isSequentialRank;
}

// Função para verificar se o jogador venceu o jogo
function checkForWin() {
  let win = true;
  for (let pile of foundationPiles) {
    if (pile.length < 13) {
      win = false;
      break;
    }
  }
  if (win) {
    document.getElementById("message").textContent = "Parabéns! Você venceu!";
    document.getElementById("restart-button").style.display = "block";
  }
}

// Função para reiniciar o jogo
function restartGame() {
  location.reload();
}

// Adiciona eventos de clique às pilhas de cartas
stockElement.addEventListener("click", function () {
  if (cards.length > 0) {
    cards[cards.length - 1].faceUp = true;
    updatePiles();
  }
});

tableauElement.addEventListener("click", function (event) {
  const cardElement = event.target.closest(".card");
  const pileElement = event.target.closest(".pile");

  if (cardElement && pileElement) {
    const pileIndex = Array.from(pileElement.parentNode.children).indexOf(pileElement);
    const cardIndex = Array.from(pileElement.children).indexOf(cardElement);
    const pile = tableauPiles[pileIndex];
    const card = pile[cardIndex];

    selectCard(cardElement, pile);
  }
});

foundationElement.addEventListener("click", function (event) {
  const cardElement = event.target.closest(".card");
  const pileElement = event.target.closest(".pile");

  if (cardElement && pileElement) {
    const pileIndex = Array.from(pileElement.parentNode.children).indexOf(pileElement);
    const pile = foundationPiles[pileIndex];
    const card = pile[pile.length - 1];

    selectCard(cardElement, pile);
  }
});

// Adiciona evento de reiniciar jogo ao botão de reiniciar
document.getElementById("restart-button").addEventListener("click", restartGame);
