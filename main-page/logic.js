const monthNamesRu = ['Янв.', 'Февр.', 'Mарт', 'Апр.', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.', 'Нояб.', 'Дек.'];

const deleteButton = document.getElementById("deleteButton");

const recordsBox = document.getElementById("recordsBox");

let editingRecordData;

let myChart;

let notificationsCount = 0;

class userRecord {
    constructor(currentWeight, date, userId, id) {
        this.currentWeight = currentWeight;
        this.date = date;
        this.userId = userId;
        this.id = id;
    }
}

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

const inputData = {
    "weightInput": document.getElementById("weightInput"),
    "dateInput": document.getElementById("dateInput")
};

document.documentElement.addEventListener("load", setup());

//* FRONT LOGIC/////////////////////////////////////////////////////


function setup() {
    awakeSetup();
    setupUserData();
}

function awakeSetup() {
    inputData["dateInput"].max = new Date().toISOString().split("T")[0];
}

function createRecordShowUI() {
    document.getElementById("popup").querySelector(".recordEditBox").querySelector(".recordHeader").innerHTML = "Создать запись";
    deleteButton.style.opacity = "0";
    deleteButton.style.pointerEvents = "none";
    inputData["dateInput"].value = new Date().toISOString().split("T")[0];
    inputData["weightInput"].value = null;
    showUpOrDownPopup(true);
}

function editRecordShowUI(button) {
    let record = button.parentNode.parentNode;
    editingRecordData = new userRecord(
        record.querySelector("#recordWeight").innerHTML,
        unformatDate(record.querySelector("#recordDate").innerHTML),
        1,
        record.getAttribute("data-record-id")
    );

    inputData["weightInput"].value = editingRecordData["currentWeight"];
    inputData["dateInput"].value = editingRecordData["date"];

    deleteButton.style.opacity = "1";
    deleteButton.style.pointerEvents = "all";

    document.getElementById("popup").querySelector(".recordEditBox").querySelector(".recordHeader").innerHTML = "Редактировать запись";
    showUpOrDownPopup(true);
}

function showInputValid(input) {
    let inputClass = input.parentNode;
    if (input.value !== null) {
        inputClass.style.setProperty("--input-main-color", "rgba(57, 141, 236, 0.1)");
        inputClass.style.setProperty("--input-secondary-color", "rgba(118, 159, 205, 0.3)");
        inputClass.style.setProperty("--input-marker-color", "rgba(57, 141, 236, 1)");
    }
}

function showInputError(input) {
    let inputClass = input.parentNode;
    inputClass.style.setProperty("--input-main-color", "rgba(252,232,231,1)");
    inputClass.style.setProperty("--input-secondary-color", "rgba(251,221,220,1)");
    inputClass.style.setProperty("--input-marker-color", "#CA150C");
}

function showUpOrDownPopup(isShowing) {
    if (isShowing) document.getElementById("popup").style.animation = "0.4s ease-out forwards popupShowUp";
    else if (editingRecordData != null) {
        editingRecordData = null;
        document.getElementById("popup").style.animation = "0.4s ease-out forwards popupShowDown";
    } else document.getElementById("popup").style.animation = "0.4s ease-out forwards popupShowDown";
}

function chartRenderOrCreate(weightList, dates) {
    //* SETUP DATA
    let data = [];
    for (let i = 0; i < weightList.length; i++) {
        data.push({x: dateToYearDay(dates[i]), y: weightList[i]});
    }
    //* ANIMATION SETUP
    const totalDuration = 700;
    const delayBetweenPoints = totalDuration / data.length;
    const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
    const animation = {
        x: {
            type: 'number',
            easing: 'linear',
            duration: delayBetweenPoints,
            from: NaN, // the point is initially skipped
            delay(ctx) {
                if (ctx.type !== 'data' || ctx.xStarted) {
                    return 0;
                }
                ctx.xStarted = true;
                return ctx.index * delayBetweenPoints;
            }
        },
        y: {
            type: 'number',
            easing: 'linear',
            duration: delayBetweenPoints,
            from: previousY,
            delay(ctx) {
                if (ctx.type !== 'data' || ctx.yStarted) {
                    return 0;
                }
                ctx.yStarted = true;
                return ctx.index * delayBetweenPoints;
            }
        }
    };
    //* CONFIG SETUP
    const config = {
        type: "line",
        data: {
            datasets: [{
                label: "Вес",
                borderColor: "#769FCD",
                data: data,
                drawActiveElementsOnTop: true,
                borderWidth: 3,
                radius: 3,
                pointBackgroundColor: "#B9D7EA"
            }]
        },
        options: {
            maintainAspectRatio: false,
            radius: 5,
            hitRadius: 30,
            hoverRadius: 10,
            responsive: true,
            animation: animation,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    boxWidth: 10,
                    displayColors: false,
                    callbacks: {
                        title: function (value) {
                            return yearDayToMonthDate(value[0]["label"]);
                        }
                    },
                    titleFont: {
                        size: 18,
                        family: "Montserrat",
                        weight: 500
                    },
                    bodyFont: {
                        size: 13,
                        family: "Montserrat",
                        weight: 300
                    },
                    caretSize: 5,
                }
            },
            scales: {
                y: {
                    grid: {
                        color: "rgba(118, 159, 205, 0.3)"
                    },
                    ticks: {
                        color: "#769FCD",
                        font: {
                            size: 20,
                            weight: 300,
                            family: "Roboto"
                        }
                    }
                },
                x: {
                    type: "linear",
                    grid: {
                        color: "rgba(118, 159, 205, 0.3)"
                    },
                    ticks: {
                        color: "#769FCD",
                        font: {
                            size: 20,
                            weight: 300,
                            family: "Roboto"
                        },

                        callback: function (value) {
                            return yearDayToMonthDate(value);
                        }
                    }
                }
            },
        }
    };
    //* RENDER THE CHART
    //*                         UPDATE CHART WITHOUT ANIMATION
    /*                          if (myChart != null) {
                                    myChart.data.datasets[0].data = data;
                                    myChart.update();
                                }
                                else {
                                    myChart = new Chart(document.getElementById("myChart").getContext("2d"), config);
        }*/
    if (myChart != null) myChart.destroy();
    myChart = new Chart(document.getElementById("myChart").getContext("2d"), config);

}

async function setupBar(progressPercents) {
    progressPercents = Math.round(progressPercents * 100);
    let number = document.getElementById("barNumber");
    let counter = 0;
    setInterval(() => {
        if (counter === progressPercents) clearInterval();
        else {
            counter++;

            number.innerHTML = counter + "%";
        }
    }, 20)
    document.getElementById("fillBar").style.animation = "unfillProgressGoalBar 0s ease-out forwards";
    document.documentElement.style.setProperty("--bar-end-width", progressPercents + "%");
    await sleep(1);
    document.getElementById("fillBar").style.animation = "fillProgressGoalBar 1.5s ease-out forwards";
}

function setupStatsAndMetrics(currentWeight, startWeight, startDate, supposedDate, kgPerDay, kgPerWeek, goal, lostKg, remainKg) {
    document.getElementById("currentWeight").innerHTML = currentWeight;
    document.getElementById("startWeight").innerHTML = startWeight;
    document.getElementById("startDate").innerHTML = formatDate(startDate);
    document.getElementById("perDay").innerHTML = kgPerDay;
    document.getElementById("perWeek").innerHTML = kgPerWeek;
    document.getElementById("supposedDate").innerHTML = formatDate(supposedDate);
    document.getElementById("goal").innerHTML = goal;
    document.getElementById("lost").innerHTML = lostKg;
    document.getElementById("remain").innerHTML = remainKg;
}

function setupRecords(recordsList) {
    //* deleting all records except one
    while (recordsBox.getElementsByTagName("tr").length > 1) {
        recordsBox.removeChild(recordsBox.lastChild);
    }
    //* making clones of that record and updating them
    let copy = recordsBox.getElementsByTagName("tr")[0];
    for (let record of recordsList.reverse()) {
        let clone = copy.cloneNode(true);
        clone.querySelector("#recordDate").innerHTML = formatDate(record["date"]);
        clone.querySelector("#recordWeight").innerHTML = record["currentWeight"];
        clone.setAttribute("data-record-id", record["id"]);
        copy.after(clone);
        copy = clone;
    }
    //* deleting that “parent” record
    recordsBox.getElementsByTagName("tr")[0].remove();
}

async function showNotification(noteType, bodyText) {
    let headerText;
    let colorPalette;
    switch (noteType) {
        case "UNEXPECTED":
            colorPalette = "#FF7676";
            headerText = "Ошибка! Повторите попытку позже.";
            break;
        case "VALIDATION":
            colorPalette = "#FFFCA8";
            headerText = "Упс, что-то пошло не так!";
            break;
        case "success":
            colorPalette = "#B8FFB7";
            headerText = "Отлично!";
            break;
        default:
            colorPalette = "#FF7676";
            headerText = "Непредвиденная ошибка!";
            break;
    }
    let copy = document.getElementById("notification");
    let clone = copy.cloneNode(true);
    copy.before(clone);
    clone.id = "notification" + notificationsCount;
    notificationsCount++;
    let fillNoteBar = clone.querySelector(".noteProgress").querySelector(".progressFill");

    clone.style.borderColor = colorPalette;
    clone.querySelector(".noteHeader").querySelector("span").innerHTML = headerText;
    clone.querySelector(".noteBody").querySelector("span").innerHTML = bodyText;
    fillNoteBar.style.backgroundColor = colorPalette;
    clone.style.animation = "1s ease-out forwards noteShowUp";
    fillNoteBar.style.animation = "1s ease-out forwards fillBar";

    clone.addEventListener("animationend", async () => {
        fillNoteBar.style.animation = "4s linear forwards unfillBar";
        await sleep(4000);
        clone.style.animation = "1s ease-out forwards noteShowDown";
        await sleep(1000);
        clone.remove();
    });
}

function validateInputFields() {
    let isValid = true;
    if (inputData["weightInput"].value == null || inputData["weightInput"].value === "" || inputData["weightInput"].value < 0) {
        showInputError(inputData["weightInput"]);
        isValid = false;
    }
    if (!Date.parse(inputData["dateInput"].value)){
        showInputError(inputData["dateInput"]);
        isValid = false;
    }
    return isValid;
}

//* //////////////////////////////////////////////////////////////////////////

//* BACK LOGIC/////////////////////////////////////////////////////

function saveChanges() {
    if (!validateInputFields()) return;
    if (editingRecordData != null) updateRecord();
    else createRecord(new userRecord(inputData["weightInput"].value, inputData["dateInput"].value, 1));
}

function setupUserData() {
    fetch('http://80.78.254.170:9092/summary?id=1')
        .then(response => {
            response.json().then(data => {
                let userDTO = data["userDTO"];
                //* chartCreate
                let weightList = [];
                let datesList = [];
                weightList.push(userDTO["initialWeight"]);
                datesList.push(new Date(userDTO["startDate"]));
                for (let item of data["recordDTOList"]) {
                    weightList.push(item["currentWeight"]);
                    datesList.push(new Date(item["date"]));
                }
                chartRenderOrCreate(weightList, datesList);
                //* progress bar setup
                setupBar(userDTO["progress"]);
                //* records setup
                setupRecords(data["recordDTOList"]);
                //* setup stats
                setupStatsAndMetrics(
                    userDTO["currentWeight"],
                    userDTO["initialWeight"],
                    userDTO["startDate"],
                    userDTO["plannedDate"],
                    userDTO["perDay"],
                    userDTO["perWeek"],
                    userDTO["goalWeight"],
                    userDTO["weightLost"],
                    userDTO["weightLeft"]);
            });
        }).catch(function () {
    });
}

function createRecord(newRecord) {
    fetch('http://80.78.254.170:9092/record', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRecord)
    })
        .then(response => {
            if (response.status === 200) {
                showUpOrDownPopup(false);
                setupUserData();
            } else {
                response.json().then(data => showNotification(data["type"], data["msg"]));
            }
        }).catch(() => {
        showNotification("UNEXPECTED", "Мы не смогли отправить запрос серверу.");
    });
}

function deleteRecord() {
    deleteButton.style.pointerEvents = "none";
    fetch('http://80.78.254.170:9092/record?id=' + editingRecordData["id"], {method: 'DELETE'})
        .then(response => {
            if (response.status === 200) {
                showUpOrDownPopup(false);
                setupUserData();
                response.text().then(data => showNotification("success", data));
            } else {
                response.json().then(data => showNotification(data["type"], data["msg"]));
            }
        }).catch(() => {
        showNotification("UNEXPECTED", "Мы не смогли отправить запрос серверу.");
    });
}

function updateRecord() {
    let editedRecord = editingRecordData;
    editedRecord["currentWeight"] = inputData["weightInput"].value;
    editedRecord["date"] = inputData["dateInput"].value;

    fetch('http://80.78.254.170:9092/record', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedRecord)
    })
        .then(response => {
            if (response.status === 200) {
                showUpOrDownPopup(false);
                setupUserData();
            } else {
                response.json().then(data => showNotification(data["type"], data["msg"]));
            }
        }).catch(() => {
        showNotification("UNEXPECTED", "Мы не смогли отправить запрос серверу.")
    });
}

function formatDate(userDate) {
    let date = new Date(userDate);
    let month = date.toLocaleString('ru', {month: 'short'}).capitalize();
    let day = date.getDate();
    let year = date.getFullYear();
    return day + ' ' + month + ' ' + year;
}

function unformatDate(stringDate) {
    let dateParts = stringDate.split(" ");
    let date = new Date(dateParts[2], monthNamesRu.indexOf(dateParts[1]), dateParts[0]);
    let year = date.toLocaleString("default", {year: "numeric"});
    let month = date.toLocaleString("default", {month: "2-digit"});
    let day = date.toLocaleString("default", {day: "2-digit"});
    return year + "-" + month + "-" + day;
}

function dateToYearDay(date) {
    let current = new Date(date.getTime());
    let previous = new Date(date.getFullYear(), 0, 1);

    return Math.ceil((current - previous + 1) / 86400000);
}

function yearDayToMonthDate(day) {
    let date = new Date(2023, 0, day);
    return date.toLocaleString('ru', {month: 'short'}).capitalize() + ' ' + date.getDate();
}


const sleep = async (milliseconds) => {
    await new Promise(resolve => {
        return setTimeout(resolve, milliseconds)
    });
};

//* //////////////////////////////////////////////////////////////////////////

