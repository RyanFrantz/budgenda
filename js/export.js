// Largely lifted from https://www.w3schools.com/howto/howto_css_modals.asp
const modal = document.getElementById("export-notes-modal");
const exportFollowUp = document.getElementById("export-follow-up");
const exportMeetingMinutes = document.getElementById("export-meeting-minutes");
const exportNotesBtn = document.getElementById("export-notes");
const modalClose = document.getElementsByClassName("modal-close")[0];

// Collect and return the current set of notes, including a bit of metadata.
function getNotesForExport() {
  let notesToExport = [];
  let notes = document.querySelectorAll("#notes .note");
  for (let note of notes) {
    let noteId = note.id;
    let _note = {
      body: null,
      metadata: {
        followup: false
      }
    };
    _note.body = note.outerHTML;
    // Determine if the follow-up box is checked and add it to metadata.
    let followUpId = `#${noteId}_follow_up`;
    let followUpBox = note.querySelector(followUpId);
    if (followUpBox.checked) {
      // Add the id to a list. These metadata can be used later when notes
      // are recalled, to mark them as checked.
      _note.metadata.followup = true;
    }
    notesToExport.push(_note);
  }
  // TODO: Store the notes in localStorage at this point?
  // It could be a handy supplement to saving the notes on each
  // note creation.

  return notesToExport;
}

// Clear any existing modal content (e.g. from previous exports) so that we can
// build it afresh from current notes.
function clearModalContent() {
  while (exportFollowUp.hasChildNodes()) {
    exportFollowUp.removeChild(exportFollowUp.firstChild);
  }
  while (exportMeetingMinutes.hasChildNodes()) {
    exportMeetingMinutes.removeChild(exportMeetingMinutes.firstChild);
  }
}

// Given a note ID string (e.g. "note_1630771464000"), return a Date object.
function dateFromNoteId(noteId) {
  return new Date(Number(noteId.replace(/^note_/, "")));
}

// Given an array of notes and a parent element, iterate over the notes and
// append them to the parent.
function addNotesToElement(notes, parent) {
  for (let note of notes) {
    // Convert the HTML string into a fragment so we can access it as a Node.
    let frag = document.createRange().createContextualFragment(note.body)
    let noteId = frag.querySelector(".note").id;
    // Append a p element containing the note's date.
    let dateP = document.createElement("p");
    let noteDate = dateFromNoteId(noteId);
    dateP.innerText = dateToTime(noteDate);
    parent.appendChild(dateP);

    let details = frag.querySelectorAll(".note .note-details .note-detail");
    // For each detail, append a p element.
    for (let detail of details) {
      // Skip empty lines. 1 char is used by the ZeroWidthSpace.
      if (detail.innerHTML.length > 1) {
        let detailP = document.createElement("p");
        detailP.innerText = detail.innerText;
        parent.appendChild(detailP);
      }
    }
    // Add line break after each note, to aid legibility.
    let br = document.createElement("br");
    parent.appendChild(br);
  }
}

// Populate the export modal with note details.
function openExportModal() {
  clearModalContent();
  // Make the modal visible.
  modal.style.display = "block";

  let exportedNotes = getNotesForExport();
  let followUpNotes = exportedNotes.filter(note => note.metadata.followup);

  let followUpTitle = document.createElement("h3");
  followUpTitle.innerText = "Follow-up";
  exportFollowUp.appendChild(followUpTitle);
  if (followUpNotes.length == 0) {
    let noFollowUp = document.createElement("p");
    noFollowUp.innerText = "Nothing is marked for follow up."
    exportFollowUp.appendChild(noFollowUp);
  } else {
    addNotesToElement(followUpNotes, exportFollowUp)
  }

  let minutesTitle = document.createElement("h3");
  minutesTitle.innerText = "Meeting Minutes";
  exportMeetingMinutes.appendChild(minutesTitle);
  addNotesToElement(exportedNotes, exportMeetingMinutes)
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
