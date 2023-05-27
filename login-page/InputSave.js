//*save input value in attribute////////////////////////////////////////////////


function setValue(element, isPassowrd) {
    var newValue;
    var inputValue = element.value;

    if (isPassowrd && element.getAttribute("data-is-shown") == "false") {
        if (inputValue.length > element.getAttribute("value").length) {
            newValue = element.getAttribute("value") + inputValue[inputValue.length - 1];
        }
        else {
            if (element.value.length == 0) newValue = "";
            else newValue = element.getAttribute("value").slice(0, element.value.length);
        }
        var newInputValue = newValue;
        element.setAttribute("value", newValue);

        for (let index = 0; index < element.getAttribute("value").length; index++) {
            newInputValue = setCharAt(newInputValue, index, "●");

        }
        element.value = newInputValue;
    }
    else {
        element.setAttribute("value", inputValue);
    }


}

function setIsChange(id, button) {
    let newValue;
    let input = document.getElementById(id);

    if (document.getElementById(id).getAttribute("data-is-shown") == "true")
        newValue = false;
    else
        newValue = true;

    let toggleClassList = button.classList;

    input.setAttribute("data-is-shown", String(newValue));
    if (newValue) {
        toggleClassList.remove("fa-eye-slash");
        toggleClassList.add("fa-eye");
    }
    else {
        toggleClassList.remove("fa-eye");
        toggleClassList.add("fa-eye-slash");
    }

    if (!newValue) setValue(document.getElementById(id), true);
    else input.value = input.getAttribute("value");
}

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}
//* //////////////////////////////////////////////////////////////////////////////////////