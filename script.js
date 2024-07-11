const formSetTimer = document.querySelector(".set-timer-form");
const taskDisplay = document.querySelector("#task-display");
const timerDisplay = document.querySelector("#timer-display");
const taskContainer = document.querySelector(".task-container");

formSetTimer.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(formSetTimer);
  const formObject = Object.fromEntries(formData.entries());

  const task = formObject.task;
  const time = Number(formObject.time);

  chrome.runtime.sendMessage({ action: 'startTimer', task, time }, (response) => {
    console.log('Timer set:', response.status);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateTimer') {
    updateTimeDisplay(request.task, request.remainingTime);
  }
});

function updateTimeDisplay(task, remainingTime) {
  let displayTime = remainingTime > 0 ? remainingTime : 0;
  timerDisplay.textContent = `${Math.floor(displayTime / 1000)} seconds`;
  taskDisplay.textContent = task;
  taskContainer.style.visibility = 'visible';
}
