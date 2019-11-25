/* global buttonShow*/

// TODO: add Fira

const currentAppl = {
  slateID: null,
  UMID: null,
  firstName: null,
  lastName: null,
  fullName: null,
  birthDate: null,
  applUnit: null,
  applTerm: null,
  applYear: null,
};

const mutationConfig = {
  attributeFilter: ['class', 'src', 'id', 'style'],
  attributeOldValue: true,
  childList: true,
  subtree: true,
  characterDataOldValue: true,
};

const parentElement = window.document;

let targetElement = document.getElementsByClassName('reader_header_title')[0];

let onMutate = () => {
  if (MutationRecord.oldValue !== targetElement.innerHTML) {
    document.querySelector(
      'body > div.reader_viewer.reader_scrollable > div > div.container.active.loaded > div > img'
    );
    console.log('loaded');
    buttonShow.disabled = false;
  } else {
    buttonShow.disabled = true;
  }
};

let observer = new MutationObserver(onMutate);
observer.observe(
  document.getElementsByClassName('viewport')[0],
  mutationConfig
);

observer.observe(parentElement.body, mutationConfig);

currentAppl.UMID = (() => {
  const readerFrame = document.getElementsByTagName('iframe')[0].contentWindow
    .document.body;
  const readerTable = readerFrame.getElementsByClassName('grey')[0];
  if (readerTable.rows[1].cells[0].innerHTML == 'UMID:') {
    return readerTable.rows[1].cells[1].innerHTML;
  } else {
    return 'n/a';
  }
})();
