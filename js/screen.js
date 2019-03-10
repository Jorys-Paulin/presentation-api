/**
 * Handles the screen page
 */
const currentConnectionTab = document.querySelector("#currentConnectionTab");

const screenWidthVar = document.querySelector("#screenWidthVar");
const screenHeightVar = document.querySelector("#screenHeightVar");

const connectionBinaryTypeVar = document.querySelector(
  "#connectionBinaryTypeVar"
);
const connectionIdVar = document.querySelector("#connectionIdVar");
const connectionStateBadge = document.querySelector("#connectionStateBadge");
const connectionUrlVar = document.querySelector("#connectionUrlVar");

const consoleMessagesList = document.querySelector("#consoleMessagesList");
let consoleMessages = new Set();

window.connection = null;

const appendConsoleEvent = e => {
  consoleMessages.add(e);

  let messageItem = document.createElement("div");
  messageItem.setAttribute("class", "list-group-item");
  messageItem.innerHTML = `
    <div class="d-flex w-100 justify-content-between">
      <p class="mb-0">
        <code>${e.type}</code>
        <var class="text-muted">${e.currentTarget.id}</var>
      </p>
      <small class="text-muted">${new Date().toLocaleTimeString()}</small>
    </div>
    ${e.data ? `<pre class="mb-0">${e.data}</pre>` : ""}
    ${e.reason ? `<samp class="mb-0">${e.reason}</samp>` : ""}
  `;

  consoleMessagesList.appendChild(messageItem);
  consoleMessagesList.scrollTop = consoleMessagesList.scrollHeight;
};

const setConnection = connection => {
  console.log("setConnection", connection);

  currentConnectionTab.innerText = connection.id;

  connectionBinaryTypeVar.innerText = connection.binaryType;
  connectionIdVar.innerText = connection.id;
  connectionStateBadge.setAttribute("class", "badge badge-primary");
  connectionStateBadge.innerText = connection.state;
  connectionUrlVar.innerText = connection.url;

  connection.onclose = e => {
    console.log("connectionClose", e);

    connectionStateBadge.setAttribute("class", "badge badge-warning");
    connectionStateBadge.innerText = connection.state;

    appendConsoleEvent(e);
  };

  connection.onconnect = e => {
    console.log("connectionConnect", e);

    connectionStateBadge.setAttribute("class", "badge badge-success");
    connectionStateBadge.innerText = connection.state;

    appendConsoleEvent(e);
  };

  connection.onmessage = e => {
    console.log("connectionMessage", e);

    appendConsoleEvent(e);
  };

  connection.onterminate = e => {
    console.log("connectionTerminate", e);

    connectionStateBadge.setAttribute("class", "badge badge-danger");
    connectionStateBadge.innerText = connection.state;

    window.connection = null;
  };

  if (connection.state === "connected") {
    connectionStateBadge.setAttribute("class", "badge badge-success");
    connectionStateBadge.innerText = connection.state;
  }

  window.connection = connection;
};

const onLoad = () => {
  console.log("windowLoad");

  screenWidthVar.innerText = window.innerWidth;
  screenHeightVar.innerText = window.innerHeight;

  window.onresize = () => {
    screenWidthVar.innerText = window.innerWidth;
    screenHeightVar.innerText = window.innerHeight;
  };

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
