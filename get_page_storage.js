var storage = [];

for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    storage[localStorage.key( i )] = localStorage.getItem( localStorage.key( i ) );
}

chrome.runtime.sendMessage({
    method: 'save-storage',
    storage: Object.assign({}, storage)
});