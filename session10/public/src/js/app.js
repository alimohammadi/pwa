var deferredPrompt;
var enableNotificationButtons = document.querySelectorAll(
  ".enable-notifications"
);
if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(function () {
    console.log("Service worker registered!");
  });
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("beforeinstallprompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  const options = {
    body: "You successfully subscribed to our notification service!",
    vibrate: [100, 50, 200],
    // icon: "",
    // image:"",
    actions: [
      { action: "confirm", title: "Okay", icon: "" },
      { action: "cancel", title: "Cancel", icon: "" },
    ],
  };

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification("Successfully subscribed!", options);
    });
  }
}

function configurePushSub() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  var reg;

  navigator.serviceWorker.ready.then((swreg) => {
    reg = swreg;

    swreg.pushManager.getSubscription().then((sub) => {
      if (sub === null) {
        // Create a new subscription
        reg.pushManager.subscribe({
          userVisibleOnly: true,
        });
      } else {
        // We have a subscription
      }
    });
  });
}

function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log("user choice", result);
    if (result !== "granted") {
      console.log("No notification permission granted!");
    } else {
      // displayConfirmNotification();
    }
  });
}

if ("Notification" in window && "serviceWorker" in navigator) {
  for (var index = 0; index < enableNotificationButtons.length; index++) {
    const element = enableNotificationButtons[index];
    element.style.display = "inline-block";
    element.addEventListener("click", askForNotificationPermission);
  }
}
