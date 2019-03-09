/**
 * Handles the remote page
 */
const startScreenBtn = document.querySelector("#startScreen");
const reconnectScreenBtn = document.querySelector("#reconnectScreen");
const closeScreenBtn = document.querySelector("#closeScreen");
const terminateScreenBtn = document.querySelector("#terminateScreen");

const connectionBinaryTypeVar = document.querySelector("#connectionBinaryTypeVar");
const connectionIdVar = document.querySelector("#connectionIdVar");
const connectionStateVar = document.querySelector("#connectionStateVar");
const connectionUrlVar = document.querySelector("#connectionUrlVar");

const presentationAlert = document.querySelector("#presentationAlert");

const errorScreenBadge = document.querySelector("#errorScreenBadge");

const consoleClear = document.querySelector("#consoleClear");
const consoleLogs = document.querySelector("#consoleLogs");
const consoleInput = document.querySelector("#consoleInput");
const consoleForm = document.querySelector("#consoleForm");

window.connection = null;
window.request = null;

let screenUrl = ["./screen"];

const availabilityChanged = (avail = true) => {
  console.log("availabilityChanged", avail);
  startScreenBtn.disabled = !avail;
};

const setConnection = connection => {
  console.log("setConnection", connection);

  localStorage.setItem("presentationId", connection.id);

  connectionBinaryTypeVar.innerText = connection.binaryType;
  connectionIdVar.innerText = connection.id;
  connectionStateVar.innerText = connection.state;
  connectionUrlVar.innerText = connection.url;

  connection.onclose = e => {
    console.log("connectionClose", e);
    window.connection = null;
    startScreenBtn.disabled = true;
    reconnectScreenBtn.disabled = false;
    closeScreenBtn.disabled = true;
    terminateScreenBtn.disabled = true;
    errorScreenBadge.hidden = true;
    connectionStateVar.innerText = connection.state;
  };

  connection.onconnect = e => {
    console.log("connectionConnect", e);
    startScreenBtn.disabled = true;
    reconnectScreenBtn.disabled = true;
    closeScreenBtn.disabled = false;
    terminateScreenBtn.disabled = false;
    errorScreenBadge.hidden = true;
    connectionStateVar.innerText = connection.state;
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
  };

  connection.onterminate = e => {
    console.log("connectionTerminate", e);
    window.connection = null;
    localStorage.removeItem("presentationId");
    startScreenBtn.disabled = false;
    reconnectScreenBtn.disabled = true;
    closeScreenBtn.disabled = true;
    terminateScreenBtn.disabled = true;
    errorScreenBadge.hidden = true;
  };

  window.connection = connection;
};

const removeConnection = () => {
  console.log("removeConnection");

  localStorage.removeItem("presentationId");

  window.connection = null;
};

const startScreenError = err => {
  console.error("startScreenError", err);
  errorScreenBadge.hidden = false;
};

const reconnectScreenError = err => {
  console.error("reconnectScreenError", err);
  errorScreenBadge.hidden = false;

  removeConnection();
  reconnectScreenBtn.disabled = true;
};

const onLoad = () => {
  console.log("windowLoad");

  /**
   * Creates a PresentationRequest
   */
  if ("PresentationRequest" in window) {
    request = new PresentationRequest(screenUrl);
    request
      .getAvailability()
      .then(aval => {
        console.log("getAvailability", aval.value);
        availabilityChanged(aval.value);
        avail.onchange = e => availabilityChanged(e.value);
      })
      .catch(() => availabilityChanged(true));
    window.request = request;
  } else {
    availabilityChanged(true);
    presentationAlert.hidden = false;
    console.warn("PresentationRequest not in window");
  }

  /**
   * Enables the Reconnect button if a session id is in localStorage
   */
  let presentationId = localStorage.getItem("presentationId");
  if (presentationId) {
    reconnectScreenBtn.disabled = false;
  }

  /**
   * Add event handlers to buttons
   */
  startScreenBtn.onclick = () => {
    console.log("startScreen");
    if (request) {
      request
        .start()
        .then(connection => setConnection(connection))
        .catch(err => startScreenError(err));
    }
  };

  reconnectScreenBtn.onclick = () => {
    console.log("reconnectScreen");
    let presentationId = localStorage.getItem("presentationId");
    if (presentationId) {
      console.log("foundReconnect", presentationId);
      if (request) {
        request
          .reconnect(presentationId)
          .then(connection => setConnection(connection))
          .catch(err => reconnectScreenError(err));
      }
    }
  };

  closeScreenBtn.onclick = () => {
    console.log("stopScreen", connection);
    connection.close();
  };

  terminateScreenBtn.onclick = () => {
    console.log("terminateScreen", connection);
    connection.terminate();
  };

  consoleClear.onclick = () => {
    consoleLogs.innerHTML = null;
  };

  consoleForm.onsubmit = e => {
    e.preventDefault();
    if (connection) {
      consoleInput.classList.remove("is-invalid");
      let input = consoleInput.value;
      connection.send(input);
      consoleInput.value = null;
    } else {
      consoleInput.classList.add("is-invalid");
    }
  };
};

window.onload = onLoad;
