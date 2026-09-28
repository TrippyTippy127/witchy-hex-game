const navButtons = document.querySelectorAll(".game-nav button");
const panels = document.querySelectorAll(".game-panel");

const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const newGameButton = document.getElementById("new-game-button");
const loadGameButton = document.getElementById("load-game-button");

const newGameScreen = document.getElementById("new-game-screen");
const saveNameInput = document.getElementById("save-name-input");
const createGameButton = document.getElementById("create-game-button");
const cancelNewGameButton = document.getElementById("cancel-new-game-button");
const loadGameScreen = document.getElementById("load-game-screen");
const saveSlotsContainer = document.getElementById("save-slots");
const backFromLoadButton = document.getElementById("back-from-load-button");

newGameButton.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  newGameScreen.classList.remove("hidden");
  saveNameInput.focus();
});

cancelNewGameButton.addEventListener("click", () => {
  newGameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");

  saveNameInput.value = "";
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetPanel = button.dataset.panel;

    panels.forEach((panel) => {
      panel.classList.remove("active");
    });

    navButtons.forEach((navButton) => {
      navButton.classList.remove("active");
    });

    document.getElementById(targetPanel).classList.add("active");
    button.classList.add("active");
  });
});

const hexTiles = document.querySelectorAll(".hex-tile");
const tileContents = [
  { type: "herb", icon: "🌿", collectible: true },
  { type: "mushroom", icon: "🍄", collectible: true },
  { type: "rock", icon: "🪨", collectible: true },
  { type: "critter", icon: "🐸", collectible: false },
  { type: "danger", icon: "⚠️", collectible: false },
  { type: "empty", icon: "🌱", collectible: false }
];

const gameMessage = document.getElementById("game-message");

const maxSaveSlots = 5;
let currentSaveSlot = null;
let gameState = null;

function getSaveKey(slotNumber) {
  return `witchyHexSave${slotNumber}`;
}

function getSaveData(slotNumber) {
    const savedData = localStorage.getItem(getSaveKey(slotNumber));

    if (savedData === null) {
        return null;
    }

    try {
        return JSON.parse(savedData);
    } catch (error) {
        console.error(`Could not read save slot ${slotNumber}:`, error);
        return null;
    }
}
  
function renderSaveSlots() {
    saveSlotsContainer.innerHTML = "";

    for (let slotNumber = 1; slotNumber <= maxSaveSlots; slotNumber++) {
        const saveData = getSaveData(slotNumber);

        const slotElement = document.createElement("div");
        slotElement.classList.add("save-slot");

        if (saveData === null) {
            slotElement.innerHTML = `
                <div>
                    <strong>Slot ${slotNumber}</strong>
                    <p>Empty</p>
                </div>
            `;
        } else {
            const saveInfo = document.createElement("div");

            const saveTitle = document.createElement("strong");
            saveTitle.textContent = `Slot ${slotNumber}: ${saveData.saveName || "Unnamed Save"}`;

            const saveDay = document.createElement("p");
            saveDay.textContent = `Day ${saveData.day || 1}`;

            saveInfo.appendChild(saveTitle);
            saveInfo.appendChild(saveDay);

            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("save-slot-buttons");

            const loadButton = document.createElement("button");
            loadButton.textContent = "Load";
            loadButton.addEventListener("click", function () {
                loadSave(slotNumber);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function () {
                deleteSave(slotNumber);
            });

            buttonContainer.appendChild(loadButton);
            buttonContainer.appendChild(deleteButton);

            slotElement.appendChild(saveInfo);
            slotElement.appendChild(buttonContainer);
        }

        saveSlotsContainer.appendChild(slotElement);
      }
    }

function findFirstEmptySaveSlot() {
  for (let slot = 1; slot <= maxSaveSlots; slot++) {
    const saveData = localStorage.getItem(getSaveKey(slot));

    if (saveData === null) {
      return slot;
    }
  }

  return null;
}

function createDefaultGameState(saveName) {
  return {
    saveName: saveName,
    day: 1,
    phase: "exploration",
    movesRemaining: 20,

    gold: 0,
    reputation: 0,

    backpackCapacity: 5,

    inventory: [],

    storage: {
      herb: 0,
      mushroom: 0,
      rock: 0
    },

    critters: [],
    upgrades: [],
    recipes: [],
    orders: []
  };
}

createGameButton.addEventListener("click", () => {
  const saveName = saveNameInput.value.trim();

  if (saveName === "") {
    return;
  }

  const emptySlot = findFirstEmptySaveSlot();

  if (emptySlot === null) {
    alert("All save slots are full.");
    return;
  }

  gameState = createDefaultGameState(saveName);
  currentSaveSlot = emptySlot;

  localStorage.setItem(
    getSaveKey(currentSaveSlot),
    JSON.stringify(gameState)
  );

  newGameScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  
  updateInventoryDisplay();
  updateStorageDisplay();

  saveNameInput.value = "";
});

function loadSave(slotNumber) {
    const saveData = getSaveData(slotNumber);

    if (saveData === null) {
        showMessage("That save slot is empty.");
        return;
    }

    gameState = saveData;
    currentSaveSlot = slotNumber;

    loadGameScreen.classList.add("hidden");
    startScreen.classList.add("hidden");
    newGameScreen.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    updateInventoryDisplay();
    updateStorageDisplay();

    showMessage(`Loaded ${gameState.saveName}.`);
}

function deleteSave(slotNumber) {
    const saveData = getSaveData(slotNumber);

    if (saveData === null) {
        return;
    }

    const confirmed = confirm(
        `Delete "${saveData.saveName}" from Slot ${slotNumber}? This cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(getSaveKey(slotNumber));

    if (currentSaveSlot === slotNumber) {
        currentSaveSlot = null;
        gameState = null;
    }

    renderSaveSlots();
}

function showMessage(message) {
  gameMessage.textContent = message;
}

function getBackpackTotal() {
  return gameState.inventory.length;
}


function getTile(row, col) {
  return document.querySelector(
    `.hex-tile[data-row="${row}"][data-col="${col}"]`
  );
}

function getRandomTileContent() {
  const randomIndex = Math.floor(Math.random() * tileContents.length);

  return tileContents[randomIndex];
}

function getNeighbors(tile) {
  const row = Number(tile.dataset.row);
  const col = Number(tile.dataset.col);

  let neighborPositions;

  if (row % 2 === 0) {
    neighborPositions = [
      [row, col - 1],
      [row, col + 1],
      [row - 1, col],
      [row - 1, col + 1],
      [row + 1, col],
      [row + 1, col + 1]
    ];
  } else {
    neighborPositions = [
      [row, col - 1],
      [row, col + 1],
      [row - 1, col - 1],
      [row - 1, col],
      [row + 1, col - 1],
      [row + 1, col]
    ];
  }

  return neighborPositions
    .map(([neighborRow, neighborCol]) => {
      return getTile(neighborRow, neighborCol);
    })
    .filter((neighbor) => neighbor !== null);
}

function collectResource(tile) {
  const resourceType = tile.dataset.content;

  if (getBackpackTotal() >= gameState.backpackCapacity) {
  showMessage("🎒 Your backpack is full!");
  return;
  }

  const resourceInfo = tileContents.find((item) => {
    return item.type === resourceType;
  });

  const collectedItem = {
    type: resourceType,
    icon: resourceInfo.icon,
    sourceRow: Number(tile.dataset.row),
    sourceCol: Number(tile.dataset.col)
  };

  gameState.inventory.push(collectedItem);
  showMessage(`${resourceInfo.icon} ${resourceType} added to your backpack.`);

  tile.textContent = "";
  tile.dataset.collectible = "false";

  updateInventoryDisplay();
}

function dropItem(index) {
    const item = gameState.inventory[index];

    const sourceTile = getTile(item.sourceRow, item.sourceCol);

    sourceTile.textContent = item.icon;
    sourceTile.dataset.content = item.type;
    sourceTile.dataset.collectible = "true";

    gameState.inventory.splice(index, 1);
    showMessage(`${item.icon} ${item.type} dropped.`);

    updateInventoryDisplay();
  }

function updateInventoryDisplay() {
  const inventoryList = document.getElementById("inventory-list");

  document.getElementById("backpack-count").textContent = getBackpackTotal();
  document.getElementById("backpack-capacity").textContent = gameState.backpackCapacity;

  inventoryList.innerHTML = "";

  if (gameState.inventory.length === 0) {
    inventoryList.innerHTML = "<p>Your backpack is empty.</p>";
    return;
  }

  gameState.inventory.forEach((item, index) => {
    const inventoryItem = document.createElement("div");

    inventoryItem.classList.add("inventory-item");

    inventoryItem.innerHTML = `
      <span>${item.icon} ${item.type}</span>
    `;

    const dropButton = document.createElement("button");

    dropButton.textContent = "Drop";

    dropButton.addEventListener("click", () => {
      dropItem(index);
    });

    inventoryItem.appendChild(dropButton);
    inventoryList.appendChild(inventoryItem);
  });
}

function updateStorageDisplay() {
    document.getElementById("storage-herb").textContent = gameState.storage.herb;
    document.getElementById("storage-mushroom").textContent = gameState.storage.mushroom;
    document.getElementById("storage-rock").textContent = gameState.storage.rock;
}

hexTiles.forEach((tile) => {
  tile.addEventListener("click", () => {

    if (tile.classList.contains("explored")) {

        if (tile.dataset.collectible === "true") {
            collectResource(tile);
        }

    return;
    }

    const neighbors = getNeighbors(tile);

    const hasExploredNeighbor = neighbors.some((neighbor) => {
      return neighbor.classList.contains("explored");
    });

    if (hasExploredNeighbor) {
        const content = getRandomTileContent();

        tile.classList.add("explored");
        tile.textContent = content.icon;

        tile.dataset.content = content.type;
        tile.dataset.collectible = content.collectible;
    }

  });
});

const returnHomeButton = document.getElementById("return-home-button");

returnHomeButton.addEventListener("click", () => {
  returnHome();
});

function returnHome() {
  const itemsStored = gameState.inventory.length;
  
  gameState.inventory.forEach((item) => {
    gameState.storage[item.type] += 1;
  });

  gameState.inventory.length = 0;

  updateInventoryDisplay();
  updateStorageDisplay();

  showMessage(`🏠 Returned home with ${itemsStored} item(s).`);
}

loadGameButton.addEventListener("click", function () {
    startScreen.classList.add("hidden");
    loadGameScreen.classList.remove("hidden");

    renderSaveSlots();
});

backFromLoadButton.addEventListener("click", function () {
    loadGameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
});