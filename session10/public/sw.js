importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

var CACHE_STATIC_NAME = "static-v4";
var CACHE_DYNAMIC_NAME = "dynamic-v3";
var STATIC_FILES = [
  "/",
  "/index.html",
  "/src/js/app.js",
  "/offline.html",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/css/help.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName).then((cache) =>
//     cache.keys().then((keys) => {
//       if (keys.length > maxItems) {
//         cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
//       }
//     })
//   );
// }

self.addEventListener("install", function (event) {
  // console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log("[Service Worker] Precashing service worker");

      cache.addAll(STATIC_FILES);
      // cache.add("/");
      // cache.add("/index.html");
      // cache.add("/src/js/app.js");
    })
  );
});

self.addEventListener("activate", function (event) {
  // console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
  }

  return false;
}

var url = "https://pwagram-99adf.firebaseio.com/posts";

self.addEventListener("fetch", function (event) {
  if (event.request.url.indexOf(url) > -1) {
    // console.log('[Service Worker] Fetching something ....', event);
    event.respondWith(
      fetch(event.request).then((res) => {
        var clonedRes = res.clone();
        clearAllData("posts").then(() => {
          return clonedRes.json().then((data) => {
            for (var key in data) {
              writeData("posts", data[key]);
              // .then(() =>
              //   deleteItemFromData("posts", key)
              // );
            }
          });
        });
        return clonedRes;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response;
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        } else
          return fetch(event.request)
            .then((res) => {
              return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch((error) => {
              return caches.open(CACHE_STATIC_NAME).then((cache) => {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
            });
      })
    );
  }
});

// self.addEventListener("fetch", function (event) {
//   // console.log('[Service Worker] Fetching something ....', event);
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       } else
//         return fetch(event.request)
//           .then((res) => {
//             return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//               cache.put(event.request.url, res.clone());
//               return res;
//             });
//           })
//           .catch((error) => {
//             return caches.open(CACHE_STATIC_NAME).then((cache) => {
//               return cache.match("/offline.html");
//             });
//           });
//     })
//   );
// });

/////////////////////////////////
// First-Network-then-Cache method
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });

/////////////////////////////////
// Cache-only method
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response;
//     })
//   );
// });

/////////////////////////////////
// Network-only method
// self.addEventListener("fetch", function (event) {
//   event.respondWith(fetch(event.request));
// });

self.addEventListener("sync", (event) => {
  console.log("[Service Worker] background syncing", event);
  if (event.tag === "sync-new-post") {
    console.log("[Service Worker] Syncing new posts");
    event.waitUntil(
      readAllData("sync-posts").then((data) => {
        for (var dt of data) {
          fetch(url + ".json", {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              // id: dt.id,
              // title: dt.title,
              // location: dt.location,
              // image: dt.image,
              ...dt,
            }),
          })
            .then((res) => {
              console.log("sent data: ", res);
              if (res.ok) {
                res.json().then((resData) => {
                  deleteItemFromData("sync-posts", resData.id);
                });
              }
            })
            .catch((error) => {
              console.log("Error while sending data", error);
            });
        }
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  var notification = event.notification;
  var action = event.action;

  if (action === "confirm") {
    console.log("Confirm was chosen");
  } else {
    console.log(action);
  }
  notification.close();
});

self.addEventListener("notificationclose", (event) => {
  // You can handle send to backend and then log it and use for analysis
  console.log("Notification was closed", event);
});
