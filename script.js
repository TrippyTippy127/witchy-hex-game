const navButtons = document.querySelectorAll(".game-nav button");
const panels = document.querySelectorAll(".game-panel");

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
const inventory = {
  herb: 0,
  mushroom: 0,
  rock: 0
};


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
  const resource = tile.dataset.content;

  inventory[resource] += 1;

  tile.textContent = "";
  tile.dataset.collectible = "false";

  updateInventoryDisplay();
}

function updateInventoryDisplay() {
  document.getElementById("herb-count").textContent = inventory.herb;
  document.getElementById("mushroom-count").textContent = inventory.mushroom;
  document.getElementById("rock-count").textContent = inventory.rock;
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