'use strict';

// iframe.contentWindow
if (
  window !== top &&
  location.href === 'about:blank'
) {
  try {
    top.document; // are we on the same frame?

    const script = document.createElement('script');

    script.textContent = `{
      const nav = top.navigator;

      navigator.__defineGetter__('userAgent', () => nav.userAgent);
      navigator.__defineGetter__('appVersion', () => nav.appVersion);
      navigator.__defineGetter__('platform', () => nav.platform);
      navigator.__defineGetter__('vendor', () => nav.vendor);

      document.documentElement.dataset.fgdvcre = true;
    }`;
    document.documentElement.appendChild(script);
    script.remove();
    // make sure the script is injected


    if (document.documentElement.dataset.fgdvcre !== 'true') {
      document.documentElement.dataset.fgdvcre = true;
      const script = document.createElement('script');
      Object.assign(script, {
        textContent: `
          [...document.querySelectorAll('iframe[sandbox]')]
            .filter(i => i.contentDocument.documentElement.dataset.fgdvcre === 'true')
            .forEach(i => {
              const nav = i.contentWindow.navigator;
              nav.__defineGetter__('userAgent', () => navigator.userAgent);
              nav.__defineGetter__('appVersion', () => navigator.appVersion);
              nav.__defineGetter__('platform', () => navigator.platform);
              nav.__defineGetter__('vendor', () => navigator.vendor);
            });
        `
      });
      top.document.documentElement.appendChild(script);
      script.remove();
    }


    delete document.documentElement.dataset.fgdvcre;
  }
  catch (e) {}
}
const script = document.createElement('script');

script.textContent = `var ext_user_agent = localStorage.getItem('ext_user_agent');

setTimeout(function(){
  if(typeof(ext_user_agent) != "undefined" && ext_user_agent !== null && ext_user_agent !== '') {
    if(window.navigator.userAgent != ext_user_agent){
      console.log('win:'+window.navigator.userAgent);
      console.log('ext:'+ext_user_agent);
    
      window.stop();
      alert('Error! Please, sing-in again or refresh page.');
    }
  }
},10);`;


document.documentElement.appendChild(script);
script.remove();