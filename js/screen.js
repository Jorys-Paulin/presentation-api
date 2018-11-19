/**
 * Handles the screen page
 */
const receiverAlert = document.querySelector("#receiverAlert");
const stateAlert = document.querySelector("#stateAlert");
const connectionsLogs = document.querySelector("#connectionsLogs");
const consoleLogs = document.querySelector("#consoleLogs");

window.connection = null;

const setConnectionMessage = connection => {
  let connectionMessage = connectionsLogs.querySelector(
    `[data-connection="${connection.id}"]`
  );
  if (!connectionMessage) {
    connectionMessage = document.createElement("li");
    connectionMessage.className =
      "list-group-item d-flex justify-content-between align-items-center";
    connectionMessage.dataset.connection = connection.id;
    connectionsLogs.appendChild(connectionMessage);
  }
  connectionMessage.innerHTML = `
    ${connection.id}
    <span class="badge badge-success badge-pill">${connection.state}</span>
  `;
};

const setConnection = connection => {
  console.log("setConnection", connection);

  connection.onclose = e => {
    console.log("connectionClose", e);
    stateAlert.innerText = "Closed";
    stateAlert.classList.remove("alert-success");
    stateAlert.classList.add("alert-danger");
    let connectionBadge = connectionsLogs.querySelector(
      `[data-connection="${connection.id}"] .badge`
    );
    connectionBadge.classList.remove("badge-success");
    connectionBadge.classList.add("badge-danger");
    connectionBadge.innerText = "closed";
    //window.connection = null;
  };

  connection.onconnect = e => {
    console.log("connectionConnect", e);
    stateAlert.innerText = "Connected";
    stateAlert.classList.add("alert-success");
    stateAlert.classList.remove("alert-danger");
  };

  connection.onmessage = e => {
    console.log("connectionMessage", e);
    let consoleMessage = document.createElement("div");
    consoleMessage.className = "list-group-item";
    consoleMessage.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <small class="text-primary">${connection.id}</small>
        <small class="text-muted">${new Date().toLocaleTimeString()}</small>
      </div>
      <p class="mb-1">${e.data}</p>
    `;
    consoleLogs.appendChild(consoleMessage);
    consoleLogs.scrollTo(0, consoleLogs.scrollHeight);
  };

  connection.onterminate = e => {
    console.log("connectionTerminate", e);
    stateAlert.innerText = "Terminated";
    stateAlert.classList.remove("alert-success");
    stateAlert.classList.add("alert-danger");
    let connectionBadge = connectionsLogs.querySelector(
      `[data-connection="${connection.id}"] .badge`
    );
    connectionBadge.classList.remove("badge-success");
    connectionBadge.classList.add("badge-danger");
    connectionBadge.innerText = "terminated";
    window.connection = null;
  };

  if (connection.state === "connected") {
    stateAlert.innerText = "Connected";
    stateAlert.classList.add("alert-success");
    stateAlert.classList.remove("alert-danger");
  }

  setConnectionMessage(connection);

  window.connection = connection;
};

const onLoad = () => {
  console.log("windowLoad");

  if (navigator.presentation.receiver) {
    console.log("receiverFound");
    navigator.presentation.receiver.connectionList.then(e => {
      console.log("connectionList", e);
      e.connections.forEach(connection => setConnection(connection));
      e.onconnectionavailable = e => setConnection(e.connection);
    });
  } else {
    receiverAlert.hidden = false;
    console.log("navigator.presentation.receiver not in window");
  }
};

window.onload = onLoad;
