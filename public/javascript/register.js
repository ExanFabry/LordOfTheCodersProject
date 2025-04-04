document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const usernameInput = document.querySelector("input[name='username']");
    const emailInput = document.querySelector("input[name='email']");
    const passwordInput = document.querySelector("input[name='password']");
    const confirmPasswordInput = document.querySelector("input[name='confirm-password']");
    
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        
        let valid = true;
        
        if (usernameInput.value.trim() === "") {
            showError(usernameInput, "Gebruikersnaam is verplicht");
            valid = false;
        } else {
            removeError(usernameInput);
        }
        
        if (emailInput.value.trim() === "") {
            showError(emailInput, "E-mail is verplicht");
            valid = false;
        } else if (!validateEmail(emailInput.value)) {
            showError(emailInput, "Voer een geldig e-mailadres in");
            valid = false;
        } else {
            removeError(emailInput);
        }
        
        if (passwordInput.value.trim() === "") {
            showError(passwordInput, "Wachtwoord is verplicht");
            valid = false;
        } else if (passwordInput.value.length < 6) {
            showError(passwordInput, "Wachtwoord moet minimaal 6 tekens lang zijn");
            valid = false;
        } else {
            removeError(passwordInput);
        }
        
        if (confirmPasswordInput.value.trim() === "") {
            showError(confirmPasswordInput, "Bevestig je wachtwoord");
            valid = false;
        } else if (confirmPasswordInput.value !== passwordInput.value) {
            showError(confirmPasswordInput, "Wachtwoorden komen niet overeen");
            valid = false;
        } else {
            removeError(confirmPasswordInput);
        }
        
        if (valid) {
            alert("Account succesvol aangemaakt! Je kan nu inloggen met je account!");
            window.location.href = "login.html";
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
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});