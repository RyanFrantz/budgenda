
//
// Customizing Axes
// Code from the medium post: https://medium.com/@ghenshaw.work/customizing-axes-in-d3-js-99d58863738b
//

// Margin convention
const margin = {top: 32, right: 20, bottom: 32, left: 10};
/*
const width = 1200 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
*/
const width = 1200 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

function buildTimeline() {
  let contentParent = document.querySelector("body .main-container .content");
  let existingTimeline = document.querySelector("svg"); // Only one, so far.
  if (existingTimeline) {
    contentParent.removeChild(existingTimeline);
  }

  // Create an SVG of our timeline.
  const svg = d3.select("body")
                .select(".main-container")
                .select(".content")
                // Insert the SVG just above the help message.
                .insert("svg", "#help-message")
                .attr("class", "timeline")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);


  // Define the scale for our axis.
  let duration = 30;
  let start = Date.now() - (60 * 2 * 1000);
  let end = Date.now() + (60 * duration * 1000);
  let xScale = d3.scaleTime()
                 .domain([start, end])
                 .range([0, width]);

  // NOTE: axisBottom() doesn't place the axis at the bottom of a graph.
  // It creates an axis where _tick marks_ are on the bottom.
  let xAxisGenerator = d3.axisBottom(xScale);

  // Customizations using the axis generator; these are done pre-render.
  // Start and end on a nice boundary.
  // For a 30-minute session, starts and ends 1-6 minutes on each side.
  xAxisGenerator.ticks(duration);
  let timeFormat = d3.timeFormat("%H:%M"); // 24-hour format.
  xAxisGenerator.tickFormat(timeFormat);
  xScale.nice();


  // Render the axis.
  let xAxis = svg.append("g").call(xAxisGenerator);

  // Customizations using the axis after it is called
  // Place the axis at the bottom of the graph.
  xAxis.attr("transform",`translate(${0},${height})`);

  // Optional: Remove text from alternate ticks, for legibility.
  // https://stackoverflow.com/questions/38921226/show-every-other-tick-label-on-d3-time-axis
  /*
  let ticks = d3.selectAll(".tick text");
  ticks.each(function(_,i){
    if(i%2 !== 0) d3.select(this).remove();
  });
  */

  // Elongate alternate ticks, for legibility.
  d3.selectAll(".tick line")
  .each(function(datum, idx){
    if(idx % 2 !== 0) d3.select(this)
      .attr("y2", "16");
  });

  // We also need to push the placement of text to be under the tick line.
  let _text = d3.selectAll(".tick text");
  _text.each(function(_,i){
    if(i%2 !== 0) d3.select(this)
      .attr("y", "16");
  });
} // End buildTimeline()

// Refresh it
function refreshTicks() {
  let interval = 1000;
  setTimeout('updateTick();', interval);
}

// Restore all ticks to their original styling.
function restoreTicks() {
  d3.selectAll("text")
  .attr("font-size", "10")
  .attr("fill", "currentColor");

  d3.selectAll("line")
  .attr("stroke", "currentColor")
  .attr("stroke-width", "1")
  .attr("y2", "6");
}

// Select a tick where the text is a specific value.
// We can use this to  modify the tick whose text value matches the time.
function updateTick() {
  restoreTicks();
  let time = getTime();

  // Select all tick elements, filtering on the one that matches the seconds
  // value. Then, style it.
  let tick = d3.selectAll("g.tick")
    .filter(function() {
      return d3.select(this.lastChild).text() == time;
    });

  // We expect only 2 children: 'line' and 'text'.
  let _line = d3.select(tick.nodes()[0].firstChild);
  let _text = d3.select(tick.nodes()[0].lastChild);
  _text.attr("font-size", "15").attr("fill", "red");
  _line.attr("y2", "-100")
    .attr("stroke", "red")
    .attr("stroke-width", "3");

  refreshTicks();
}

function prefix_zero(num) {
    return num < 10 ? `0${num}` : num;
}

// Return the time in HH:MM format.
function getTime() {
  let now  = new Date();
  let hour = prefix_zero(now.getHours());
  let min  = prefix_zero(now.getMinutes());
  return `${hour}:${min}`;
}

// This is one half of a main loop between this function and displayTime().
function refresh_time() {
    var interval = 1000; // Milliseconds.
    setTimeout('displayTime()', interval)
}

// Entry point for our program.
function displayTime() {
    var today    = new Date();
    var hour     = prefix_zero(today.getHours());
    var minute   = prefix_zero(today.getMinutes());
    var second   = prefix_zero(today.getSeconds());
    var the_time = `${hour}:${minute}:${second}`;
    document.getElementById('the_clock').innerHTML = the_time;
    updateTick();
    refresh_time();
}

let allNotes = [];

// We'll set meetingStart when the agenda kicks off. We can use it as a key
// in localStorage to maintain some state for the meeting.
let meetingStart;

// Clear any existing notes from the document so we can start fresh.
function clearExistingNotes() {
  let notesParent = document.querySelector("#notes");
  let notes = document.querySelectorAll("#notes .note");
  for (let note of notes) {
    notesParent.removeChild(note);
  }
}

// Get the agenda started by creating an initial note.
function startAgenda() {
  clearExistingNotes();
  buildTimeline();
  let now = new Date();
  meetingStart = now;
  // Create very first note.
  createNote(now);
  // There should only be a single note detail at this point.
  let firstNoteDetail = d3.select('.note-detail');
  firstNoteDetail.text('Meeting started');
  // Get the time display ticking.
  displayTime();
}

/*
 *  Given a date, return milliseconds since the epoch.
 * Sat Jul 17 2021 16:57:34 GMT-0400 (Eastern Daylight Time)
 * -to-
 *  1626555454000
 */
function epoch(date) {
  return Date.parse(date);
}

// Store the current state of all note content.
function storeNoteState() {
  let _allNotes = [];
  let notes = d3.select("#notes").selectAll(".note");
  for (let n of notes) {
    // Get the element's id value.
    let noteId = d3.select(n).attr('id');
    let _epoch = Number(noteId.replace(/^note_/, ""));
    // Select all details for this note.
    let sel = `#${noteId} > .note-details > .note-detail`;
    let details = d3.select(n).selectAll(sel);
    // NOTE: I feel like I'm abusing D3 when I [c|sh]ould use basic getElement*
    // functions. Or D3 is making it too easy for me to use with functions like
    // d3.map().
    // Store each detail's text in a list.
    let noteContents = d3.map(details, d => {
      return d3.select(d).text();
    });
    _allNotes.push({id: _epoch, details: noteContents});
  }
  // Replace the global array.
  allNotes = _allNotes;
  // Store an up-to-date copy in localStorage, keyed by the meeting's start date.
  let allMeetings = JSON.parse(localStorage.getItem("budgenda")) || {}
  allMeetings[meetingStart] = _allNotes;
  localStorage.setItem("budgenda", JSON.stringify(allMeetings));
}

/* Given an epoch value, search among existing notes to find which of them
 * have an earlier date and return that note'd ID.
 * This will be used to figure how where to insert a new note so that it
 * resides chronologically in the set of notes.
 */
function earlierNote(newNoteEpoch) {
  // Create a list of notes' epoch values...
  let notes = d3.select("#notes").selectAll(".note");
  let noteEpochs = d3.map(notes, n => {
    let noteId = d3.select(n).attr("id");
    let noteEpoch = Number(noteId.replace(/^note_/, ""));
    return noteEpoch;
  });

  // If no notes exist, return the new note's epoch.
  if (!noteEpochs.length) {
    return newNoteEpoch;
  }

  // ...sort them in descending order...
  noteEpochs.sort((a,b) => b - a);
  // ...and find the first value that is lower than newNoteEpoch.
  let earlier = noteEpochs.find(e => e < newNoteEpoch);
  // If idxLater == -1, earlier is the _earliest_ because -1 indicates we've wrapped to the end of the array.
  // Calling an array with index -1 returns undefined.
  let idxLater = noteEpochs.indexOf(earlier) - 1;
  let later = noteEpochs[idxLater];

  // The new note is younger than all existing notes.
  // Return the earliest existing note's epoch.
  if (!earlier) {
    return noteEpochs.slice(-1); // Last element in descending order.
  }
  // When our note is between two, insert it before the later of them.
  if (earlier && later) {
    return later;
  }
  // When we have an earlier value but nothing later, this note goes at the end.
  if (earlier && !later) {
    return null;
  }
}

// Given a date string, parse it, and return the time.
function dateToTime(date) {
  let d = new Date(Date.parse(date))
  let hours = prefix_zero(d.getHours());
  let minutes = prefix_zero(d.getMinutes());
  let seconds = prefix_zero(d.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

/* Create a new note element.
 * Secnarios:
 * 1. There are no notes so we append to the top-level #notes.
 *    earlierNote(_epoch) == _epoch
 * 2. There are existing notes so we determine which to insert before.
 *    earlierNote(_epoch) == <some epoch to insert before>
 * 3. There are existing notes and this note is older than them all so
 *    we append to the top-level #notes.
 *    earlierNote(_epoch) == null
*/
function createNote(date) {
  storeNoteState();
  let _epoch = epoch(date);
  // Define an id value to aid in storing and sorting notes.
  let noteId = `note_${_epoch}`;
  let newNote;
  let earlierNoteEpoch = earlierNote(_epoch);
  if (! earlierNoteEpoch || earlierNoteEpoch == _epoch) {
    // append to top-level #notes.
    newNote = d3.select("#notes").append("div")
      .attr("class", "note")
      .attr("id", `${noteId}`);
  } else {
    // insert note after the given note's ID that matches insertNoteBefore
    let earlierNoteId = `#note_${earlierNoteEpoch}`;
    newNote = d3.select("#notes").insert("div", earlierNoteId)
      .attr("class", "note")
      .attr("id", `${noteId}`);
  }

  let checkboxId = `${noteId}_follow_up`;
  newNote.append("input")
    .attr("type", "checkbox")
    .attr("id", checkboxId)
    .attr("class", "note-follow-up")
    .attr("name", "follow-up");

  newNote.append("label")
    .attr("for", checkboxId)
    .attr("class", "note-follow-up")
    .text("Follow-up");

  // Create a div above all details that shows the time of the note.
  newNote.append("div")
    .attr("class", "note-time")
    //.text(date);
    .text(dateToTime(date));

  // Create a contenteditable container for all note details.
  // As a user types notes, new divs will be created (on line breaks).
  newNote.append("div")
    .attr("class", "note-details")
    .attr("contenteditable", true)
    .append("div")
    .attr("class", "note-detail")
    .attr("tabindex", "0") // Make this focusable.
    /* Insert a zero-width character to give the element some height.*/
    .html("&#8203;");

  // Focus on the newly created note.
  let sel = `#${noteId} > .note-details > .note-detail`;
  d3.select(sel).on("focus", setCursor); // On focus, set the cursor.
  let firstDetail = document.querySelector(sel);
  firstDetail.focus();

  // Push the new note into our list of notes.
  allNotes.push({id: _epoch, details: []});
}

// Create a new note when a tick is clicked.
function tickOnClick(_event, datum) {
  // datum here is a Date string.
  if (!allNotes.find(n => n.id == epoch(datum))) {
    createNote(datum);
  }

  // We have a click event registered on a parent that we don't
  // want to fire.
  _event.stopPropagation();
}

// Select all tick text elements and bind events to them.
d3.selectAll(".tick").on("click", tickOnClick);

function timelineOnClick(_event, datum) {
  let date = new Date();
  createNote(date);
}

d3.selectAll(".timeline").on("click", timelineOnClick);

/* Set the cursor so it visibly flashes and allows the user to start typing. */
function setCursor(_event, datum) {
  el = _event.target;
  // Selection here is, roughly, the tick that was clicked.
  let sel = document.getSelection();
  /* By calling collapse() with the node element in the event target, we can
   * tell the browser to blink the caret there.
   * Per https://developer.mozilla.org/en-US/docs/Web/API/Selection/collapse:
   * If the content is focused and editable, the caret will blink there.
   */
  let offset = 1;
  sel.collapse(el, offset);
}
