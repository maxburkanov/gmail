'use strict';

var test = 'This is a text';
//this is test bellow
var myData = void 0;
var currDisplayedData = void 0;
var dropdownForSearch = document.querySelector('.search-displayer');
var main = document.querySelector('.email');
var tabs = document.querySelector('.tab');
var mailWindow = document.querySelector('.mail-window');
var tabsBorder = document.querySelectorAll('.bottom');
var pageLeft = document.querySelector('.page-left');
var pageRight = document.querySelector('.page-right');
var pageRange = document.querySelector('.current-page');
var social = void 0;
var promotions = void 0;
var updates = void 0;
var searchedResult = {};
var page = 1;
var searchBar = document.querySelector('#search');

for (var i = 0; i < tabs.children.length; i++) {
  tabs.children[i].setAttribute('area-label', tabs.children[i].innerText);
  tabsBorder[i].setAttribute('area-label', tabs.children[i].innerText);
}

fetch('https://polar-reaches-49806.herokuapp.com/api?page=1&category=primary').then(function (response) {
  return response.json();
}).then(function (data) {
  onReady(data);
}).catch(function (error) {
  console.log(error);
});

function onReady(fetchedData) {
  myData = fetchedData;
  myData = addIdToData(myData);
  social = toSocial(myData);
  promotions = toPromotions(myData);
  updates = toUpdates(myData);
  tabs.children[0].click();
}

//event Listener on tabs
tabs.addEventListener('click', tabsClicked);
function tabsClicked(e) {
  page = 1;
  if (e.target.nodeName !== 'DIV') return;
  var curr = e.target;
  for (var _i = 0; _i < tabsBorder.length; _i++) {
    tabsBorder[_i];
    tabs.children[_i].removeAttribute('style');
    if (tabsBorder[_i].classList.contains('tabs')) {
      tabsBorder[_i].classList.remove('tabs');
    }
    tabsBorder[_i].style.backgroundColor = 'transparent';
  }
  curr.children[1].classList.add('tabs');
  curr.style.color = tabsColor(curr);
  curr.children[1].style.backgroundColor = tabsColor(curr);
  var data = getUndeletedEmails();
  checkPaginationButtons(page, Math.ceil(data.items.length / 20));
  displayPageRange(data);
  listAllEmails(data);
}

// HELPER FUNCTION ADDED NEW
function detectWhichTab() {
  var tab = document.querySelector('.active');
  var target = tab.getAttribute('area-label');
  var subData = void 0;
  switch (target) {
    case 'Social':
      subData = social;
      break;
    case 'Promotions':
      subData = promotions;
      break;
    case 'Updates':
      subData = updates;
      break;
    default:
      subData = myData;
  }
  return subData;
}

// HELPER FUNCTION ADDED NEW
function removeAllFromDom() {
  main = document.querySelector('.email');
  while (!main.lastElementChild.hasAttribute('status')) {
    main.removeChild(main.lastElementChild);
  }
}

//HELPER FUNCTION ADDED NEW
function tabsColor(curr) {
  document.querySelectorAll('.tabs-hover').forEach(function (val) {
    val.classList.remove('active');
  });
  /// loop tabs ad remove active class
  curr.classList.add('active');
  var current = curr.getAttribute('area-label');
  return current == 'Primary' ? '#D93025' : current == 'Social' ? '#1A73E8' : current == 'Promotions' ? '#188038' : '#DD7607'; //then it's gotta be updates
}

function listAllEmails(data) {
  currDisplayedData = data;
  removeAllFromDom();
  var list = document.querySelector('[status="template"]');
  var uppLimit = data.items.length > 20 ? 20 : data.items.length;

  for (var _i2 = 0; _i2 < uppLimit; _i2++) {
    var anEmail = list.cloneNode(true);
    anEmail.style.display = 'block';
    anEmail.removeAttribute('status');
    if (!data.items[_i2].isRead) {
      anEmail.classList.add('unread');
    } else if (data.items[_i2].isRead) {
      anEmail.classList.remove('unread');
    }

    var senderName = anEmail.querySelector('.sender-name');
    var senderEmail = anEmail.querySelector('.sender-email');
    var messageTitle = anEmail.querySelector('.message-title');
    var message = anEmail.querySelector('.message');
    var emailTime = anEmail.querySelector('.email-time');
    var emailDate = new Date(data.items[_i2].date);
    var stringDate = formatDate(emailDate, 'forEmailList');
    senderName.innerHTML = data.items[_i2].senderName;
    senderEmail.innerHTML = data.items[_i2].senderEmail;
    messageTitle.innerHTML = data.items[_i2].messageTitle;
    message.innerHTML = data.items[_i2].messages[0].message;
    emailTime.innerHTML = stringDate;
    anEmail.setAttribute('data-id', data.items[_i2].id);
    anEmail.addEventListener('click', openEmail);
    main.appendChild(anEmail);
  }
}

function addIdToData(data) {
  for (var _i3 = 0; _i3 < data.items.length; _i3++) {
    data.items[_i3].id = _i3;
  }
  return data;
}

function formatDate(date, format) {
  var result = '';
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var acceptedFormats = ['forEmailList', 'forOpennedEmail', 'forSearResults'];
  if (acceptedFormats.includes(format)) {
    switch (format) {
      case acceptedFormats[0]:
        result = date.getDate() + ' ' + monthNames[date.getMonth()].substr(0, 3);
        break;
      case acceptedFormats[1]:
        result = '\n        ' + date.getDate() + ' \n        ' + monthNames[date.getMonth()].substr(0, 3) + ' \n        ' + date.getFullYear() + ', \n        ' + date.getHours() + ':' + date.getMinutes() + '\n        ';
        break;
      case acceptedFormats[1]:
        result = date.getMonth() + ' ' + date.getDate() + ' ' + date.getFullYear() % 100;
        break;
    }
  } else {
    console.log('Date format not supported');
  }
  return result;
}

function toSocial(data) {
  var social = {};
  social.items = data.items.filter(function (i) {
    return (i.senderName == 'Facebook' || i.senderName == 'Seytech Co') && !i.tags.isTrash && !i.tags.isSpam;
  });
  social.next = data.next;
  social.next.page = social.items.length < 50 ? 1 : 2;
  social.total = social.items.length;
  return social;
}

//THIS SECTION IS FOR FILTERING RAW DATA
function toPromotions(data) {
  var promotions = {};
  promotions.items = data.items.filter(function (i) {
    return (i.senderName == 'Chase' || i.senderName == 'Seytech Co') && !i.tags.isTrash && !i.tags.isSpam;
  });

  promotions.next = data.next;
  promotions.next.page = promotions.items.length < 50 ? 1 : 2;
  promotions.total = promotions.items.length;
  return promotions;
}

function toUpdates(data) {
  var updates = {};
  updates.items = data.items.filter(function (i) {
    return (i.senderName == 'Michael Dunn' || i.senderName == 'Seytech Co') && !i.tags.isTrash && !i.tags.isSpam;
  });
  updates.next = data.next;
  updates.next.page = updates.items.length < 50 ? 1 : 2;
  updates.total = updates.items.length;
  return updates;
}

// OPEN INDIVIDUAL EMAIL
function openEmail(event) {
  currDisplayedData = detectWhichTab();
  var curID = void 0;
  var currElement = event.target;
  if (currElement.classList.contains('email-delete')) {
    curID = getIdOfEmailClicked(currElement);
    myData.items[curID].tags.isTrash = true;
    var data = getUndeletedEmails();
    displayPageRange(data);
    listAllEmails(data);
    return;
  }
  if (myData) {
    pageRange.innerHTML = 'not developed';
    pageLeft.setAttribute('active', false);
    pageRight.setAttribute('active', false);
    var openWindowEmail = document.querySelector('.opened-email');
    curID = getIdOfEmailClicked(currElement);
    myData.items[curID].isRead = true;
    updateCurrDisplayedData();
    removeAllFromDom();
    hideMainCheckBox();
    openWindowEmail.style.display = 'block';
    var senderName = document.querySelector('.sender-full-name');
    senderName.innerHTML = myData.items[curID].senderName;
    var emailAddress = document.querySelector('.sender-email-open');
    emailAddress.innerHTML = myData.items[curID].senderEmail;
    var emailSubject = document.querySelector('.subject');
    emailSubject.innerHTML = myData.items[curID].messageTitle;
    var emailMessage = document.querySelector('.message-open');
    emailMessage.innerHTML = myData.items[curID].messages[0].message;
    var emailTime = document.querySelector('.time-date-openned');
    var emailDate = new Date(myData.items[curID].date);
    var stringDate = formatDate(emailDate, 'forOpennedEmail');
    emailTime.innerHTML = stringDate;
  }
}

function hideMainCheckBox() {
  var mainCheckBox = document.querySelector('#selectAll');
  mainCheckBox.style.display = 'none';
  var arrowDown = document.querySelector('.fa-caret-down');
  arrowDown.style.display = 'none';
  var returnButton = document.querySelector('.return');
  returnButton.style.display = 'block';
  returnButton.addEventListener('click', closeOpenedEmail);
}

function closeOpenedEmail() {
  var mainCheckBox = document.querySelector('#selectAll');
  mainCheckBox.style.display = 'block';
  var arrowDown = document.querySelector('.fa-caret-down');
  arrowDown.style.display = 'block';
  var returnButton = document.querySelector('.return');
  returnButton.style.display = 'none';
  var openWindowEmail = document.querySelector('.opened-email');
  openWindowEmail.style.display = 'none';
  page = 1;
  debugger;
  displayPageRange(currDisplayedData);
  checkPaginationButtons(page, Math.ceil(currDisplayedData.items.length / 20));
  listAllEmails(currDisplayedData);
}

function getIdOfEmailClicked(element) {
  var checkedElement = element;
  while (!checkedElement.hasAttribute('data-id')) {
    checkedElement = checkedElement.parentElement;
  }
  return checkedElement.getAttribute('data-id');
}

// Tool
document.getElementById('selectAll').addEventListener('click', function (ev) {
  ev.target.parentNode.parentNode.classList[ev.target.checked ? 'add' : 'remove']('selected');
}, false);

//EVENT LISTENER FOR SEARCH BAR -- OUR LOCAL SEARCH ENGINE
var drop = document.querySelector('.middle div');
var searchMiddle = document.querySelector('.middle');

searchBar.addEventListener('input', getSearchCriteria);

function getSearchCriteria(e) {
  if (e.target.value == '') {
    dropdownForSearch.innerHTML = '';
  }
  drop.style.display = 'block';
  searchedResult.items = [];
  for (var _i4 = 0; _i4 < myData.items.length; _i4++) {
    for (var k in myData.items[_i4]) {
      if (typeof myData.items[_i4][k] == 'string' && k !== 'date') {
        if (e.target.value === '') {
          searchedResult.items.length = 0;
          searchedResult.total = searchedResult.items.length;
          return;
        }
        if (myData.items[_i4][k].toLowerCase().includes(e.target.value.trim().toLowerCase())) {
          searchedResult.items.push(myData.items[_i4]);
        }
      } else {
        if (Array.isArray(myData.items[_i4][k])) {
          for (var j = 0; j < myData.items[_i4][k].length; j++) {
            console.log('this', myData.items[_i4][k]);
            //       console.log('this',myData.items[i][k])
            if (myData.items[_i4][k][0].message.toLowerCase().includes(e.target.value.trim().toLowerCase())) {
              searchedResult.items.push(myData.items[_i4]);
            }
          }
        }
      }
    }
  }
  searchedResult.next = searchedResult.next;
  searchedResult.total = searchedResult.items.length;
  console.log(e.target.value, searchedResult);
  if (!drop.classList.contains('search-drop-result')) {
    drop.classList.toggle('search-drop-result');
  }

  renderToDropMenu();
}

function renderToDropMenu() {
  dropdownForSearch.innerHTML = '';

  for (var _i5 = 0; _i5 < searchedResult.total; _i5++) {
    var date = new Date(searchedResult.items[_i5].date);
    var div = document.createElement('div');
    div.className = 'searched-email';
    div.innerHTML = '\n      <div class="left-side">\n        <i class="fas fa-envelope"></i>\n        <div class="searched-message">\n          <div class="searched-top">\n            ' + searchedResult.items[_i5].messageTitle + '\n          </div>\n          <div class="searched-bottom">\n            ' + searchedResult.items[_i5].senderName + '\n          </div>\n        </div>\n      </div>\n      <div class="right-side">\n        ' + date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear() % 100 + '\n      </div>\n    ';
    div.setAttribute('data-id', searchedResult.items[_i5].id);
    console.log(div.getAttribute('data-id'), 'id-match', searchedResult.items[_i5].id);
    div.addEventListener('click', openEmail);
    dropdownForSearch.appendChild(div);
  }
}

//SIDEBAR SWITCHING
var btnSwitch = document.querySelectorAll('.left-tag');
for (var _i6 = 0; _i6 < btnSwitch.length; _i6++) {
  btnSwitch[_i6].addEventListener('click', changeToAnother);
}
function changeToAnother(e) {
  if (e.currentTarget.classList.contains('trash')) {
    var deleteButtons = document.querySelectorAll('.email-delete');
    deleteButtons.forEach(function (value) {
      value.classList.add('hidden');
    });
    page = 1;
    mailWindow.classList.remove(mailWindow.classList[1]);
    mailWindow.classList.add('trash');
    tabs.style.display = 'none';
    var deletedData = getDeletedEmails();
    displayPageRange(deletedData);
    checkPaginationButtons(page, Math.ceil(deletedData.items.length / 20));
    listAllEmails(deletedData);
  } else if (e.currentTarget.classList.contains('inbox')) {
    var _deleteButtons = document.querySelectorAll('.email-delete');
    _deleteButtons.forEach(function (value) {
      value.classList.remove('hidden');
    });
    mailWindow.classList.remove(mailWindow.classList[1]);
    mailWindow.classList.add('inbox');
    tabs.style.display = 'flex';
    tabs.children[0].click();
  }

  for (var _i7 = 0; _i7 < btnSwitch.length; _i7++) {
    btnSwitch[_i7].classList.remove('switch');
  }
  var el = e.currentTarget;
  el.classList.add('switch');
  console.log(e.currentTarget);
}

//SIDEBAR CATEGORIES DROPDOWN
var categoriesButton = document.querySelector('.dropbtn');
categoriesButton.addEventListener('click', myFunction);

function myFunction() {
  document.getElementById('myDropdown').classList.toggle('show');
}

// // Close the dropdown if the user clicks outside of it
// window.onclick = function(event) {
//   if (!event.target.matches('.dropbtn')) {
//     var dropdowns = document.getElementsByClassName("dropdown-content");
//     var i;
//     for (i = 0; i < dropdowns.length; i++) {
//       var openDropdown = dropdowns[i];
//       if (openDropdown.classList.contains('show')) {
//         openDropdown.classList.remove('show');
//       }
//     }
//   }
// }

searchBar.addEventListener('change', closeSearchMenu);

function closeSearchMenu() {
  setTimeout(function () {
    drop.style.display = 'none';
  }, 140);
}

function getDeletedEmails() {
  var deletedEmailsArray = [];
  myData.items.forEach(function (value) {
    if (value.tags.isTrash) {
      deletedEmailsArray.push(value);
    }
  });
  var deletedEmailData = formInputObjectForRendering(deletedEmailsArray);
  return deletedEmailData;
}

function getUndeletedEmails() {
  currDisplayedData = detectWhichTab();
  var undeletedEmailsArray = [];
  currDisplayedData.items.forEach(function (value) {
    if (!value.tags.isTrash) {
      undeletedEmailsArray.push(value);
    }
  });
  var undeletedEmailData = formInputObjectForRendering(undeletedEmailsArray);
  return undeletedEmailData;
}

function updateCurrDisplayedData() {
  currDisplayedData.items.forEach(function (value, ind) {
    var indOfMyData = currDisplayedData.items[ind].id;
    currDisplayedData.items[ind].isRead = myData.items[indOfMyData].isRead;
    currDisplayedData.items[ind].tags.isTrash = myData.items[indOfMyData].tags.isTrash;
    currDisplayedData.items[ind].tags.isStar = myData.items[indOfMyData].tags.isStar;
    currDisplayedData.items[ind].tags.isSpam = myData.items[indOfMyData].tags.isStar;
  });
}

function displayPageRange(data) {
  var emailNum = data.items.length;
  var totalPages = Math.ceil(emailNum / 20);
  var total = data.items.length;
  var start = void 0;
  var end = void 0;
  if (emailNum === 0) {
    formPageRange(0, 0);
    return;
  } else if (totalPages === page && totalPages === 1) {
    start = 1;
    end = emailNum % 20;
  } else if (page < totalPages) {
    start = (page - 1) * 20 + 1;
    end = start + 19;
  } else if (page === totalPages) {
    start = (page - 1) * 20 + 1;
    end = start + emailNum % 20 - 1;
  }
  formPageRange(start, total, end);
}

function formPageRange(start, total) {
  var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  if (end) {
    pageRange.innerHTML = start + ' - ' + end + ' of ' + total;
  } else {
    pageRange.innerHTML = start + ' of ' + total;
  }
}

pageLeft.addEventListener('click', listToLeft);

function listToLeft() {
  var data = void 0;

  if (mailWindow.classList.contains('inbox')) {
    data = getUndeletedEmails();
  } else if (mailWindow.classList.contains('trash')) {
    data = getDeletedEmails();
  }

  var emailNum = data.items.length;
  var totalPages = Math.ceil(emailNum / 20);
  var start = void 0;
  var end = void 0;
  var dataToDisplayArray = void 0;
  var toDisplayData = void 0;

  if (page < 1) {
    return;
  } else if (page === 1) {
    start = 1;
    end = totalPages > 1 ? 20 : emailNum.num;
  } else {
    page--;
    start = (page - 1) * 20;
    end = start + 19;
  }
  checkPaginationButtons(page, totalPages);
  dataToDisplayArray = data.items.slice(start, end);
  toDisplayData = formInputObjectForRendering(dataToDisplayArray);
  displayPageRange(data);
  listAllEmails(toDisplayData);
}

//COMPOSE MESSAGE OPEN/CLOSE
var composeButton = document.querySelector('.compose');
var openButton = document.querySelector('.window');
var closeButton = document.querySelector('.close-icon');

composeButton.addEventListener('click', function () {
  openButton.classList.remove('window');
  openButton.classList.add('compose-window');
});

closeButton.addEventListener('click', function (e) {
  openButton.classList.remove('compose-window');
  openButton.classList.add('window');
});

pageRight.addEventListener('click', listToRight);

function listToRight() {
  var data = void 0;

  if (mailWindow.classList.contains('inbox')) {
    data = getUndeletedEmails();
  } else if (mailWindow.classList.contains('trash')) {
    data = getDeletedEmails();
  }

  var emailNum = data.items.length;
  var totalPages = Math.ceil(emailNum / 20);
  var start = (page - 1) * 20;
  var end = void 0;
  var dataToDisplayArray = void 0;
  var toDisplayData = void 0;

  if (page > totalPages) {
    return;
  } else if (page === totalPages) {
    end = start + emailNum % 20 - 1;
  } else {
    page++;
    start += 20;
    end = start + 19;
  }

  checkPaginationButtons(page, totalPages);
  dataToDisplayArray = data.items.slice(start, end);
  toDisplayData = formInputObjectForRendering(dataToDisplayArray);
  displayPageRange(data);
  listAllEmails(toDisplayData);
}

function formInputObjectForRendering(arr) {
  var obj = {
    items: arr,
    next: {
      page: social.items.length < 50 ? 1 : 2,
      limit: 50
    },
    total: arr.length
  };

  return obj;
}

function checkPaginationButtons(page, pageNum) {
  if (page === 1 && pageNum === 1) {
    pageLeft.setAttribute('active', false);
    pageRight.setAttribute('active', false);
  } else if (page <= 1) {
    pageLeft.setAttribute('active', false);
    pageRight.setAttribute('active', true);
  } else if (page >= pageNum) {
    pageLeft.setAttribute('active', true);
    pageRight.setAttribute('active', false);
  } else {
    pageLeft.setAttribute('active', true);
    pageRight.setAttribute('active', true);
  }
}