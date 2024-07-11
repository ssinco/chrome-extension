let timerId;
let endTime;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background script:', request);
  if (request.action === 'startTimer') {
    startTimer(request.task, request.endTime);
    sendResponse({ status: 'Timer set' });
  } else if (request.action === 'resumeTimer') {
    resumeTimer(request.task, request.remainingTime);
    sendResponse({ status: 'Timer resumed' });
  }
});

function startTimer(task, endTime) {

  // Start an alarm in parallel with our chrome local storage value
  chrome.alarms.create('timerAlarm', { when: endTime });

  chrome.storage.local.set({ endTime, task }, () => {
    console.log('End time and task stored in local storage');
  });


  // Establishes a countdown, starts the interval, checks if time is up
  timerId = setInterval(() => {

    // establish the left over time
    const remainingTime = endTime - Date.now();

    if (remainingTime <= 0) { // Stop timer logic if time is up
      clearInterval(timerId); // clear the interval
      chrome.alarms.clear('timerAlarm'); // clear the alarm running in parallel
      sendNotification(task);
      clearStorage(); // clear chrome local storage
    } else {

      chrome.storage.local.get(null, function(items) { // show the stored values 
        console.log(items);
    });
      chrome.runtime.sendMessage({ action: 'updateTimer', task, remainingTime }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        }
      });
    }
  }, 1000);
}

function resumeTimer(task, remainingTime) {
  const newEndTime = Date.now() + remainingTime;
  chrome.alarms.create('timerAlarm', { when: newEndTime });

  timerId = setInterval(() => {
    const remainingTime = newEndTime - Date.now();
    if (remainingTime <= 0) {
      clearInterval(timerId);
      chrome.alarms.clear('timerAlarm');
      sendNotification(task);
      clearStorage();
      
    } else {
      chrome.runtime.sendMessage({ action: 'updateTimer', task, remainingTime }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        }
      });
    }
  }, 1000);
}

function sendNotification(task) {
  console.log('Sending notification for task:', task);
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'assets/icons8-alarm-clock-96.png', // Using a built-in Chrome icon
    title: 'Timer Ended',
    message: `Your task "${task}" has ended!`
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('Error creating notification:', chrome.runtime.lastError.message);
    } else {
      console.log('Notification created with ID:', notificationId);
    }
  });
}

function clearStorage() {
  chrome.storage.local.remove(['task', 'endTime'], () => {
    console.log('Local storage cleared');
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timerAlarm') {
    console.log('Alarm triggered:', alarm);
    chrome.storage.local.get(['task'], (result) => {
      console.log('Retrieved from storage:', result);
      const task = result.task;
      if (task) {
        console.log('Notification being made');
        sendNotification(task);
      } else {
        console.error('No task found in storage');
      }
      clearStorage();
    });
  }
});
