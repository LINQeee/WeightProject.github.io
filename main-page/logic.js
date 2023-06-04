const recordsBox = document.getElementById("recordsBox");

let editingRecord = [];

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

const inputData = {
    "currentWeight": document.getElementById("weightInput"),
    "dateInput": document.getElementById("dateInput")
};

document.documentElement.addEventListener("load", setup());

//* FRONT LOGIC/////////////////////////////////////////////////////


function setup() {
    //awakeSetup();
    setupUserData();
}

function awakeSetup() {
    inputData["dateInput"].max = new Date().toISOString().split("T")[0];
    inputData["currentWeight"].value = null;
    document.getElementById("recordDate").max = new Date().toISOString().split("T")[0];
}

function chartRenderOrCreate(weightList, dates) {
    //* SETUP DATA
    let data = [];
    for (let i = 0; i < weightList.length; i++) {
        data.push({x: dateToYearDay(dates[i]), y: weightList[i]});
    }
    //* ANIMATION SETUP
    const totalDuration = 1500;
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
                borderColor: "#00ADB5",
                data: data,
                drawActiveElementsOnTop: true,
                borderWidth: 5,
                radius: 2,
                pointBackgroundColor: "#00E1EC"
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
                        color: "rgba(238, 238, 238, 0.2)"
                    },
                    ticks: {
                        color: "#00ADB5",
                        font: {
                            size: 20,
                            weight: 300,
                            family: "Montserrat"
                        }
                    }
                },
                x: {
                    type: "linear",
                    grid: {
                        color: "rgba(238, 238, 238, 0.2)"
                    },
                    ticks: {
                        color: "#00ADB5",
                        font: {
                            size: 20,
                            weight: 300,
                            family: "Montserrat"
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
    document.getElementById("fillBar").style.animation = "fillProgressGoalBar 2s ease-out forwards";
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
    while (recordsBox.getElementsByTagName("li").length > 1) {
        recordsBox.removeChild(recordsBox.lastChild);
    }
    //* making clones of that record and updating them
    let copy = recordsBox.getElementsByTagName("li")[0];
    for (let record of recordsList.reverse()) {
        let clone = copy.cloneNode(true);
        clone.querySelector("#recordDate").value = record["date"];
        clone.querySelector("#recordWeight").value = record["currentWeight"];
        clone.setAttribute("data-record-id", record["id"]);
        copy.after(clone);
        copy = clone;
    }
    //* deleting that “parent” record
    recordsBox.getElementsByTagName("li")[0].remove();
}

function enableEditMode(button) {

    button.parentNode.querySelector("#recordDate").removeAttribute("disabled");
    button.parentNode.querySelector("#recordWeight").removeAttribute("disabled");
    button.parentNode.parentNode.querySelector("#saveButtons").style.display = "flex";
    editingRecord = button;
    let currentWeight = button.parentNode.querySelector("#recordWeight").value;
    let date = button.parentNode.querySelector("#recordDate").value;
    editingRecordData = new userRecord(currentWeight, date, 1);
    recordButtonsChangeAvailability(true);
}

function disableEditMode() {
    editingRecord.parentNode.querySelector("#recordDate").setAttribute("disabled", "disabled");
    editingRecord.parentNode.querySelector("#recordWeight").setAttribute("disabled", "disabled");
    editingRecord.parentNode.querySelector("#recordDate").value = editingRecordData["date"];
    editingRecord.parentNode.querySelector("#recordWeight").value = editingRecordData["currentWeight"];

    editingRecord.parentNode.parentNode.querySelector("#saveButtons").style.display = "none";
    editingRecord = null;
    editingRecordData = null;
    recordButtonsChangeAvailability(false);
}

function recordButtonsChangeAvailability(isAvailable) {
    for (let record of recordsBox.children) {
        let editButton = record.querySelector(".recordInfo").querySelector("#editButton");
        let deleteButton = record.querySelector(".recordInfo").querySelector("#deleteButton");
        if (isAvailable) {
            editButton.setAttribute("disabled", "disabled");
            deleteButton.setAttribute("disabled", "disabled");
        } else if (editButton.hasAttribute("disabled") || deleteButton.hasAttribute("disabled")) {
            editButton.removeAttribute("disabled");
            deleteButton.removeAttribute("disabled");
        }
    }
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

//* //////////////////////////////////////////////////////////////////////////

//* BACK LOGIC/////////////////////////////////////////////////////

function setupUserData() {
    fetch('http://80.78.254.170:9092/summary?id=1')
        .then(response => {
            response.json().then(data => {
                let userDTO = data["userDTO"];
                //* chartCreate
                let weightList = [];
                let datesList = [];
                for (let item of data["recordDTOList"]) {
                    weightList.push(item["currentWeight"]);
                    datesList.push(new Date(item["date"]));
                }
                chartRenderOrCreate(weightList, datesList);
                //* progress bar setup
                setupBar(userDTO["progress"]);
                console.log(userDTO["progress"]);
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

function createRecord() {
    fetch('http://80.78.254.170:9092/record', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(new userRecord(inputData["currentWeight"].value, inputData["dateInput"].value, 1))
    })
        .then(response => {
            if (response.status === 200) {
                setupUserData();
            } else {
                response.json().then(data => showNotification(data["type"], data["msg"]));
            }
        }).catch(() => {
        showNotification("UNEXPECTED", "Мы не смогли отправить запрос серверу.");
    });
}

function deleteRecord(button) {
    let recordId = button.parentNode.parentNode.getAttribute("data-record-id");

    fetch('http://80.78.254.170:9092/record?id=' + recordId, {method: 'DELETE'})
        .then(response => {
            if (response.status === 200) {
                setupUserData();
                response.text().then(data => showNotification("success", data));
            } else {
                response.json().then(data => showNotification(data["type"], data["msg"]));
            }
        }).catch(() => {
        showNotification("UNEXPECTED", "Мы не смогли отправить запрос серверу.");
    });
}

function updateRecords() {
    let newWeight = editingRecord.parentNode.querySelector("#recordWeight").value;
    let newDate = editingRecord.parentNode.querySelector("#recordDate").value;
    let recordId = editingRecord.parentNode.parentNode.getAttribute("data-record-id");

    fetch('http://80.78.254.170:9092/record', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(new userRecord(newWeight, newDate, 1, recordId))
    })
        .then(response => {
            disableEditMode();
            if (response.status === 200) {
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

function dateToYearDay(date) {
    let current = new Date(date.getTime());
    let previous = new Date(date.getFullYear(), 0, 1);

    return Math.ceil((current - previous + 1) / 86400000);
}

function yearDayToMonthDate(day) {
    let date = new Date(2023, 0, day);
    return date.toLocaleString('ru', {month: 'short'}).capitalize() + ' ' + date.getDate();
}

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

const sleep = async (milliseconds) => {
    await new Promise(resolve => {
        return setTimeout(resolve, milliseconds)
    });
};

//* //////////////////////////////////////////////////////////////////////////

