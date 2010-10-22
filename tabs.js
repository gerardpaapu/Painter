(function (){
    // Show and hide the controls
    var wrapper = $('#ControlsWrapper'),
        controls = $('#Controls'),
        showHide = $('#ControlsShowHide'),
        controlsVisible = true,
        tabLinks = $.all("ul.tabs > li > a"),
        activeTab = $(".tab.active"),
        activePage = $(".section.active");

    function toggleControls(event){
        event.preventDefault();
        if (controlsVisible){
            hideControls();
        } else {
            showControls();
        }
    }

    function showControls(){
        wrapper.style.top = '10%';
        controlsVisible = true;
    }

    function hideControls(){
        var height = controls.clientHeight;
        wrapper.style.top = height + '100%';
        controlsVisible = false;
    }

    function resizeControls(){
        if (controlsVisible){
            showControls();
        } else {
            hideControls();
        }
    }

    function updateTabs(){
        var hash = window.location.hash;
        setActiveTab(hash.length && hash);
    }

    function setActiveTab(id){
        var len = tabLinks.length, i;
        if (activeTab && activePage){
            $.removeClass(activeTab, "active");
            $.removeClass(activePage, "active");
        }

        if (id){
            activeTab = null;
            for (i = 0; i < len; i++){
                if (tabLinks[i].getAttribute('href') === id){
                    activeTab = tabLinks[i].parentNode;
                    activePage = $(id);  
                }
            } 

            if (activeTab && activePage) {
                $.addClass(activeTab, "active");
                $.addClass(activePage, "active");
                showControls();
            } else {
                hideControls();
            }
        } else {
            hideControls();
        }
    }

    window.addEventListener('orientationchange', resizeControls);
    tabLinks.forEach(function (node){
        node.addEventListener('click', function (event){
            setActiveTab(this.getAttribute('href'));       
        }); 
    });

    updateTabs();
}());
