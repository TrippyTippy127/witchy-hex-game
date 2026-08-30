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

function getTile(row, col) {
  return document.querySelector(
    `.hex-tile[data-row="${row}"][data-col="${col}"]`
  );
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

hexTiles.forEach((tile) => {
  tile.addEventListener("click", () => {

    if (tile.classList.contains("explored")) {
      return;
    }

    const neighbors = getNeighbors(tile);

    const hasExploredNeighbor = neighbors.some((neighbor) => {
      return neighbor.classList.contains("explored");
    });

    if (hasExploredNeighbor) {
      tile.classList.add("explored");
    }

  });
});