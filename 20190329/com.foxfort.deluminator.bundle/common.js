var currentMode = 'CURRENT_DELUMINATOR_MODE';
var blacklistedUrls = BLACKLISTED_URLS;

function isURLBlacklisted(url) {
    return blacklistedUrls.filter(bUrl => url.toLowerCase().indexOf(bUrl.toLowerCase()) != -1).length > 0;
}

function forceWhiteBackground() {
    setTimeout(() => {
        //use a timeout, because the html background style may not have been loaded yet!
        if (window.getComputedStyle(document.documentElement).backgroundColor == 'rgba(0, 0, 0, 0)' &&
            document.documentElement.id != 'deluminator-reader' && !document.documentElement.classList.contains('discover-context')) {
            document.documentElement.style.backgroundColor = 'white';
        }
    }, 500);
}

function getHost(url) {
    var fullUrl = url || window.location.href;
    var ampDelimeter = "/amp/s/";
    if (fullUrl.indexOf('google') != -1 && fullUrl.indexOf(ampDelimeter) != -1) {
        //AMP url..extract the original url
        //https://www.google.mu/amp/s/www.lexpress.mu/amp/338046 => www.google.mu/amp/s/www.lexpress.mu
        var index = fullUrl.indexOf(ampDelimeter) + ampDelimeter.length;
        var realHostUrl = fullUrl.substr(index);
        var realHost = new URL("https://" + realHostUrl).hostname;
        var googleHostUrl = fullUrl.substr(0, index);
        return (googleHostUrl + realHost).replace("https://", "");
    }
    return window.location.hostname;
}

if (window == window.top) {
    console.log("getHost: " + getHost() + " isURLBlacklisted:" + isURLBlacklisted(getHost()));
    var isBlacklisted = isURLBlacklisted(getHost());
    if (isBlacklisted) {
        forceWhiteBackground();
        return;
    }

} else {
    //check if parent is blacklisted for iframe
    var parentUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
    if (parentUrl) {
        
        // console.log("parentUrl: ", parentUrl,parentUrl.indexOf("amp-disqus.php"));
        // if (parentUrl.indexOf("amp-disqus.php") != -1){
        //     console.log("amp-disqus : ", window.parent.location.href);
        // }

        if (document.documentElement.hasAttribute('i-amphtml-layout'))
            parentUrl = window.location.href;
        
        if (parentUrl.indexOf("www.google.") != -1 && parentUrl.indexOf("/amp/s/") != -1 && parentUrl.indexOf("&viewerUrl=") != -1) {
            var viewerUrl = parentUrl.substr(parentUrl.indexOf("&viewerUrl=") + "&viewerUrl=".length);
            var realAMPUrl = viewerUrl.split("&")[0];
            parentUrl = getHost(realAMPUrl);

        }
        var isBlacklisted = isURLBlacklisted(parentUrl);
        if (isBlacklisted) {
            forceWhiteBackground();
            return;
        }

        function didReceiveMessageForDeluminator(e) {
            if (e.data=='disableTemporarily' && window.deluminator)
                window.deluminator.disableTemporarily();
        }
        window.addEventListener('message', didReceiveMessageForDeluminator);
    }

}