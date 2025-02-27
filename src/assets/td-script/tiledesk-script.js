

//console.log('Custom script - current url ', window.location.href)
//console.log('Custom script - window.location.href.indexOf(/projects-for-panel) ', window.location.href.indexOf('/projects-for-panel'))
//console.log('Custom script - window.location.href.indexOf(/request-for-panel) ', window.location.href.indexOf('/request-for-panel'))
//console.log('Custom script - window.location.href.indexOf(/unserved-request-for-panel) ', window.location.href.indexOf('/unserved-request-for-panel'))
// "63b711fa2ef2e4001a5e4977"
const projectId =  "66f435a5c7dd6800134b36ed";
let attributes = {};

if (
    (window.location.href.indexOf('/cds') >= 0) ||
    (window.location.href.indexOf('%2Fcds') >= 0) ||
    (window.location.href.indexOf('/dashboard') >= 0) ||
    (window.location.href.indexOf('%2Fdashboard') >= 0)
) {

    // 

} else if (
    ((window.location.href.indexOf('/login') >= 0) ||
        (window.location.href.indexOf('%2Flogin') >= 0) ||
        (window.location.href.indexOf('/signup') >= 0) ||
        (window.location.href.indexOf('%signup') >= 0)
    ) && screen.width < 800
) {

} else {
    // startWidget()
}



function startWidget() {

    window.tiledeskSettings =
    {
        projectid: projectId,
        autoStart: true

    };

    (function (d, s, id) {
        var w = window; var d = document; var i = function () { i.c(arguments); };
        i.q = []; i.c = function (args) { i.q.push(args); }; w.Tiledesk = i;
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id; js.async = true; js.src = "https://widget.tiledesk.com/v6/launch.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'tiledesk-jssdk'));

    window.addEventListener('load', (event) => {
        document.dispatchEvent(new Event('mousemove'))
    })

    window.Tiledesk('onAuthStateChanged', function (event_data) {
        //console.log("onAuthStateChanged FIRED ", event_data);
        if (event_data.detail.isLogged) {
            window.Tiledesk('show')
            if (attributes) {
                window.Tiledesk('setAttributeParameter', attributes)
            }
        }
    });


    window.Tiledesk('onLoadParams', (event_data) => {
        // console.log("Initialized!");
    });

    window.Tiledesk('onBeforeInit', (event_data) => {
        // console.log("trigger onBeforeInit!");
    });
}


// window.tiledesk.angularcomponent.component.g.preChatForm = false
function tiledesk_widget_hide() {
    if (!window.Tiledesk) {
        return
    }
    // console.log('[APP-COMP] - HIDE WIDGET in custom script')
    window.Tiledesk('hide');
}

function tiledesk_widget_show() {
    if (!window.Tiledesk) {
        return
    }
    window.Tiledesk('show');
}

function tiledesk_widget_autologin() {
    if (!window.Tiledesk) {
        return
    }
    // console.log('loginnnnnnnnnnnnn', window, window.tiledesk)
    if (window && window.tiledesk) {
        // window.Tiledesk('logout');
        // console.log('loginnnnnnnnnnnnn 111111', window, window.tiledesk)
        setTimeout(() => {
            // console.log('loginnnnnnnnnnnnn')
            tiledesk_widget_login();
        }, 1000);
    }
}

function tiledesk_widget_logout() {
    if (!window.Tiledesk) {
        return
    }
    // console.log('LOGGGGGG OUTTTTTTTTTTTT', window.Tiledesk)
    window.Tiledesk('logout')
    window.Tiledesk('signInAnonymous')
    // if (window && window.tiledesk) {

    //   console.log('tiledeskSettings LOGOUT ')
    // } else {
    //   console.log('tiledeskSettings NO LOGOUT ')
    // }
    // window.tiledesk.signInAnonymous()
    //.then(response =>  console.log('signinnnnn', response)).catch(e => console.log('errorrrrrr', e))
}

function setParameter(obj) {
    if (!window.Tiledesk) {
        return
    }
    window.Tiledesk('setParameter', {key: 'departmentID', value:'67bf048b09810000138d9490'})
}



function tiledesk_widget_login(attribute) {
    console.log('tiledesk_widget_login')
    if (!window.Tiledesk) {
        return
    }

    const currentUser = localStorage.getItem('widget_sv6_' + projectId + '_currentUser')
    if (currentUser && currentUser !== undefined) {
        const user = JSON.parse(currentUser)
        if (!user.fullname.includes('guest')) {
            return;
        }
    }

    window.Tiledesk('setParameter', { key: 'autoStart', value: false })
    window.Tiledesk('setParameter', { key: 'preChatForm', value: false })
    // if (window && window.tiledesk && window.tiledesk.angularcomponent) {
    // window.tiledesk.angularcomponent.component.g.autoStart = false;
    // }
    // console.log('tiledeskSettings autoStart ', window.tiledesk.angularcomponent.component.g.autoStart)

    // console.log('wwwwwwwwwww', window.Tiledesk('logout'), window.Tiledesk, window.tiledesk)
    var logout = window.Tiledesk('logout')//.then(response => console.log('logoutttt responseeeee', response)).catch(e=> console.log('logoutttt errorrrrrr', error));
    // window.tiledesk.hide()
    // window.tiledesk.logout();
    // window.tiledesk.reinit();
    // console.log('tiledeskSettings 1', window.tiledeskSettings)

    if (attribute) attributes = attribute;

    // setTimeout(() => {
    customAuth((token) => {
        // console.log("customAuth token ", token);
        if (token) {
            // console.log("customAuth HERE Y ", token);
            // window.tiledesk.signInWithCustomToken(token);
            // console.log('customAuth windowww', window.Tiledesk)
            window.Tiledesk('signInWithCustomToken', token)//.then(response => console.log('signInWithCustomToken responseeeee', response)).catch(e=> console.log('signInWithCustomToken errorrrrrr', error));;
        }
        else {
            // console.log("No user found.");
        }
    });
    // }, 1000);
}



function customAuth(callback) {
    // console.log('Calling customAuth ')
    // console.log('tiledeskSettings 2 (customAuth)', window.tiledeskSettings)
    const storedUser = localStorage.getItem('user');
    // console.log('tiledeskSettings 2 (customAuth) - storedUser', storedUser)
    let user = null;
    if (storedUser) {
        user = JSON.parse(storedUser);
    }
    if (!user) {
        callback(null);
        return;
    }
    const td_userId = user._id;
    // console.log('tiledeskSettings 2 (customAuth) - td_userId', td_userId)
    // const URL = 'https://tiledesk-custom-jwt-authentication.gabrielepanico.repl.co/tiledeskauth';
    const URL = 'https://tiledesk-custom-jwt-authentication.replit.app/tiledeskauth';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", URL, true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function () {
        if (callback && xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText) {
            // console.log('tiledeskSettings 2 (customAuth) - xmlhttp.readyState', xmlhttp.readyState)
            // console.log('tiledeskSettings 2 (customAuth) - xmlhttp.status', xmlhttp.status)
            callback(xmlhttp.responseText);
        }
    };
    const remote_support_project_userId = projectId + "_" + td_userId;
    const td_firstname = user.firstname;
    const td_lastname = user.lastname;
    const td_email = user.email;

    xmlhttp.send("id=" + remote_support_project_userId + "&firstname=" + td_firstname + "&lastname=" + td_lastname + "&email=" + td_email);
}