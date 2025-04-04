document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const usernameInput = document.querySelector("input[name='username']");
    const passwordInput = document.querySelector("input[name='password']");
    
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        
        let valid = true;
        
        if (usernameInput.value.trim() === "") {
            showError(usernameInput, "Gebruikersnaam is verplicht");
            valid = false;
        } else {
            removeError(usernameInput);
        }
        
        if (passwordInput.value.trim() === "") {
            showError(passwordInput, "Wachtwoord is verplicht");
            valid = false;
        } else {
            removeError(passwordInput);
        }
        
        if (valid) {
            // Succesvolle login 'forceren', later vervangen door back-end
            alert("Succesvol ingelogd!");
            window.location.href = "homepage.html";
        }
    });
    
    function showError(input, message) {
        removeError(input);
        const error = document.createElement("p");
        error.className = "error-message";
        error.textContent = message;
        error.style.color = "red";
        error.style.fontSize = "0.9rem";
        error.style.marginTop = "5px";
        input.classList.add("error-input");
        input.parentNode.insertBefore(error, input.nextSibling);
    }
    
    function removeError(input) {
        input.classList.remove("error-input");
        const existingError = input.parentNode.querySelector(".error-message");
        if (existingError) {
            existingError.remove();
        }
    }
});
