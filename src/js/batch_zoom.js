/* global parentElement, observer:writable*/

let zoomLevel = 0; // stores current zoom level
let listenerAdded = false; // stores whether event listeners were added
let zoomValues = [72, 108, 144, 180, 216]; // "z" value that Slate requires to determine size of the document render
// TODO:get the click drag working

let targetElement3 = parentElement.body;

observer = new MutationObserver(() => {
  if (
    document.getElementById('batch_pages') !== null &&
    listenerAdded == false
  ) {
    let docWindow = document.getElementById('batch_pages');
    docWindow.addEventListener('load', addListener, true);
  }
});

observer.observe(targetElement3, { subtree: true });

parentElement.addEventListener('keypress', batchZoom, true);

// adds event listeners needed for userscript to function
function addListener() {
  if (listenerAdded) {
    return;
  } else {
    // grabs images and attaches listeners
    const elements = document.querySelectorAll('.batch_page_container > img');
    elements.forEach(el => {
      el.addEventListener('click', batchZoom, true);
      el.addEventListener('contextmenu', batchZoom, true);
      el.classList.add('dragscroll');
    });

    // needed to determine whether "next" buttons, etc. are pressed, meaning listeners have to be attached again
    const buttons = document.querySelectorAll('button[type="button"]');
    buttons.forEach(el => {
      el.addEventListener('click', () => {
        zoomLevel = 0;
        listenerAdded = false;
      });
    });
    listenerAdded = true;
  }
}

// toggles between zoom levels
function batchZoom(event) {
  if (parentElement.activeElement.nodeName == 'INPUT') {
    return;
  } else {
    if (
      event.code == 'NumpadAdd' ||
      event.code == 'Equal' ||
      event.type == 'click'
    ) {
      event.preventDefault();
      if (zoomLevel == 4) {
        hideZoomer();
        return;
      }

      // selects image elements loaded by batch acquire
      const elements = document.querySelectorAll('.batch_page_container > img');

      // replaces the existing "z" value in the URL of documents
      elements.forEach(el => {
        if (el.src.includes(`z=${zoomValues[zoomLevel]}`)) {
          el.src = el.src.replace(
            `z=${zoomValues[zoomLevel]}`,
            `z=${zoomValues[zoomLevel + 1]}`
          );
        }
      });
      zoomLevel++;
      hideZoomer();
    } else if (
      event.code == 'NumpadSubtract' ||
      event.code == 'Minus' ||
      event.type == 'contextmenu'
    ) {
      event.preventDefault();
      if (zoomLevel == 0) {
        return;
      }
      const elements = document.querySelectorAll('.batch_page_container > img');
      elements.forEach(el => {
        if (el.src.includes(`z=${zoomValues[zoomLevel]}`)) {
          el.src = el.src.replace(
            `z=${zoomValues[zoomLevel]}`,
            `z=${zoomValues[zoomLevel - 1]}`
          );
        }
      });
      zoomLevel--;
    }
  }
}

/* kinda janky way to automatically close Slate's useless magnifying glass thingy*/
function hideZoomer() {
  let targetNode = document.getElementsByClassName('batch_zoomer boxshadow')[0];
  if (targetNode) {
    targetNode.parentNode.removeChild(targetNode);
  }
}
