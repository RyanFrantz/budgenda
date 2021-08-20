const copyButton = document.getElementById("copy-to-clipboard");
/* Already declared in export.js.
const modalContent = document.getElementById("modal-content");
*/

// Register an event handler to support copying modal content to clipboard.
copyButton.onclick = function() {
  window.getSelection().selectAllChildren(modalContent);
  document.execCommand("copy");
}
