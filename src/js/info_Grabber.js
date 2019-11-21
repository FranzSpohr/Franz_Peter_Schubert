const currentAppl = {
  slateID: null,
  UMID: null,
  firstName: null,
  lastName: null,
  fullName: null,
  birthDay: null,
  applUnit: null,
  applTerm: null,
  applYear: null,
};

var currentApp = document.getElementsByClassName('reader_header_title')[0];

const parentElement = window.document;

const mutationConfig = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: true,
  attributeFilter: ['class', 'src', 'id', 'style'],
};
/*
function onMutate(mutations) {
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
}

var observer = new MutationObserver(onMutate);
observer.observe(
  document.getElementsByClassName('viewport')[0],
  mutationConfig
);

//observer.observe(parentElement.body, mutationConfig);

var UMID = (() => {
  const readerFrame = document.getElementsByTagName('iframe')[0].contentWindow
    .document.body;
  const readerTable = readerFrame.getElementsByClassName('grey')[0];
  if (readerTable.rows[1].cells[0].innerHTML == 'UMID:') {
    return readerTable.rows[1].cells[1].innerHTML;
  } else {
    return 'n/a';
  }
})();*/
