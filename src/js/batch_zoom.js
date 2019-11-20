var zoomLevel = 0; // stores current zoom level
var listenerAdded = false; // stores whether event listeners were added
var zoomValues = [72, 108, 144, 180, 216]; // "z" value that Slate requires to determine size of the document render

const parentElement = window.document;

const mutationConfig = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: true,
  attributeFilter: ['id', 'style', 'class'],
};

var onMutate = () => {
  if (
    document.getElementById('batch_pages') !== null &&
    listenerAdded == false
  ) {
    var docWindow = document.getElementById('batch_pages');
    docWindow.addEventListener('load', addListener, true);
  }
};

var observer = new MutationObserver(onMutate);
observer.observe(parentElement.body, mutationConfig);

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
  var targetNode = document.getElementsByClassName('batch_zoomer boxshadow')[0];
  if (targetNode) {
    targetNode.parentNode.removeChild(targetNode);
  }
}
