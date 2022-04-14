const express = require("express");
const fs = require("fs");
const sharp = require("sharp");
const {Client} = require("pg");
const ejs = require("ejs");
const sass = require("sass");
const formidable = require("formidable");
const crypto = require("crypto");
const session= require("express-session");


var client = new Client({database:"bd_sneakerscape", user:"alex", password:"alex", host:"localhost", port:5432});
client.connect();


const obGlobal = {obImagini:null, obErori:null};

app = express();

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"))

app.use("/*", function (req, res, next) {
   res.locals.propGenerala = "Ceva care se afiseaza pe toate paginile";
   next();
});

console.log("Director proiect:", __dirname);

app.get(["/", "/index", "/home"], function (req, res){
    client.query("select * from test", function (err, rezQuery) {
        console.log(rezQuery);
        res.render("pagini/index", {ip: req.ip, imagini:obImagini.imagini, produse:rezQuery.rows})
    })
})


app.get("/eroare", function(req, res){
    randeazaEroare(res,1, "Titlu schimbat");
});

app.get("/despre", function(req, res) {
    res.render("pagini/despre");
})

app.get("/pagina2*", function (req, res) {
    res.render("pagini/pagina2");
})

app.get("/pagina_temp*", function (req, res) {
    res.render("pagini/pagina_temp");
})

app.get("*/galerie-animata.css", function (req, res) {
    var buf=fs.readFileSync(__dirname+"/resurse/scss/galerie-animata.scss").toString("utf8");
    var culori=["navy", "black", "purple", "green"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator];
    rezScss=ejs.render(sirScss, {culoare:culoareAleatoare});
    var caleScss=__dirname+"/temp/galerie_animata.scss"
    fs.writeFileSync(caleScss, rezScss);
    try {
        rezCompilare = sass.compile(caleScss, {sourceMap: true});
        var caleCss = __dirname + "/temp/galerie_animata.css";
        fs.writeFileSync(caleCss, rezCompilare.css);
        res.setHeader("Content-Type", "text-css");
        res.sendFile(caleCss);
    }
    catch (err) {
        console.log(err);
        res.send("Eroare");
    }
})

parolaServer = "tehniciweb";
app.post("/inreg", function (req, res) {
    var formular = new formidable.IncomingForm();
    formular.parse(req, function (err, campuriText, campuriFisier){
        var parolaCriptata = crypto.scryptSync(campuriText.parola, parolaServer, 64).toString("hex");
        var comandaInserare = `insert into utilizatori (username, nume, prenume, parola, email, culoare_chat) values ('${campuriText.username}', '${campuriText.nume}', '${campuriText.prenume}', '${parolaCriptata}', '${campuriText.email}', '${campuriText.culoare_chat}')`
    })
})

app.get("/produse", function (req, res) {
    client.query("select * from unnest(enum_range(null::categ_prajitura))", function(err, rezCateg){
        console.log(rezCateg);

        client.query("select * from cars", function (err, rezQuery) {
            res.render("pagini/produse", {produse: rezQuery})
        })
    })
});


app.get("/*.ejs", function (req, res) {
    //res.status(403).render("pagini/403");
    randeazaEroare(res, 403);
})

app.get("/*", function (req, res) {
    res.render("pagini" + req.url, function (err, rezRender){
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                console.log(err);
                //res.status(404).render("pagini/404");
                randeazaEroare(res, 404);
            }
        }
        else {
            res.render("pagini/eroare_generala");
        }
    });
    console.log("generala:", req.url);
    res.end();
})

function creeazaImagini(){

    var buf=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf8");

    obImagini=JSON.parse(buf);//global

    //console.log(obImagini);
    for (let imag of obImagini.imagini){
        let nume_imag, extensie;
        [nume_imag, extensie]=imag.cale_imagine.split(".")// "abc.de".split(".") ---> ["abc","de"]
        let dim_mic=150

        imag.mic=`${obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp` //nume-150.webp // "a10" b=10 "a"+b `a${b}`


        imag.mare=`${obImagini.cale_galerie}/${imag.cale_imagine}`;
        if (!fs.existsSync(imag.mic))
            sharp(__dirname+"/"+imag.mare).resize(dim_mic).toFile(__dirname+"/"+imag.mic);


        let dim_mediu=300
        imag.mediu=`${obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.png`
        if (!fs.existsSync(imag.mediu))
            sharp(__dirname+"/"+imag.mare).resize(dim_mediu).toFile(__dirname+"/"+imag.mediu);
    }

}
creeazaImagini();

function creeazaErori() {
    var buf=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf8");
    obErori=JSON.parse(buf);//global
}

creeazaErori();

function randeazaEroare(res, identificator, titlu, text, imagine) {
    console.log(obErori);
    var eroare = obErori.erori.find(function (elem) {return elem.identificator == identificator});
    titlu = titlu || (eroare && eroare.titlu) || "Titlu eroare custom";
    text = text || (eroare && eroare.text) || "Titlu eroare custom";
    imagine = imagine || (eroare && (obErori.cale_baza+"/"+eroare.imagine)) || "Titlu eroare custom";
    if (eroare && eroare.status)
        res.status(eroare.identificator);
    res.render("pagini/eroare_generala", {titlu:titlu, text:text, imagine:imagine});

}


var s_port = process.env.PORT || 8080;

app.listen(s_port);
// app.listen(8080);
console.log("A pornit!");