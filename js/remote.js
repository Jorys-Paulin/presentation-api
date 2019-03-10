/**
 * Handles the remote page
 */
const startScreenBtn = document.querySelector("#startScreen");
const reconnectScreenBtn = document.querySelector("#reconnectScreen");
const closeScreenBtn = document.querySelector("#closeScreen");
const terminateScreenBtn = document.querySelector("#terminateScreen");

const connectionBinaryTypeVar = document.querySelector(
  "#connectionBinaryTypeVar"
);
const connectionIdVar = document.querySelector("#connectionIdVar");
const connectionStateBadge = document.querySelector("#connectionStateBadge");
const connectionUrlVar = document.querySelector("#connectionUrlVar");

const presentationAlert = document.querySelector("#presentationAlert");

const errorScreenBadge = document.querySelector("#errorScreenBadge");

const consoleClearBtn = document.querySelector("#consoleClearBtn");
const consoleMessagesList = document.querySelector("#consoleMessagesList");
const consoleInput = document.querySelector("#consoleInput");
const consoleForm = document.querySelector("#consoleForm");
let consoleMessages = new Set();

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
  connectionStateBadge.setAttribute("class", "badge badge-primary");
  connectionStateBadge.innerText = connection.state;
  connectionUrlVar.innerText = connection.url;

  connection.onclose = e => {
    console.log("connectionClose", e);
    window.connection = null;
    startScreenBtn.disabled = true;
    reconnectScreenBtn.disabled = false;
    closeScreenBtn.disabled = true;
    terminateScreenBtn.disabled = true;
    errorScreenBadge.hidden = true;
    connectionStateBadge.setAttribute("class", "badge badge-warning");
    connectionStateBadge.innerText = connection.state;

    appendConsoleEvent(e);
  };

  connection.onconnect = e => {
    console.log("connectionConnect", e);
    startScreenBtn.disabled = true;
    reconnectScreenBtn.disabled = true;
    closeScreenBtn.disabled = false;
    terminateScreenBtn.disabled = false;
    errorScreenBadge.hidden = true;
    connectionStateBadge.setAttribute("class", "badge badge-success");
    connectionStateBadge.innerText = connection.state;

    appendConsoleEvent(e);
  };

  connection.onmessage = e => {
    console.log("connectionMessage", e);

    if (typeof e.data === "string") {
      appendConsoleEvent(e);
    } else {
      e.data = "The message wasn't a String";
      appendConsoleEvent(e);
    }
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
    connectionStateBadge.setAttribute("class", "badge badge-danger");
    connectionStateBadge.innerText = connection.state;

    appendConsoleEvent(e);
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

const appendConsoleEvent = e => {
  consoleMessages.add(e);

  let messageItem = document.createElement("div");
  messageItem.setAttribute("class", "list-group-item");
  messageItem.innerHTML = `
    <div class="d-flex w-100 justify-content-between">
      <p class="mb-0">
        ${
          e.currentTarget
            ? `
          <span class="badge badge-warning">screen</span>
          <code>${e.type}</code>
          <var class="text-muted">${e.currentTarget.id}</var>
          `
            : `
          <span class="badge badge-success">remote</span>
          <code>${e.type}</code>
          `
        }
      </p>
      <small class="text-muted">${new Date().toLocaleTimeString()}</small>
    </div>
    ${e.data ? `<pre class="mb-0">${e.data}</pre>` : ""}
    ${e.reason ? `<samp class="mb-0">${e.reason}</samp>` : ""}
  `;

  consoleMessagesList.appendChild(messageItem);
  consoleMessagesList.scrollTop = consoleMessagesList.scrollHeight;
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

  consoleClearBtn.onclick = () => {
    consoleMessagesList.innerHTML = `<div class="list-group-item text-muted">The console was cleared</div>`;
    consoleMessages.clear();
  };

  consoleForm.onsubmit = e => {
    e.preventDefault();
    if (connection && connection.state === "connected") {
      consoleInput.classList.remove("is-invalid");
      let data = consoleInput.value;
      connection.send(data);
      consoleInput.value = null;

      let messageEvent = new MessageEvent("message", { data });
      appendConsoleEvent(messageEvent);
    } else {
      consoleInput.classList.add("is-invalid");
    }
  };
};

window.onload = onLoad;
