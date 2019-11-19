var zoomLevel = 0; // zoom level of a page
var slideIndex = 1; // which page to display in viewer
var imageLoaded = false; // toggled when higher DPI images are loaded
var activeTab; // Slate tab that the images were loaded from
var activeApp; // app currently being displayed
var tooltipTimer; // for the timer that times out the tooltip after 15 seconds
var pageNumber; // stores the element containing page numbers

// injects button into the footer of Slate Reader. clicking it will open the viewer.
var buttonShow = document.createElement('input');
buttonShow.type = 'button';
buttonShow.id = 'buttonSchubert';
buttonShow.value = 'Display Larger Images';
buttonShow.disabled = true;
buttonShow.onclick = overlayOn;
document.getElementsByClassName('reader_footer')[0].appendChild(buttonShow);

const parentElement = window.document;
const mutationConfig = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: true,
  attributeFilter: ['class']
};

var onMutate = () => {
  if (
    document.querySelector(
      'body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img'
    ) !== null
  ) {
    console.log('loaded');
    buttonShow.disabled = false;
  } else {
    buttonShow.disabled = true;
  }
};

var observer = new MutationObserver(onMutate);
observer.observe(parentElement.body, mutationConfig);

// creates an overlay that serves as a canvas for all elements created by this userscript
var overlay = document.createElement('div');
overlay.id = 'overlaySchubert';
overlay.ondblclick = () => readerZoom('leftClick');
overlay.oncontextmenu = () => readerZoom('rightClick');
document.body.appendChild(overlay);
overlay.addEventListener('keydown', key_handler, true);
overlay.addEventListener('wheel', hideElements, {
  passive: false
});
overlay.addEventListener('wheel', hideTooltip, {
  passive: false
});
overlay.className = 'dragscroll'; // enables scrolling by mouse drag
overlay.tabIndex = -1; // enables keyboard controls by setting focus on the overla

// calls overlay and displays higher DPI images
function overlayOn() {
  // needs to be loaded first to determine whether the current Slate tab has any images or not, displays alert if no images available
  const imageLink = document.querySelector(
    'body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img'
  );
  if (imageLink == null) {
    alert('Navigate to a tab with documents first.');
    return;
  }
  // uses regular expressions to extract data needed to determine the number of needed new HTML elements
  var startPage = 1;
  var currentPage = document
    .getElementsByClassName('reader_status')[0]
    .childNodes[0].textContent.match(/\d+/);
  var endPage = document
    .getElementsByClassName('reader_status')[0]
    .childNodes[0].textContent.match(/\d+(?=,)/);

  // determines which Slate tab is currently being displayed
  var targetApp = document.getElementsByClassName('reader_header_title')[0]
    .innerHTML;
  var targetTab = document.getElementsByClassName('stream active')[0].innerHTML;

  if (imageLoaded) {
    // determines whether the Slate tab or student being displayed has changed. If changed, deletes existing HTML elements and creates new ones
    if (activeTab !== targetTab || activeApp !== targetApp) {
      while (overlay.firstChild) {
        // necessary to prevent unused HTML elements from cluttering the page
        overlay.removeChild(overlay.firstChild);
      }
      addElements(imageLink, startPage, endPage, currentPage);
      displayTooltip();
    } else {
      slideIndex = parseInt(currentPage, 10); // for whatever reason, parseInt is required to convert the slindeIndex into an integer
      showSlides(slideIndex);
      displayTooltip();
      overlay.scrollTo(0, 0); // return to top of the page
      return;
    }
  } else {
    addElements(imageLink, startPage, endPage, currentPage);
    displayTooltip();
  }
}

// adds HTML elements needed for the userscript to function
function addElements(imageSrc, startPg, endPg, currPg) {
  var iframeUM = document.getElementsByTagName('iframe')[0].contentWindow
    .document.body; // iframe declared to access student info
  var table = iframeUM.getElementsByClassName('grey')[0]; // declares table containing UMID
  var appName = iframeUM.getElementsByClassName('fullname')[0].innerHTML; // student name
  var appID =
    table.rows[1].cells[0].innerHTML + ' ' + table.rows[1].cells[1].innerHTML; // student UMID

  var studentInfo = document.createElement('div');
  studentInfo.id = 'studentSchubert';
  studentInfo.innerHTML = appName + '<br>' + appID;
  studentInfo.onclick = overlayOff;
  document.getElementById('overlaySchubert').appendChild(studentInfo);

  var openTooltip = document.createElement('div');
  openTooltip.id = 'opentooltipSchubert';
  openTooltip.innerHTML = '?';
  openTooltip.onclick = displayTooltip;
  document.getElementById('overlaySchubert').appendChild(openTooltip);

  // page counter on the upper right corner, does not need to be looped? Fixed
  var pgCounter = document.createElement('div');
  pgCounter.id = 'numbertextSchubert';
  pgCounter.innerHTML = 'Page ' + currPg + ' of ' + endPg;
  pgCounter.onclick = overlayOff;
  document.getElementById('overlaySchubert').appendChild(pgCounter);

  // creates anchor elements on the edges of the screen for switching between pages
  var forward = document.createElement('a');
  forward.className = 'nextSchubert';
  forward.onclick = () => plusSlides(1);
  forward.innerHTML = '&#10095';
  document.getElementById('overlaySchubert').appendChild(forward);

  // creates anchor elements on the edges of the screen for switching between pages
  var backward = document.createElement('a');
  backward.className = 'prevSchubert';
  backward.onclick = () => plusSlides(-1);
  backward.innerHTML = '&#10094';
  document.getElementById('overlaySchubert').appendChild(backward);

  // container for the navigation dots
  var dotContainer = document.createElement('div');
  dotContainer.id = 'dotContainerSchubert';
  document.getElementById('overlaySchubert').appendChild(dotContainer);

  for (let i = startPg; i <= endPg; i++) {
    // Contains the images
    var slides = document.createElement('div');
    slides.id = 'slide_' + i;
    slides.className = 'mySlidesSchubert';
    document.getElementById('overlaySchubert').appendChild(slides);

    // dots that can be used to navigate pages
    var navDots = document.createElement('span');
    navDots.className = 'dotSchubert';
    navDots.onclick = () => currentSlide(i);
    dotContainer.appendChild(navDots);

    // displays page info above dots
    var dotHover = document.createElement('span');
    dotHover.className = 'dotHoverSchubert';
    dotHover.innerHTML = 'Page ' + i;
    navDots.appendChild(dotHover);

    var imageElement = document.createElement('img'); // element for higher DPI images of the documents
    var imageNewSrc = imageSrc.src.replace(/z=\d*/, 'z=300'); // replaces the part of URL that specifies DPI of the image
    var errorDPI = 200; // lowers requested DPI if image fails to be loaded

    // modifies the page number component of the URL to attach correct pages to the slides
    imageNewSrc = imageNewSrc.replace(/pg=\d*/, `pg=${i - 1}`);
    imageElement.id = 'image_' + i;
    imageElement.src = imageNewSrc;
    imageElement.style.width = '100%';
    // if image cannot be loaded due to request DPI being too high, lowers DPI by 10 until loading is succesful
    imageElement.onerror = () => {
      errorDPI -= 10;
      this.src = this.src.replace(/z=\d*/, `z=${errorDPI}`);
    };
    document.getElementById('slide_' + i).appendChild(imageElement);
  }
  activeTab = document.getElementsByClassName('stream active')[0].innerHTML;
  activeApp = document.getElementsByClassName('reader_header_title')[0]
    .innerHTML;
  pageNumber = document.getElementById('numbertextSchubert');
  zoomLevel = 0;
  imageLoaded = true;
  slideIndex = parseInt(currPg, 10);
  showSlides(slideIndex); // opens the viewer and displays the page currently being displayed in Slate Reader
}

// handles keyboard inputs
function key_handler(event) {
  hideTooltip();
  if (event.code == 'ArrowRight') {
    plusSlides(1);
  } else if (event.code == 'ArrowLeft') {
    plusSlides(-1);
  } else if (event.code == 'Escape') {
    overlayOff();
  }
  event.stopPropagation(); // without this, pages in Slate Reader will scroll even with the zoomed viewer displayed.
}

function overlayOff() {
  const element = document.getElementById('image_' + slideIndex);
  // resets the zoom state of the current page displayed
  element.setAttribute('style', 'width:100%');
  zoomLevel = 0;
  document.getElementById('overlaySchubert').style.display = 'none';
  hideTooltip();
}

// kind of a janky way to change zoom levels of a document by just changing image's width, could use improvement?
function readerZoom(mouseButton) {
  const element = document.getElementById('image_' + slideIndex);
  var zLevels = [100, 125, 150];
  hideTooltip();
  if (mouseButton == 'leftClick') {
    zoomLevel++;
    overlay.style.cursor = 'zoom-in';
    if (zoomLevel >= zLevels.length) {
      zoomLevel = 0;
    }
  } else if (mouseButton == 'rightClick') {
    overlay.style.cursor = 'zoom-in';
    if (zoomLevel == 0) {
      overlayOff();
    } else {
      zoomLevel--;
    }
  }
  element.setAttribute('style', 'width:' + zLevels[zoomLevel] + '%');
}

// displays tooltip. Should disappear after 10 seconds or upon any input from the user
function displayTooltip() {
  var tooltip = document.createElement('div');
  tooltip.id = 'tooltipSchubert';
  tooltip.style.display = 'block';
  tooltip.innerHTML = '<iframe src="src/html/reader_tooltip.html" ></iframe>';
  document.getElementById('overlaySchubert').appendChild(tooltip);
  // automatically hides tooltip after 15 seconds
  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    if (document.getElementById('tooltipSchubert') == null) {
      return;
    } else {
      tooltip.parentNode.removeChild(tooltip);
    }
  }, 15000);
  overlay.style.display = 'block';
  overlay.focus();
}

// HTML element for the tooltip destroyed after each instance to prevent clutter
function hideTooltip() {
  var tooltip = document.getElementById('tooltipSchubert');
  clearTimeout(tooltipTimer);
  if (tooltip != null) {
    tooltip.parentNode.removeChild(tooltip);
  }
}

// needed to reset the timer and prevent the dot from appearing again too soon
var timeoutHandle = setTimeout(() => {
  if (document.getElementById('dotContainerSchubert') == null) {
    return;
  } else {
    document.getElementById('dotContainerSchubert').style.display = 'block';
    document.getElementById('studentSchubert').style.display = 'block';
    pageNumber.style.display = 'block';
  }
}, 500);

function hideElements() {
  document.getElementById('dotContainerSchubert').style.display = 'none';
  document.getElementById('studentSchubert').style.display = 'none';
  pageNumber.style.display = 'none';
  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(() => {
    if (document.getElementById('dotContainerSchubert') == null);
    document.getElementById('dotContainerSchubert').style.display = 'block';
    document.getElementById('studentSchubert').style.display = 'block';
    pageNumber.style.display = 'block';
  }, 500);
}

// handles switching between pages
function plusSlides(n) {
  const currImage = document.getElementById('image_' + slideIndex);
  currImage.setAttribute('style', 'width:100%');
  zoomLevel = 0;
  showSlides((slideIndex += n));
  overlay.scrollTo(0, 0); // return to top of the page
}

// used by dots to navigate pages
function currentSlide(n) {
  showSlides((slideIndex = n));
}

// adopted from slideshow turorial in W3C
function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName('mySlidesSchubert');
  var dots = document.getElementsByClassName('dotSchubert');
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(' activeSchubert', '');
  }
  slides[slideIndex - 1].style.display = 'block';
  dots[slideIndex - 1].className += ' activeSchubert';
  pageNumber.innerHTML = pageNumber.innerHTML.replace(
    /^[^\d]*(\d+)/,
    'Page ' + slideIndex
  );
}
