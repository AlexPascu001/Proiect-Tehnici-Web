function setCookie(nume, val, timpExp, path="/") {
    // timpExp timp in ms in care va expira cookie-ul
    d = new Date();
    d.setTime(d.getTime() + timpExp);
    console.log("Va expira: ", d.toUTCString());
    document.cookie = `${nume} = ${val}; expires = ${d.toUTCString()}; path = ${path}`;
}

function getCookie(nume) {
    var vectCookie = document.cookie.split(";");
    for (let c of vectCookie) {
        c = c.trim();
        if (c.startsWith(nume + "=")) {
            return c.substring(nume.length + 1);
        }
    }
}

function deleteCookie(nume) {
    setCookie(nume, "", 0);
}

function deleteAllCookies() {
    var vectCookie = document.cookie.split(";");
    for (let c of vectCookie) {
        c = c.trim();
        var nume = c.split("=")[0];
        deleteCookie(nume);
    }
}


function checkBanner() {
    if (getCookie("acceptat_banner")) {
        document.getElementById("banner").style.display = "none";
    }
    else {
        document.getElementById("banner").style.display = "block";
        document.getElementById("ok_cookies").onclick = function () {
            document.getElementById("banner").style.display = "none";
            setCookie("acceptat_banner", "true", 5 * 1000);
        }
    }
}


window.addEventListener("DOMContentLoaded", function () {
    checkBanner();
})