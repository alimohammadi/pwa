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

    swreg.pushManager
      .getSubscription()
      .then((sub) => {
        if (sub === null) {
          // Create a new subscription
          var vapidPublicKey = "";
          var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);

          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey,
          });
        } else {
          // We have a subscription
        }
      })
      .then((newSub) => {
        // Store subscription
        return fetch("backend_url.json", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newSub),
        });
      })
      .then((res) => {
        if (res.ok) displayConfirmNotification();
      })
      .catch((error) => {
        console.log(error);
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
