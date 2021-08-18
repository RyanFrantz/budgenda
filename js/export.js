// Largely lifted from https://www.w3schools.com/howto/howto_css_modals.asp
const modal = document.getElementById("export-notes-modal");
const modalContent = document.getElementById("modal-content");
const btn = document.getElementById("export-notes");
const modalClose = document.getElementsByClassName("modal-close")[0];

// Basically storeNoteState from js/budgenda.js
function getNotesForExport() {
  let notesToExport = [];
  let notes = d3.select("#notes").selectAll(".note");
  for (let n of notes) {
    // Get the element's id value.
    let noteId = d3.select(n).attr('id');
    let _epoch = Number(noteId.replace(/^note_/, ""));
    // Select all details for this note.
    let sel = `#${noteId} > .note-details > .note-detail`;
    let details = d3.select(n).selectAll(sel);
    // Store each detail's text in a list.
    let noteContents = d3.map(details, d => {
      return d3.select(d).text();
    });
    notesToExport.push({id: _epoch, details: noteContents});
  }
  return notesToExport;
}

// Make the modal visible when "Export Notes" is clicked.
btn.onclick = function() {
  modal.style.display = "block";
  let newNode = document.createElement("div");
  // Insert note details after the modal-close. We do this by inserting
  // before the next sibling, effectively, "after".
  modalClose.parentNode.insertBefore(newNode, modalClose.nextSibling);
  let exportedNotes = getNotesForExport();
  console.log(JSON.stringify(exportedNotes));
  // TODO: Create the appropriate elements from the notes and append them?
  // appendChild?
  let newSpan = document.createElement("span");
  modalContent.appendChild(newSpan);
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
