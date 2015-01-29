var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.stage == "load")
            _gaq.push(['_trackPageview', '/v0.1.5']);
        else if (request.stage == "query")
            _gaq.push(['_trackEvent', 'CustomQuery', 'Execute'])
    }
);

var secret = 1;