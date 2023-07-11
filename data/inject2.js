
var ext_type = localStorage.getItem('ext_type');

function getStorage(){
    var storage = [];
    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        storage[localStorage.key( i )] = localStorage.getItem( localStorage.key( i ) );
    }

    chrome.runtime.sendMessage({
        method: 'save-session-storage',
        storage: Object.assign({}, storage)
    });
}


var check_auth = setInterval(function () {
    if (document.querySelector('.l-header__menu__item__icon') !== null) {
        clearInterval(check_auth);
        if(typeof(localStorage.getItem('ext_session_id')) !== "undefined" && localStorage.getItem('ext_session_id') !== null && localStorage.getItem('ext_session_id') !== '') {
            getStorage();
            chrome.runtime.sendMessage({method: 'save-session'});
        }


    }
}, 500);

function cleanPage(){
    if(typeof(document.querySelector('[at-attr="logout"]') !== "undefined") && (document.querySelector('[at-attr="logout"]') !== null)){
        document.querySelector('[at-attr="logout"]').remove();
    }
    if(typeof(document.querySelector('[data-name="Banking"]') !== "undefined") && (document.querySelector('[data-name="Banking"]') !== null)){
        document.querySelector('[data-name="Banking"]').remove();
    }
    if(typeof(document.querySelector('[href="/my/settings/account/sessions"]') !== "undefined") && (document.querySelector('[href="/my/settings/account/sessions"]') !== null)){
        document.querySelector('[href="/my/settings/account/sessions"]').remove();
    }
    if(typeof(document.querySelector('[href="/my/settings/account"]') !== "undefined") && (document.querySelector('[href="/my/settings/account"]') !== null)){
        document.querySelector('[href="/my/settings/account"]').remove();
    }
}
function cleanHref(href){
    console.log(href);

    switch(href){
        case 'https://onlyfans.com/my/settings/account/sessions':
        document.location.href = '/';
    }
}

if(ext_type !== "admin") {
    var oldHref = document.location.href;
    cleanHref(oldHref);

    window.onload = function() {
        var bodyList = document.querySelector("body")

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                cleanPage();

                if (oldHref !== document.location.href) {
                    oldHref = document.location.href;

                    cleanHref(document.location.href);
                }
            });
        });

        var config = {
            childList: true,
            subtree: true
        };

        observer.observe(bodyList, config);
    };
}


/*;
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function cloneAttributes(element, sourceNode) {
    let attr;
    let attributes = Array.prototype.slice.call(sourceNode.attributes);
    while(attr = attributes.pop()) {
        element.setAttribute(attr.nodeName, attr.nodeValue);
    }
}*/