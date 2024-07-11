let timerId;
let endTime;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    startTimer(request.task, request.time);
    sendResponse({ status: 'Timer set' });
  }
});

function startTimer(task, time) {
  endTime = Date.now() + time;
  chrome.alarms.create('timerAlarm', { when: endTime });

  timerId = setInterval(() => {
    const remainingTime = endTime - Date.now();
    if (remainingTime <= 0) {
      clearInterval(timerId);
      chrome.alarms.clear('timerAlarm');
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png', // Ensure you have an icon.png in your extension directory
        title: 'Timer Ended',
        message: `Your task "${task}" has ended!`
      });
    } else {
      chrome.runtime.sendMessage({ action: 'updateTimer', task, remainingTime });
    }
  }, 1000);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timerAlarm') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png', // Ensure you have an icon.png in your extension directory
      title: 'Timer Ended',
      message: 'Your timer has ended!'
    });
  }
});
