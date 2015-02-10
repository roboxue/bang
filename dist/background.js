var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.stage) {
            case "load":
                _gaq.push(['_trackPageview', '/v' + chrome.runtime.getManifest().version]);
                break;
            case "query":
                _gaq.push(['_trackEvent', 'CustomQuery', 'Execute']);
                break;
            case "dismiss":
                _gaq.push(['_trackEvent', 'Workspace', 'Dismiss']);
                break;
            case "activate":
                _gaq.push(['_trackEvent', 'Workspace', 'Activate']);
                break;
        }
    }
);