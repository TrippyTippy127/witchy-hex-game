const navButtons = document.querySelectorAll(".game-nav button");
const panels = document.querySelectorAll(".game-panel");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetPanel = button.dataset.panel;

    panels.forEach((panel) => {
      panel.classList.remove("active");
    });

    document.getElementById(targetPanel).classList.add("active");
  });
});
