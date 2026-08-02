const isLocalPreview =
  window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname);

window.FAIRYBOOK_API_BASE = isLocalPreview ? "http://localhost:3000" : "";
