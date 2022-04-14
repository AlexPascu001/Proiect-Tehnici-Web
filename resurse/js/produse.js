window.addEventListener("load",  function () {
    document.getElementById("inp-pret").onclick = function () {
        document.getElementById("infoRange").innerHTML = "(" + this.value + ")";
    }

    document.getElementById("filtrare").onclick = function () {

        var valNume = document.getElementById("inp-nume").value.toLowerCase();

        var butoaneRadio = document.getElementsByName("gr_rad");
        for (let rad of butoaneRadio) {
            if (rad.checked) {
                var varCalorii = rad.value;
                break;
            }
        }
        if (valCalorii != "toate") {
            var minCalorii, maxCalorii;
            [minCalorii, maxCalorii] = valCalorii.split(":");
            minCalorii = parseInt(minCalorii);
            maxCalorii = parseInt(maxCalorii);
        }
        else {
            minCalorii = 0;
            maxCalorii = 10000000000;
        }

        var valPret = document.getElementById("inp-pret").value;

        // var valCategorie =

        var articole = document.getElementsByClassName("produs");
        for (let art of articole) {
            art.style.display = "none";
            let numeArt = art.getElementsByClassName("val-name")[0].innerHTML.toLowerCase();
            let cond1 = (numeArt.startsWith(valNume));

            let caloriiArt = parseInt(art.getElementsByClassName("val-calorii")[0].innerHTML);
            let cond2 = (minCalorii <= caloriiArt && caloriiArt < maxCalorii);

            let pretArt = parseInt(art.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3 = (valPret <= pretArt);

            let conditieFinala = cond1 && cond2 && cond3;
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
        console.log(event);
        if (event.key == 'c' && e.altKey) {
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
})