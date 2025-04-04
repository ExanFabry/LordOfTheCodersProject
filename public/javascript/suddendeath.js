const karakterButtons = document.querySelectorAll("#karakter button");
const filmButtons = document.querySelectorAll("#film button");
const favoriteButtons = document.querySelectorAll("#Favorite-Button");
const blacklistButtons = document.querySelectorAll("#Blacklist-Button");

function changeButtonColor(button) {
  button.classList.toggle("active");

  const parent = button.parentElement;
  const siblings = parent.querySelectorAll("button");
  siblings.forEach((sibling) => {
    if (sibling !== button) {
      sibling.classList.remove("active");
    }
  });
}
function changeImage(button) {
  document.getElementById("favBut").src = "/assets/heart.png";
}
function changeImage10(button) {
  document.getElementById("blackBut").src = "/assets/forbidden.png";
}

karakterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeButtonColor(button);
  });
});

filmButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeButtonColor(button);
  });
});

favoriteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeImage(button);
  });
});

blacklistButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeImage10(button);
  });
});
