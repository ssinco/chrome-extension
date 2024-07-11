/* ===============================
Selectors 
=============================== */


const buttonSetTimer = document.querySelector("#set-timer-button")
const formSetTimer = document.querySelector(".set-timer-form")
const mainContainer = document.querySelector(".main.container")
const taskContainer = document.querySelector(".task-container")
const taskDisplay = document.querySelector("#task-display")

const timerContainer = document.querySelector(".timer-container")
const timerDisplay = document.querySelector("#timer-display")


let taskSet = false

//temporary
// let timeNow = 1000
let deadlineTime
let elapsedTime

formSetTimer.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const formData = new FormData(formSetTimer);
    console.log('formData = ', formData)

    const formObject = Object.fromEntries(formData.entries());
    console.log('formObject = ', formObject)

    const task = formObject.task
    const time = Number(formObject.time)


    // start background script
    chrome.runtime.sendMessage({ action: 'startTimer', task, time }, (response) => {
        console.log('test')
        // console.log(response.status);
      });

    // // Below is a test to see what the JSON looks like 
    //     // const string = JSON.stringify(formObject)
    //     // console.log('formObjectStringified = ', string)

    
    // localStorage.setItem('formSubmission', JSON.stringify(formObject));

    // start timer function
    startTask(task, time)
})

function startTask(task,time) {
    startTimer(task,time)    
}

// start the timer
function startTimer(task,time) {

    // Date.now() = milliseconds since 1970
    // time = users inputed time. Needs to be in miliseconds
    console.log(time)

    deadlineTime = Date.now() + time
    console.log(Date.now())
    console.log('deadline', deadlineTime)
    localStorage.setItem('deadlineTime', deadlineTime);
    localStorage.setItem('task', task);


    const timerId = setInterval(()=>{
        elapsedTime = deadlineTime - Date.now()
        console.log("elapsedtime::", elapsedTime)
        localStorage.setItem('elapsedTime', elapsedTime)

        // option to store on chrome rather than local storage
        // chrome.storage.local.set({timeLeft: timeLeft})

        // timer is up, elapsedTime is 0
        if (elapsedTime <= 0) {
            clearInterval(timerId)
            localStorage.removeItem('deadlineTime');
            localStorage.removeItem('elapsedTime');
            alert("Time's up! Did you do this: " + task)
            localStorage.removeItem('task');
        }

        updateTimeDisplay(task)
    }, 1000)
}

function updateTimeDisplay(task) {
    let displayTime = elapsedTime > 0 ? elapsedTime : 0
    timerDisplay.textContent = displayTime
    taskDisplay.textContent = task
    taskContainer.style.visibility = 'visible'
}

document.addEventListener('DOMContentLoaded', () => {
    const storedDeadlineTime = localStorage.getItem('deadlineTime');
    const storedTask = localStorage.getItem('task')
    if (storedDeadlineTime) {
        deadlineTime = parseInt(storedDeadlineTime, 10);
        elapsedTime = deadlineTime - Date.now();
        if (elapsedTime > 0) {
            updateTimeDisplay(storedTask);
            startTimer(storedTask, elapsedTime); // Start the timer with the remaining time
        } else {
            localStorage.removeItem('deadlineTime');
            localStorage.removeItem('elapsedTime');

            alert("Time's up! Did you do this: " + task)
            localStorage.removeItem('task');
            
        }
    }
});
// store the elapsed time

// change the timer logic so that it's duration vs now





