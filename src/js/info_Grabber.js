const currentAppl = {};

/*
async function checkElement(selector) {
  while (document.getElementsByTagName(selector)[0] == undefined) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    document.getElementsByTagName(selector)[0].addEventListener('load', () => {
      if (
        document.getElementsByTagName(selector)[0].contentWindow !== undefined
      ) {
        console.log(currentAppl.UMID());
      }
      console.log(document.getElementsByTagName(selector)[0]);
      return document.getElementsByTagName(selector)[0];
    });
  }
}
*/

let targetElement = selector => {
  return document.querySelector(selector);
};

let observer = new MutationObserver(() => {
  if (
    targetElement('.reader_header_title').textContent !== 'Technolutions Slate'
  ) {
    console.log(targetElement('.reader_header_title').textContent);
  }
});

observer.observe(targetElement('.reader_header_title'), { childList: true });

function frameLoaded() {
  return new Promise(resolve => {
    resolve(console.log('hmph'));
  });
}

// TODO: probably something to do with iframe, eventlistener is not firing when it should
observer = new MutationObserver(mutations => {
  for (let mutation of mutations) {
    if (mutation.target.nodeName == 'IFRAME') {
      targetElement('iframe').addEventListener('load', frameLoaded());
    }
  }
});

getData();

observer.observe(targetElement('.reader_viewer2'), {
  childList: true,
  attributeFilter: ['src'],
});

async function getData() {
  await frameLoaded();
  const frameReader = targetElement('iframe').contentDocument.body;
  const frameTable = frameReader.querySelector('.grey');
  currentAppl.UMID = () => {
    if (frameTable.rows[1].cells[0].innerHTML == 'UMID:') {
      return frameTable.rows[1].cells[1].textContent;
    } else {
      return 'n/a';
    }
  };
  console.log(currentAppl.UMID());
}

/*
targetElement('.reader_header_title');

var frameReader = checkElement('iframe');

const currentAppl = {
  slateID: null,
  UMID: function() {
    const frameContent = frameReader.contentWindow.document.body;
    const frameTable = frameContent.getElementsByClassName('grey')[0];
    if (frameTable.rows[1].cells[0].innerHTML == 'UMID:') {
      return frameTable.rows[1].cells[1].textContent;
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

console.log(currentAppl.UMID());
*/
