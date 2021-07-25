
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


// TODO: Learn more about this.
const svg = d3.select("body").append("svg")
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
/*
 * - or -
 *
d3.selectAll(".tick line")
  .attr("y2", function(datum, idx) {
    if(idx % 2 !== 0) {
      return "16";
    } else {
      return "6";
    }
  });
*/

// We also need to push the placement of text to be under the tick line.
let _text = d3.selectAll(".tick text");
_text.each(function(_,i){
  if(i%2 !== 0) d3.select(this)
    .attr("y", "16");
});

// Refresh it
function refreshTicks() {
  let interval = 1000;
  setTimeout('updateTick();', interval);
}

// Restore all ticks to their original styling.
/*
function restoreTicks() {
  d3.selectAll("text")
  .attr("font-size", "10")
  .attr("fill", "currentColor");

  d3.selectAll("line")
  .attr("stroke", "currentColor")
  .attr("stroke-width", "1")
  .attr("y2", "6");
}
*/

function getSeconds() {
  let today = new Date();
  return today.getSeconds();
}
// Select a tick where the text is a specific value.
// We can use this to  modify the tick whose text value matches the seconds!
// TODO: Rename function to clarify it updates the tick whose second is displayed.
function updateTick() {
  //restoreTicks();
  let seconds = getSeconds();

  // Select all tick elements, filtering on the one that matches the seconds
  // value. Then, style it.
  let tick = d3.selectAll("g.tick")
    .filter(function() {
      return d3.select(this.lastChild).text() == seconds;
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
    //updateTick(); // TODO: Fix this; move to minute-ly.
    refresh_time();
}

let allNotes = [];

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
}

// Create a new note element.
// Define an id value to aid in storing and sorting notes.
function createNote(date) {
  storeNoteState();
  let _epoch = epoch(date);
  let noteId = `note_${_epoch}`;
  // FIXME: This append creates new notes at the end of the list.
  // We'll want notes inserted at the correct place chronologically.
  let newNote = d3.select("#notes").append("div")
    .attr("class", "note")
    .attr("id", `${noteId}`);

  // Create a div above all details that shows the time of the note.
  newNote.append("div")
    .attr("class", "note-time")
    .text(date);

  // Create a contenteditable container for all note details.
  // As a user types notes, new divs will be created (on line breaks).
  newNote.append("div")
    .attr("class", "note-details")
    .attr("contenteditable", true)
    .append("div")
    .attr("class", "note-detail")
    .text("> ");

  // Focus on the newly created note.
  // FIXME: This doesn't work quite right. It always focuses on the very last
  // note, regardless of the order in which the notes are created.
  let sel = `#${noteId} > .note-details > .note-detail`;
  let firstDetail = document.querySelector(sel);
  //console.log(firstDetail);
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

