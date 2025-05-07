document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("popup");
    const closePopup = document.getElementById("close-popup");
    const popupActionButton = document.getElementById("popup-action-button");
    const blacklistButton = document.getElementById("Blacklist-Button");
  
    // Functie om de popup te tonen
    function showPopup() {
      popup.classList.remove("hidden");
    }
  
    // Functie om de popup te verbergen
    function hidePopup() {
      popup.classList.add("hidden");
    }
  
    // Sluit de popup bij klikken op de sluitknop
    closePopup.addEventListener("click", hidePopup);
  
    // Optioneel: voeg een actie toe aan de knop in de popup
    popupActionButton.addEventListener("click", () => {
      alert("Actie uitgevoerd!");
      hidePopup();
    });
  
    blacklistButton.addEventListener("click", () => {
      showPopup();
    });
  });