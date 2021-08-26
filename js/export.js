// Largely lifted from https://www.w3schools.com/howto/howto_css_modals.asp
const modal = document.getElementById("export-notes-modal");
const modalContent = document.getElementById("modal-content");
const exportNotesBtn = document.getElementById("export-notes");
const modalClose = document.getElementsByClassName("modal-close")[0];

// Basically storeNoteState from js/budgenda.js
function getNotesForExport() {
  let followUpNotes = [];
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
    // If a note is marked for follow up, push its contents into an array
    // dedicated to tracking that.
    let followUp = document.getElementById(`${noteId}_follow_up`);
    if (followUp.checked) {
      followUpNotes.push({id: _epoch, details: noteContents});
    }
  }
  return [notesToExport, followUpNotes];
}

// Clear any existing modal content (e.g. from previous exports) so that we can
// build it afresh from current notes.
function clearModalContent() {
  while (modalContent.hasChildNodes()) {
    modalContent.removeChild(modalContent.firstChild);
  }
}

// Populate the export modal with note details.
function openExportModal() {
  clearModalContent();
  // Make the modal visible.
  modal.style.display = "block";

  let [exportedNotes, followUpNotes] = getNotesForExport();
  let followUpTitle = document.createElement("h3");
  followUpTitle.innerText = "Follow-up";
  modalContent.appendChild(followUpTitle);
  if (followUpNotes.length == 0) {
    let noFollowUp = document.createElement("p");
    noFollowUp.innerText = "Nothing is marked for follow up."
    modalContent.appendChild(noFollowUp);
  } else {
    // TODO: Dedupe this and the same code below for exportedNotes.
    for (let note of followUpNotes) {
      // Append a p element containing the note's date.
      let dateP = document.createElement("p");
      let noteDate = new Date(Number(note.id));
      dateP.innerText = dateToTime(noteDate);
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
      // Add line break after each note, to aid legibility.
      let br = document.createElement("br");
      modalContent.appendChild(br);
    }
  }

  let minutesTitle = document.createElement("h3");
  minutesTitle.innerText = "Meeting Minutes";
  modalContent.appendChild(minutesTitle);
  for (let note of exportedNotes) {
    // Append a p element containing the note's date.
    let dateP = document.createElement("p");
    let noteDate = new Date(Number(note.id));
    //dateP.innerText = noteDate;
    dateP.innerText = dateToTime(noteDate);
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
    // Add line break after each note, to aid legibility.
    let br = document.createElement("br");
    modalContent.appendChild(br);
  }
}

// Handler for clicking "Export Notes".
exportNotesBtn.onclick = openExportModal;

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
