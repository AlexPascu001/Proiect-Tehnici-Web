window.addEventListener("load",  function () {
    document.getElementById("inp-pret").onclick = function () {
        document.getElementById("infoRange").innerHTML = "(" + this.value + ")";
    }
    iduriProduse = localStorage.getItem("cos_virtual");
    if (iduriProduse) {
        iduriProduse.split(",");
    }
    else {
        iduriProduse = [];
    }
    for (let id_p of iduriProduse) {
        var ch = document.querySelector(`[value='${id_p}'].select-cos`);
        if (ch) {
            ch.checked = true;
        }
    }
    document.getElementById("filtrare").onclick = function () {

        var valNume = document.getElementById("inp-nume").value.toLowerCase();

        var butoaneRadio = document.getElementsByName("gr_rad");
        let valMarime;
        for (let rad of butoaneRadio) {
            if (rad.checked) {
                valMarime = rad.value;
                break;
            }
        }
        if (valMarime != "toate") {
            var minMarime, maxMarime;
            [minMarime, maxMarime] = valMarime.split(":");
            minMarime = parseInt(minMarime);
            maxMarime = parseInt(maxMarime);
        }
        else {
            minMarime = 0;
            maxMarime = 10000000000;
        }

        var valPret = document.getElementById("inp-pret").value;

        var valCategorie = document.getElementById("inp-categorie").value;

        var articole = document.getElementsByClassName("produs");
        for (let art of articole) {
            art.style.display = "none";
            let numeArt = art.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let cond1 = (numeArt.startsWith(valNume));

            let MarimeArt = parseInt(art.getElementsByClassName("val-marime")[0].innerHTML);
            let cond2 = (minMarime <= MarimeArt && MarimeArt < maxMarime);
            let pretArt = parseInt(art.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3 = (valPret <= pretArt);

            let categorieArt=art.getElementsByClassName("val-categorie")[0].innerHTML
            let cond4 = (valCategorie=="toate") || (categorieArt == valCategorie);

            let conditieFinala = cond1 && cond2 && cond3 && cond4;
            if (conditieFinala) {
                art.style.display = "block";
            }
        }
    }

    function sorteaza(semn) {
        var articole = document.getElementsByClassName("produs");
        var v_articole = Array.from(articole);
        v_articole.sort(function (a, b) {
            var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a != pret_b)
                return semn * pret_a - pret_b;
            else {
                var nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
                var nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b);
            }
        });

        for (let art of v_articole) {
            art.parentElement.appendChild(art);
        }
    }

    document.getElementById("resetare").onclick = function () {
        var articole = document.getElementsByClassName("produs");
        for (let art of articole)
            art.style.display = "block";
        document.getElementById("inp-nume").value = "";
        document.getElementById("i_rad4").checked = true;
        document.getElementById("inp-pret").value = 0;
        document.getElementById("infoRange").innerHTML = "(0)";
        document.getElementById("sel-toate").selected = true;
    }

    document.getElementById("sortCrescNume").onclick = function () {
        sorteaza(1);
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        sorteaza(-1);
    }

    window.onkeydown = function (event) {
        if (event.key == 'c' && event.altKey) {
            var p_vechi = document.getElementById("suma");
            if (!p_vechi) {
                suma = 0;
                var articole = document.getElementsByClassName("produs");
                for (let art of articole) {
                    if (art.style.display != "none")
                        suma += parseFloat(art.getElementsByClassName("val-pret")[0].innerHTML);
                }
                var pgf = document.createElement("p");
                pgf.innerHTML = "<b>Suma: </b>" + suma;
                pgf.id = "suma";
                var sectiune = document.getElementById("produse");
                sectiune.parentNode.insertBefore(pgf, sectiune);
                setTimeout(function (){
                    var p_vechi = document.getElementById("suma");
                    if (p_vechi)
                        p_vechi.remove();
                }, 2000);
             }
        }
    }
    var checkboxuri = document.getElementsByClassName("select-cos");
    for (let ch of checkboxuri) {
        ch.onchange = function () {
            iduriProduse = localStorage.getItem("cos_virtual");
            if (iduriProduse) {
                iduriProduse = iduriProduse.split(",");
            }
            else {
                iduriProduse = [];
            }
            if (this.checked) {
                iduriProduse.push(this.value);
                localStorage.setItem("cos_virtual", iduriProduse.join(","));
            }
            else {
                let idx = iduriProduse.indexOf(this.value);
                if (idx != -1)
                    iduriProduse.splice(idx, 1);
                localStorage.setItem("cos_virtual", iduriProduse.join(","));
            }
        }
    }

})

