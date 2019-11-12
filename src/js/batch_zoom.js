// stores current zoom level
var zoomCount = 0;
// stores whether event listeners were added
var ListenerAdded = false
// "z" value that Slate requires to determine size of the document render
var zoom_Levels = [72, 108, 144, 180, 216];


const parentElement = window.document;
const mutationConfig = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: true
};

var onMutate = function () {
  if (document.getElementById('batch_pages') !== null) {
    var docWindow = document.getElementById('batch_pages');
    docWindow.addEventListener('keydown', Toggle_Zoom, true);
    docWindow.addEventListener('load', add_Listener, true);
  }
};

var observer = new MutationObserver(onMutate);
observer.observe(window.document, mutationConfig);

// toggles between zoom levels
function Toggle_Zoom(event) {
  if (event.code == 'NumpadAdd' || event.code == 'Equal' || event.type == 'click') {
    event.preventDefault();
    if (zoomCount == 4) {
      Click_Zoomer();
      return;
    }
    // selects image elements loaded by batch acquire
    const elements = document.querySelectorAll('.batch_page_container > img');
    // replaces the existing "z" value in the URL of documents
    elements.forEach(function (el) {
      if (el.src.includes(`z=${zoom_Levels[zoomCount]}`)) {
        el.src = el.src.replace(`z=${zoom_Levels[zoomCount]}`, `z=${zoom_Levels[zoomCount + 1]}`);
      }
    });
    zoomCount++;
    Click_Zoomer();
  } else if (event.code == 'NumpadSubtract' || event.code == 'Minus' || event.type == 'contextmenu') {
    event.preventDefault();
    if (zoomCount == 0) {
      return
    };
    const elements = document.querySelectorAll('.batch_page_container > img');
    elements.forEach(function (el) {
      if (el.src.includes(`z=${zoom_Levels[zoomCount]}`)) {
        el.src = el.src.replace(`z=${zoom_Levels[zoomCount]}`, `z=${zoom_Levels[zoomCount - 1]}`);
      }
    });
    zoomCount--;
  }
}

// adds event listeners needed for userscript to function
function add_Listener() {
  if (ListenerAdded) {
    return;
  } else {
    // grabs images and attaches listeners
    const elements = document.querySelectorAll('.batch_page_container > img');
    elements.forEach(function (el) {
      el.addEventListener('click', Toggle_Zoom, true)
      el.addEventListener('contextmenu', Toggle_Zoom, true)
    });
    // needed to determine whether "next" buttons, etc. are pressed, meaning listeners have to be attached again
    const buttons = document.querySelectorAll('button[type="button"]');
    buttons.forEach(function (el) {
      el.addEventListener('click', function () {
        zoomCount = 0
        ListenerAdded = false
      })
    });
    !ListenerAdded
  }
}

/* kinda janky way to automatically close the useless magnifying glass that Slate has by
immediately simulating a left mouse click to close the magnifier*/
function Click_Zoomer() {
  var targetNode = document.getElementsByClassName('batch_zoomer boxshadow')[0];
  if (targetNode) {
    //--- Simulate a natural mouse-click sequence.
    triggerMouseEvent(targetNode, "mousedown");
    triggerMouseEvent(targetNode, "mouseup");
    triggerMouseEvent(targetNode, "click");
  }

  function triggerMouseEvent(node, eventType) {
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
  }
}