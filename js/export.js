// Largely lifted from https://www.w3schools.com/howto/howto_css_modals.asp
const modal = document.getElementById("export-notes-modal");
const btn = document.getElementById("export-notes");
const modalClose = document.getElementsByClassName("modal-close")[0];

// Make the modal visible when "Export Notes" is clicked.
btn.onclick = function() {
  modal.style.display = "block";
}

// If the modal close icon is clicked, make the modal invisible.
modalClose.onclick = function() {
  modal.style.display = "none";
}

// If the user clicks outside of the modal, close it.
window.onclick = function(_event) {
  if (_event.target == modal) {
    modal.style.display = "none";
  }
}
