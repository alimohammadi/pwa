var deferredPrompt;

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

var promise = new Promise(function (resolve, reject) {
  setTimeout(function () {
    // resolve("This is executed once the timer is done!");
    reject({ code: 500, message: "An error occurred" });
    // console.log("");
  }, 3000);
});

fetch("https://httpbin.org/ip")
  .then((response) => {
    console.log(response);
    return response.json();
  })
  .then((data) => {
    console.log(data);
  })
  .catch((error) => console.log(error));

fetch("https://httpbin.org/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({ message: "Does this work?" }),
})
  .then((response) => {
    console.log(response);
    return response.json();
  })
  .then((data) => {
    console.log(data);
  })
  .catch((error) => console.log(error));

promise
  .then(function (text) {
    return text;
  })
  .then(function (newText) {
    console.log(newText);
  })
  .catch(function (error) {
    console.log(error.code);
  });

console.log("This is executed right after setTimeout()");
