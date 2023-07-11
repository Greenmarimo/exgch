'use strict';


const DCSI = 'firefox-default';

document.body.dataset.android = navigator.userAgent.indexOf('Android') !== -1;

let tab = {};
let tab_content;
let tab_cookies = [];
let tab_storage;
let real_ua = window.navigator.userAgent;
let fake_ua = '';
let extension_version = 1.2;

chrome.tabs.query({
  active: true,
  currentWindow: true
}, tbs => {
  if (tbs.length) {
    tab = tbs[0];
    if ('cookieStoreId' in tab) {
      const apply = document.querySelector('[data-cmd="apply"]');
      apply.value = chrome.i18n.getMessage('applyContainer');
      apply.title = chrome.i18n.getMessage('applyContainerTitle');

      const w = document.querySelector('[data-cmd="window"]');
      w.value = chrome.i18n.getMessage('applyContainerWindow');
      w.title = chrome.i18n.getMessage('applyContainerWindowTitle');

      const reset = document.querySelector('[data-cmd="reset"]');
      reset.value = chrome.i18n.getMessage('resetContainer');
      reset.title = chrome.i18n.getMessage('resetContainerTitle');
    }
  }
});

const map = {};

function update(ua) {
  const browser = document.getElementById('browser').value;
  const os = document.getElementById('os').value;

  const t = document.querySelector('template');
  const parent = document.getElementById('list');
  const tbody = parent.querySelector('tbody');
  tbody.textContent = '';

  parent.dataset.loading = true;
  get('browsers/' + browser.toLowerCase() + '-' + os.toLowerCase().replace(/\//g, '-') + '.json')
      .then(r => r.json()).catch(e => {
    console.error(e);
    return [];
  }).then(list => {
    if (list) {
      const fragment = document.createDocumentFragment();
      let radio;
      list = sort(list);
      list.forEach((o, n) => {
        const clone = document.importNode(t.content, true);
        const num = clone.querySelector('td:nth-child(1)');
        num.textContent = n + 1;
        const second = clone.querySelector('td:nth-child(3)');
        if (o.browser.name && o.browser.version) {
          second.title = second.textContent = o.browser.name + ' ' + (o.browser.version || ' ');
        }
        else {
          second.title = second.textContent = '-';
        }
        const third = clone.querySelector('td:nth-child(4)');
        if (o.os.name && o.os.version) {
          third.title = third.textContent = o.os.name + ' ' + (o.os.version || ' ');
        }
        else {
          third.title = third.textContent = '-';
        }
        const forth = clone.querySelector('td:nth-child(5)');
        forth.title = forth.textContent = o.ua;
        if (o.ua === ua) {
          radio = clone.querySelector('input[type=radio]');
        }
        fragment.appendChild(clone);
      });
      tbody.appendChild(fragment);
      if (radio) {
        radio.checked = true;
        radio.scrollIntoView({
          block: 'center',
          inline: 'nearest'
        });
      }
      document.getElementById('custom').placeholder = chrome.i18n.getMessage('filterAmong', [list.length]);
      [...document.getElementById('os').querySelectorAll('option')].forEach(option => {
        option.disabled = (map.matching[browser.toLowerCase()] || []).indexOf(option.value.toLowerCase()) === -1;
      });
    }
    else {
      throw Error('OS is not found');
    }
    // FF 55.0 does not support finally
  }).catch(() => {}).then(() => {
    parent.dataset.loading = false;
  });
}

document.getElementById("btn-sign").onclick = function(){
  doCodeAuth();
}
document.getElementById("btn-save").onclick = function(){
  doSaveData();
}
document.getElementById("btn-exit").onclick = function(){
  doSignOut();
}

function setUserAgent(user_agent){
  if ('cookieStoreId' in tab && tab.cookieStoreId !== DCSI) {
    chrome.runtime.sendMessage({
      method: 'request-update',
      user_agent,
      cookieStoreId: tab.cookieStoreId
    });

    chrome.storage.local.get({
      'container-uas': {}
    }, prefs => {
      prefs['container-uas'][tab.cookieStoreId] = user_agent;
      chrome.storage.local.set(prefs);
    });
  } else {
    chrome.storage.local.set({
      ua: user_agent
    });
  }

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, ([tab]) => chrome.tabs.reload(tab.id, {
    bypassCache: true
  }));
}

function resetUserAgent(){
  if ('cookieStoreId' in tab && tab.cookieStoreId !== DCSI) {
    chrome.runtime.sendMessage({
      method: 'request-update',
      value: '',
      cookieStoreId: tab.cookieStoreId,
      delete: true
    });
    chrome.storage.local.get({
      'container-uas': {}
    }, prefs => {
      delete prefs['container-uas'][tab.cookieStoreId];
      chrome.storage.local.set(prefs);
    });
  }
  else {
    chrome.storage.local.set({
      ua: ''
    });
  }
}


chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action === "getSource") {
    tab_content = request.source;
  }
});
chrome.runtime.onMessage.addListener((request, sender, response) => {
if (request.method === 'save-storage') {
    tab_storage = request.storage;
  }
});

function onWindowLoad() {
  chrome.tabs.executeScript(null, {
    file: "get_page_source.js"
  }, function() {});

  chrome.tabs.executeScript(null, {
    file: "get_page_storage.js"
  }, function() {});

  chrome.cookies.getAll({domain: "onlyfans.com"}, function(cookies) {
    cookies.forEach(function(cookie) {
      tab_cookies[cookie.name] = cookie.value;
    });
  });


}

window.onload = onWindowLoad;

document.addEventListener('DOMContentLoaded', () => fetch('./map.json').then(r => r.json()).then(o => {
  Object.assign(map, o);

  chrome.storage.local.get({
    'popup-browser': 'Chrome',
    'popup-os': 'Windows',
    'popup-sort': 'descending'
  }, prefs => {

    chrome.runtime.sendMessage({
      method: 'get-ua'
    }, ua => {
      fake_ua = ua;
    });
  });
}));