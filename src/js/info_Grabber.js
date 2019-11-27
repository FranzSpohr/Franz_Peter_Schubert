const readerFrame = document.getElementsByTagName('iframe')[0];

readerFrame.addEventListener('load', function() {
  console.log(currentAppl.UMID());
});

const currentAppl = {
  slateID: null,
  UMID: function() {
    const frameContent = readerFrame.contentWindow.document.body;
    const frameTable = frameContent.getElementsByClassName('grey')[0];
    if (frameTable.rows[1].cells[0].innerHTML == 'UMID:') {
      return frameTable.rows[1].cells[1].innerHTML;
    } else {
      return 'n/a';
    }
  },
  firstName: null,
  lastName: null,
  fullName: null,
  birthDate: null,
  applUnit: null,
  applTerm: null,
  applYear: null,
};

const parentElement = window.document;

let targetElement1 = parentElement.getElementsByClassName(
  'reader_header_title'
)[0];

let observer = new MutationObserver(() => {
  if (targetElement1.textContent !== 'Technolutions Slate') {
    console.log(currentAppl.UMID());
  }
});

observer.observe(targetElement1, { childList: true });
