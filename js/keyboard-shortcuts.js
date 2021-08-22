const helpModal = document.getElementById("help-modal");
document.addEventListener("keydown", handleKeydown);

// keyCode is deprecated. use .key
function handleKeydown(_event) {
  if (_event.metaKey) {
    // Meta + /
    if (_event.key === '/') {
      // Toggle help modal.
      helpModal.style.display =
        // On first page load, inline style is empty.
        (helpModal.style.display.length === 0 ||
          helpModal.style.display === "none") ? "block": "none";
    }
  }
}
