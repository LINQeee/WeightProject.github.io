var signInHeader = document.getElementById("signIn");
var signUpHeader = document.getElementById("signUp");
var biologyData = document.getElementById("biologyData");
var usernameFormInput = document.getElementById("usernameFormInput");
var rememberMeFormInput = document.getElementById("rememberMeForm");
var submitButton = document.getElementById("submitButton");

var isLogin = true;

const inputData = {
    "username": document.getElementById("usernameInput"),
    "email": document.getElementById("emailInput"),
    "password": document.getElementById("passwordInput"),
    "isRememberMe": document.getElementById("rememberMeInput"),
    "height": document.getElementById("heightInput"),
    "gender": document.getElementById("genderInput")
};

function switchToSignUp() {
    if (!isLogin) return;

    isLogin = false;

    signInHeader.classList.remove("activeHeader");
    signInHeader.classList.add("disabledHeader");
    signInHeader.children[0].classList.remove("activeBorder");
    signInHeader.children[0].classList.add("disabledBorder");



    signUpHeader.classList.remove("disabledHeader");
    signUpHeader.classList.add("activeHeader");
    signUpHeader.children[0].classList.remove("disabledBorder");
    signUpHeader.children[0].classList.add("activeBorder");

    rememberMeFormInput.style.marginTop = "5%";

    biologyData.style.pointerEvents = "all";
    biologyData.style.height = "15%";
    biologyData.style.opacity = "1";

    usernameFormInput.style.marginTop = "9%";
    usernameFormInput.style.opacity = "1";
    usernameFormInput.style.pointerEvents = "all";

    textAnimation(submitButton, "ЗАРЕГИСТРИРОВАТЬСЯ");
}

function switchToSignIn() {
    if (isLogin) return;

    isLogin = true;

    signUpHeader.classList.remove("activeHeader");
    signUpHeader.classList.add("disabledHeader");
    signUpHeader.children[0].classList.remove("activeBorder");
    signUpHeader.children[0].classList.add("disabledBorder");



    signInHeader.classList.remove("disabledHeader");
    signInHeader.classList.add("activeHeader");
    signInHeader.children[0].classList.remove("disabledBorder");
    signInHeader.children[0].classList.add("activeBorder");

    rememberMeFormInput.style.marginTop = "13%";

    biologyData.style.pointerEvents = "none";
    biologyData.style.height = "0%";
    biologyData.style.opacity = "0";

    usernameFormInput.style.marginTop = "0%";
    usernameFormInput.style.opacity = "0";
    usernameFormInput.style.pointerEvents = "none";

    inputData["username"].value = null;
    inputData["height"].value = null;
    inputData["gender"].checked = true;

    textAnimation(submitButton, "ВОЙТИ");
}

async function textAnimation(element, newText) {
    let text = element.innerHTML;
    for (let i = text.length - 1; i >= 0; i--) {
        await sleep(20);
        element.innerHTML = text.slice(0, i);
    }

    for (let i = 0; i <= newText.length; i++) {
        await sleep(20);
        element.innerHTML = newText.slice(0, i);
    }

}

const sleep = async (milliseconds) => {
    await new Promise(resolve => {
        return setTimeout(resolve, milliseconds)
    });
};