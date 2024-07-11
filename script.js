const formSetTimer = document.querySelector(".set-timer-form");
const taskDisplay = document.querySelector("#task-display");
const timerDisplay = document.querySelector("#timer-display");
const taskContainer = document.querySelector(".task-container");

// 
formSetTimer.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(formSetTimer);
  const formObject = Object.fromEntries(formData.entries());

  const task = formObject.task;
  const time = Number(formObject.time) * 1000; // Convert seconds to milliseconds

  // Store the task and end time in chrome.storage.local
  const endTime = Date.now() + time;
  chrome.storage.local.set({ task, endTime }, () => {
    console.log('Task and end time stored locally.');
    chrome.runtime.sendMessage({ action: 'startTimer', task, endTime }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message);
      } else {
        console.log('Timer set:', response.status);
      }
    });
  });
});

//update timer
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateTimer') {
    updateTimeDisplay(request.task, request.remainingTime);
    sendResponse({ status: "Updated timer display" });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['task', 'endTime'], (result) => {
    const storedTask = result.task;
    const storedEndTime = result.endTime;

    if (storedTask && storedEndTime) {
      const remainingTime = storedEndTime - Date.now();
      if (remainingTime > 0) {
        updateTimeDisplay(storedTask, remainingTime);
        chrome.runtime.sendMessage({ action: 'resumeTimer', task: storedTask, remainingTime }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
          } else {
            console.log('Resumed timer:', response.status);
          }
        });
      } else {
        clearStorage();
      }
    }
  });
});

function updateTimeDisplay(task, remainingTime) {
  let displayTime = remainingTime > 0 ? remainingTime : 0;
  timerDisplay.textContent = formatTime(displayTime);
  taskDisplay.textContent = task;
  taskContainer.style.visibility = 'visible';
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function clearStorage() {
  chrome.storage.local.remove(['task', 'endTime'], () => {
    console.log('Local storage cleared');
  });
}
