const navButtons = document.querySelectorAll(".game-nav button");
const panels = document.querySelectorAll(".game-panel");

const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const newGameButton = document.getElementById("new-game-button");
const loadGameButton = document.getElementById("load-game-button");

newGameButton.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
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
const inventory = [];
let backpackCapacity = 5;
const storage = {
  herb: 0,
  mushroom: 0,
  rock: 0
};
const gameMessage = document.getElementById("game-message");

function showMessage(message) {
  gameMessage.textContent = message;
}

function getBackpackTotal() {
  return inventory.length;
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

  if (getBackpackTotal() >= backpackCapacity) {
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

  inventory.push(collectedItem);
  showMessage(`${resourceInfo.icon} ${resourceType} added to your backpack.`);

  tile.textContent = "";
  tile.dataset.collectible = "false";

  updateInventoryDisplay();
}

function dropItem(index) {
    const item = inventory[index];

    const sourceTile = getTile(item.sourceRow, item.sourceCol);

    sourceTile.textContent = item.icon;
    sourceTile.dataset.content = item.type;
    sourceTile.dataset.collectible = "true";

    inventory.splice(index, 1);
    showMessage(`${item.icon} ${item.type} dropped.`);

    updateInventoryDisplay();
  }

function updateInventoryDisplay() {
  const inventoryList = document.getElementById("inventory-list");

  document.getElementById("backpack-count").textContent = getBackpackTotal();
  document.getElementById("backpack-capacity").textContent = backpackCapacity;

  inventoryList.innerHTML = "";

  if (inventory.length === 0) {
    inventoryList.innerHTML = "<p>Your backpack is empty.</p>";
    return;
  }

  inventory.forEach((item, index) => {
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
    document.getElementById("storage-herb").textContent = storage.herb;
    document.getElementById("storage-mushroom").textContent = storage.mushroom;
    document.getElementById("storage-rock").textContent = storage.rock;
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
  const itemsStored = inventory.length;
  
  inventory.forEach((item) => {
    storage[item.type] += 1;
  });

  inventory.length = 0;

  updateInventoryDisplay();
  updateStorageDisplay();

  showMessage(`🏠 Returned home with ${itemsStored} item(s).`);
}
