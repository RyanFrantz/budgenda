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

// Clear any existing modal content (e.g. from previous exports) so that we can
// build it afresh from current notes.
function clearModalContent() {
  console.log(modalContent.childNodes);
  while (modalContent.hasChildNodes()) {
    modalContent.removeChild(modalContent.firstChild);
  }
}

// When the button is clicked, populate the modal with note details.
btn.onclick = function() {
  clearModalContent();
  // Make the modal visible.
  modal.style.display = "block";

  let exportedNotes = getNotesForExport();
  for (let note of exportedNotes) {
    // Append a p element containing the note's date.
    let dateP = document.createElement("p");
    let noteDate = new Date(Number(note.id));
    dateP.innerText = noteDate;
    modalContent.appendChild(dateP);

    // For each detail, append a p element.
    for (let detail of note.details) {
      // Skip empty lines.
      if (detail.length > 0) {
        let detailP = document.createElement("p");
        detailP.innerText = detail;
        modalContent.appendChild(detailP);
      }
    }
  }
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
