// Largely lifted from https://www.w3schools.com/howto/howto_css_modals.asp
const allMeetingsModal = document.getElementById("all-meetings-modal");
const allMeetingsModalContent = document.getElementById("all-meetings-content");
const allMeetingsModalClose = document.getElementById("all-meetings-modal-close");
const allMeetingsButton = document.getElementById("all-meetings-button");
const clearMeetingsButton = document.getElementById("clear-meetings");

// Retrieve meetings from storage.
function getMeetings() {
  let meetings = JSON.parse(localStorage.getItem("budgenda")) || [];
  // Return the keys of each stored meeting, which is a date string.
  return Object.keys(meetings);
}

// Clear any existing modal content (e.g. from previous exports) so that we can
// build it afresh from current notes.
function clearMeetingsModalContent() {
  while (allMeetingsModalContent.hasChildNodes()) {
    allMeetingsModalContent.removeChild(allMeetingsModalContent.firstChild);
  }
}

// Populate the meetings modal with meetings summaries.
function openMeetingsModal() {
  clearMeetingsModalContent();
  // Make the modal visible.
  allMeetingsModal.style.display = "block";

  let meetingKeys = getMeetings();
  let meetingsTitle = document.createElement("h3");
  meetingsTitle.innerText = "Meetings";
  allMeetingsModalContent.appendChild(meetingsTitle);
  if (meetingKeys.length == 0) {
    let noMeetings = document.createElement("p");
    noMeetings.innerText = "No meetings found in storage.";
    allMeetingsModalContent.appendChild(noMeetings);
  } else {
    for (let key of meetingKeys) {
      let datetime = simpleDatetime(key);
      // Append a p element containing the meeting's date.
      let dateP = document.createElement("p");
      //dateP.innerText = dateToTime(key);
      if (key == meetingStart) {
        dateP.innerText = `${datetime} (Current meeting)`;
      } else {
        dateP.innerText = datetime;
      }
      allMeetingsModalContent.appendChild(dateP);
    }
  }
}

// Handler for clicking "All Meetings"
allMeetingsButton.onclick = openMeetingsModal;

// If the modal close icon is clicked, make the modal invisible.
allMeetingsModalClose.onclick = function() {
  allMeetingsModal.style.display = "none";
}

// Clear all stored meetings
clearMeetingsButton.onclick = function() {
  localStorage.clear();
  clearMeetingsModalContent();
  openMeetingsModal();
}

// If the user clicks outside of the modal, close it.
window.onclick = function(_event) {
  if (_event.target == allMeetingsModal) {
    allMeetingsModal.style.display = "none";
  }
}
