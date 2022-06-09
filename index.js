const express= require("express");
const fs=require("fs");
const sharp=require("sharp");
const {Client}=require("pg");
const ejs= require("ejs");
const sass=require("sass");
const formidable= require('formidable');
const crypto= require('crypto');
const session= require('express-session');
const nodemailer=require('nodemailer');
const path=require("path");

const request=require('request');

const xmljs = require('xml-js');

const html_to_pdf = require('html-pdf-node');

const juice=require('juice');
const QRCode = require('qrcode');


const helmet=require('helmet');

const obGlobal={
    obImagini:null,
    obErori:null,
    emailServer:"test.tweb.node@gmail.com",
    port:8080,
    sirAlphaNum:"",
    protocol:null,
    numeDomeniu:null
};


v_intervale=[[48,57],[65,90],[97,122]]
for(let interval of v_intervale){
    for(let i=interval[0]; i<=interval[1]; i++)
        obGlobal.sirAlphaNum+=String.fromCharCode(i)
}

console.log(obGlobal.sirAlphaNum);

function genereazaToken(n){
    let token=""
    for (let i=0;i<n; i++){
        token+=obGlobal.sirAlphaNum[Math.floor(Math.random()*obGlobal.sirAlphaNum.length)]
    }
    return token;
}



function getIp(req){//pentru Heroku
    var ip = req.headers["x-forwarded-for"];//ip-ul userului pentru care este forwardat mesajul
    if (ip){
        let vect=ip.split(",");
        return vect[vect.length-1];
    }
    else if (req.ip){
        return req.ip;
    }
    else{
        return req.connection.remoteAddress;
    }
}

async function trimiteMail(email, subiect, mesajText, mesajHtml, atasamente=[]){
    var transp= nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth:{//date login
            user:obGlobal.emailServer,
            pass:"rwgmgkldxnarxrgu"
        },
        tls:{
            rejectUnauthorized:false
        }
    });
    //genereaza html
    await transp.sendMail({
        from:obGlobal.emailServer,
        to:email,
        subject:subiect,//"Te-ai inregistrat cu succes",
        text:mesajText, //"Username-ul tau este "+username
        html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
        attachments: atasamente
    })
    console.log("trimis mail");
}

if (process.env.SITE_ONLINE) {
    obGlobal.protocol="https://"
    obGlobal.numeDomeniu="nameless-plains-28853.herokuapp.com"
    var client = new Client({database:"d1vs6t7g7gj8qg", user:"epassxlkuyepqn",
        password:"44aac68327c1cdfe2df3af3c8404dcd3a741cffe78ff62a578f1fc0b1ca2e547",
        host:"ec2-34-197-84-74.compute-1.amazonaws.com", port:5432,
        ssl: {
            rejectUnauthorized: false
        }
    });
}
else {
    obGlobal.protocol="http://"
    obGlobal.numeDomeniu="localhost:8080"
    var client = new Client({database:"bd_sneakerscape", user:"alex", password:"alex", host:"localhost", port:5432});
}
client.connect();


foldere=["temp", "poze_uploadate"];
for (let folder of foldere){
    let calefolder=path.join(__dirname,folder);
    if (!fs.existsSync(calefolder))
        fs.mkdirSync(calefolder);
}



app= express();
app.use(helmet.frameguard());//pentru a nu se deschide paginile site-ului in frame-uri
app.use(["/produse_cos","/cumpara"],express.json({limit:'2mb'}));//obligatoriu de setat pt request body de tip json
app.use(["/contact"], express.urlencoded({extended:true}));

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));


app.set("view engine","ejs");

app.get("/ceva", function(req, res, next){
    res.write("<p style='color:pink'>Salut-1</p>");
    console.log(req.session);
    res.write(req.session.utilizator.username);
    console.log("1");

    res.end();
})


app.use("/resurse", express.static(__dirname+"/resurse"))
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"));

app.use("/*", function(req, res, next){
    res.locals.propGenerala="Ceva care se afiseaza pe toate pag";
    res.locals.utilizator=req.session.utilizator;
    res.locals.mesajLogin=req.session.mesajLogin;
    req.session.mesajLogin=null;
    next();
}, function(req, res, next){
    console.log("Functie 2")
    next();
});

function UltimeleImagini(){

    var textFisier=fs.readFileSync("resurse/json/galerie.json")
    var jsi=JSON.parse(textFisier);

    var caleGalerie=jsi.cale_galerie;
    console.log(caleGalerie);
    let galeria_animata=[]

    for(let i=jsi.imagini.length-1; i>=0 && galeria_animata.length<14; --i)
    {
        var img = path.join(caleGalerie, jsi.imagini[i].cale_imagine);
        galeria_animata.push({cale_imagine:img, titlu:jsi.imagini[i].titlu, descriere:jsi.imagini[i].descriere})

    }

    return galeria_animata;
}


function getIp(req){//pentru Heroku
    var ip = req.headers["x-forwarded-for"];//ip-ul userului pentru care este forwardat mesajul
    if (ip){
        let vect=ip.split(",");
        return vect[vect.length-1];
    }
    else if (req.ip){
        return req.ip;
    }
    else{
        return req.connection.remoteAddress;
    }
}


app.get("/*", function(req, res, next){
    let id_utiliz=req.session.utilizator? req.session.utilizator.id: null;
    let queryInsert=`insert into accesari(ip, user_id, pagina) values('${getIp(req)}', ${id_utiliz}, '${req.url}' )`;
    client.query(queryInsert, function(err, rezQuery){
        console.log(err);
    });
    next();
});


//obiect cu ipurile active
//ip-uri active= cele care au facut o cerere de curand
//cheia e de forma ip|url iar valoarea e un obiect de forma {nr:numar_accesari, data:data_ultimei accesari}

var ipuri_active={};


app.all("/*",function(req,res,next){
    let ipReq=getIp(req);
    let ip_gasit=ipuri_active[ipReq+"|"+req.url];
    timp_curent=new Date();
    if(ip_gasit){

        if( (timp_curent-ip_gasit.data)< 5*1000) {//diferenta e in milisecunde; verific daca ultima accesare a fost pana in 10 secunde
            if (ip_gasit.nr>10){//mai mult de 10 cereri
                res.send("<h1>Prea multe cereri intr-un interval scurt. Ia te rog sa fii cuminte, da?!</h1>");
                ip_gasit.data=timp_curent
                return;
            }
            else{

                ip_gasit.data=timp_curent;
                ip_gasit.nr++;
            }
        }
        else{
            //console.log("Resetez: ", req.ip+"|"+req.url, timp_curent-ip_gasit.data)
            ip_gasit.data=timp_curent;
            ip_gasit.nr=1;//a trecut suficient timp de la ultima cerere; resetez
        }
    }
    else{
        ipuri_active[ipReq+"|"+req.url]={nr:1, data:timp_curent};
        //console.log("am adaugat ", req.ip+"|"+req.url);
        //console.log(ipuri_active);

    }
    let comanda_param= `insert into accesari(ip, user_id, pagina) values ($1::text, $2,  $3::text)`;
    //console.log(comanda);
    if (ipReq){
        var id_utiliz=req.session.utilizator?req.session.utilizator.id:null;
        //console.log("id_utiliz", id_utiliz);
        client.query(comanda_param, [ipReq, id_utiliz, req.url], function(err, rez){
            if(err) console.log(err);
        });
    }
    next();
});




function stergeAccesariVechi(){
    var queryDelete="delete from accesari where now()-data_accesare >= interval '10 minutes' ";
    client.query(queryDelete, function(err, rezQuery){
        console.log(err);
    });
}

stergeAccesariVechi();
setInterval(stergeAccesariVechi, 10*60*1000)



console.log("Director proiect:",__dirname);

app.get(["/", "/index", "/home","/login"], function(req, res){
    //res.sendFile(__dirname+"/index1.html");
    console.log(obGlobal.obImagini);
    /*client.query("select * from tabel", function(err, rezQuery){
        console.log(rezQuery);
        res.render("pagini/index", {ip:req.ip, imagini:obGlobal.obImagini.imagini, produse: rezQuery.rows });
    })*/

    queryCarusel = "select imagine, nume, descriere from adidasi"
    var imaginiRandom = [];
    client.query(queryCarusel, function(err, rezQuery) {
        var img = rezQuery.rows;
        var i1 = Math.floor(Math.random()*11);
        var i2 = Math.floor(Math.random()*11);
        var i3 = Math.floor(Math.random()*11);
        var i4 = Math.floor(Math.random()*11);
        var i5 = Math.floor(Math.random()*11);
        imaginiRandom = [img[i1], img[i2], img[i3], img[i4], img[i5]];
        console.log("imagini random: ");
        console.log(imaginiRandom);
    })

    querySelect="select username, nume from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '10 minutes')"
    client.query(querySelect, function(err, rezQuery){
        useriOnline=[]
        if(err) console.log(err);
        else useriOnline= rezQuery.rows;

        var evenimente=[]
        var locatie="";

        request('https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&fqcn=109.99.96.15', //se inlocuieste cu req.ip; se testeaza doar pe Heroku
            function (error, response, body) {
                if(error) {console.error('error:', error)}
                else{
                    var obiectLocatie=JSON.parse(body);
                    console.log(obiectLocatie);
                    locatie=obiectLocatie.geobytescountry+" "+obiectLocatie.geobytesregion
                }

                //generare evenimente random pentru calendar

                var texteEvenimente=["Eveniment important", "Festivitate", "Prajituri gratis", "Zi cu soare", "Aniversare"];
                dataCurenta=new Date();
                for(i=0;i<texteEvenimente.length;i++){
                    evenimente.push({data: new Date(dataCurenta.getFullYear(), dataCurenta.getMonth(), Math.ceil(Math.random()*27) ), text:texteEvenimente[i]});
                }
                console.log(evenimente)
                console.log("inainte",req.session.mesajLogin);
                res.render("pagini/index", {ip:getIp(req),
                    imagini:obGlobal.obImagini.imagini,
                    imagini_a: UltimeleImagini(),
                    useriOnline: useriOnline,
                    evenimente: evenimente,
                    locatie:locatie,
                    imaginiRandom: imaginiRandom});
            });
    });

})


app.get("/produse", function(req, res){
    console.log(req.query);
    client.query("select * from unnest(enum_range(null::categ_brand))", function(err, rezCateg){
        var cond_where=req.query.tip ? ` tip_produs='${req.query.tip}'` : " 1=1";

        client.query("select * from adidasi where "+cond_where, function(err, rezQuery){
            console.log(err);
            console.log(rezQuery);
            res.render("pagini/produse", {produse: rezQuery.rows , optiuni:rezCateg.rows});
        });
    });
});


app.get("/produs/:id", function(req, res){
    console.log(req.params);
    var queryProdus=`select * from adidasi where id= ${req.params.id}`;
    console.log(queryProdus)
    client.query(queryProdus, function(err, rezQuery){

        if(err){
            console.log(err);
            randeazaEroare(res,2);
        }
        else{
            console.log(rezQuery);
            res.render("pagini/produs", {prod: rezQuery.rows[0] });
        }
    });
});


// ==================== Cos virtual ============================
app.post("/produse_cos",function(req, res){
    console.log(req.body);
    if(req.body.ids_prod.length!=0){
        let querySelect=`select nume, descriere, pret, marime, imagine from adidasi where id in (${req.body.ids_prod.join(",")})`
        client.query(querySelect, function(err, rezQuery){
            if(err){
                console.log(err);
                res.send("Eroare baza date");
            }
            res.send(rezQuery.rows);
        });
    }
    else{
        res.send([]);
    }
});


app.post("/cumpara",function(req, res){
    if(!req.session.utilizator){
        res.write("Nu puteti cumpara daca nu sunteti logat!");res.end();
        return;
    }
    //TO DO verificare id-uri pentru query-ul la baza de date
    client.query("select id, nume, pret, marime, culoare_principala, categorie, imagine from adidasi where id in ("+req.body.ids_prod+")", function(err,rez){
        //console.log(err, rez);
        //console.log(rez.rows);

        let rezFactura=ejs.render(fs.readFileSync("views/pagini/factura.ejs").toString("utf8"),{utilizator:req.session.utilizator,produse:rez.rows, protocol:obGlobal.protocol, domeniu:obGlobal.numeDomeniu});
        //console.log(rezFactura);
        let options = { format: 'A4', args: ['--no-sandbox', '--disable-extensions',  '--disable-setuid-sandbox'] };

        let file = { content: juice(rezFactura, {inlinePseudoElements:true}) };

        html_to_pdf.generatePdf(file, options).then(function(pdf) {
            if(!fs.existsSync("./temp"))
                fs.mkdirSync("./temp");
            var numefis="./temp/test"+(new Date()).getTime()+".pdf";
            fs.writeFileSync(numefis,pdf);
            let mText=`Stimate ${req.session.utilizator.username}, aveți atașată factura.`;
            let mHtml=`<h1>Salut!</h1><p>${mText}</p>`;

            trimiteMail(req.session.utilizator.email,"Factura", mText, mHtml, [{
                filename: 'factura.pdf',
                content: fs.readFileSync(numefis)
            }]);
            res.write("Totu bine!");res.end();
            let factura= { data: new Date(), username: req.session.utilizator.username, produse:rez.rows };
            obGlobal.bdMongo.collection("facturi").insertOne(factura, function(err, res) {
                if (err) console.log(err);
                else{
                    console.log("Am inserat factura in mongodb");
                    //doar de debug:
                    obGlobal.bdMongo.collection("facturi").find({}).toArray(function(err, result) {
                        if (err) console.log(err);
                        else console.log(result);
                    });
                }
            });
        });



    });


});



///////////////////////////////////////////////////////////////////////////////////////////////
//////////////// Contact
caleXMLMesaje="resurse/xml/contact.xml";
headerXML=`<?xml version="1.0" encoding="utf-8"?>`;
function creeazaXMlContactDacaNuExista(){
    if (!fs.existsSync(caleXMLMesaje)){
        let initXML={
            "declaration":{
                "attributes":{
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name":"contact",
                    "elements": [
                        {
                            "type": "element",
                            "name":"mesaje",
                            "elements":[]
                        }
                    ]
                }
            ]
        }
        let sirXml=xmljs.js2xml(initXML,{compact:false, spaces:4});//obtin sirul xml (cu taguri)
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje,sirXml);
        return false; //l-a creat
    }
    return true; //nu l-a creat acum
}


function parseazaMesaje(){
    let existaInainte=creeazaXMlContactDacaNuExista();
    let mesajeXml=[];
    let obJson;
    if (existaInainte){
        let sirXML=fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson=xmljs.xml2js(sirXML,{compact:false, spaces:4});


        let elementMesaje=obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        });
        let vectElementeMesaj=elementMesaje.elements?elementMesaje.elements:[];// conditie ? val_true: val_false
        console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        }))
        let mesajeXml=vectElementeMesaj.filter(function(el){return el.name=="mesaj"});
        return [obJson, elementMesaje,mesajeXml];
    }
    return [obJson,[],[]];
}


app.get("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();

    res.render("pagini/contact",{ utilizator:req.session.utilizator, mesaje:mesajeXml})
});

app.post("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();

    let u= req.session.utilizator?req.session.utilizator.username:"anonim";
    let mesajNou={
        type:"element",
        name:"mesaj",
        attributes:{
            username:u,
            data:new Date()
        },
        elements:[{type:"text", "text":req.body.mesaj}]
    };
    if(elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else
        elementMesaje.elements=[mesajNou];
    console.log(elementMesaje.elements);
    let sirXml=xmljs.js2xml(obJson,{compact:false, spaces:4});
    console.log("XML: ",sirXml);
    fs.writeFileSync("resurse/xml/contact.xml",sirXml);

    res.render("pagini/contact",{ utilizator:req.session.utilizator, mesaje:elementMesaje.elements})
});

/////////////////////////////////////////////////////////////////


app.get("/eroare", function(req, res){
    randeazaEroare(res,1, "Titlu schimbat");

});


// app.get("*/galerie-animata.css",function(req, res){
//     /* TO DO
//     citim in sirScss continutul fisierului galerie_animata.scss
//     setam culoare aleatoare din vectorul culori=["navy","black","purple","grey"]
//     in variabila rezScss compilam codul ejs din sirScss
//     scriu rezScss in galerie-animata.scss din folderul temp
//     compilez scss cu sourceMap:true
//     scriu rezultatul in "temp/galerie-animata.css"
//     setez headerul Content-Type
//     trimit fisierul css
//     */
//     var sirScss=fs.readFileSync(__dirname+"/resurse/scss/galerie_animata.scss").toString("utf8");
//     var culori=["navy","black","purple","grey"];
//     var indiceAleator=Math.floor(Math.random()*culori.length);
//     var culoareAleatoare=culori[indiceAleator];
//     rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
//     console.log(rezScss);
//     var caleScss=__dirname+"/temp/galerie_animata.scss"
//     fs.writeFileSync(caleScss,rezScss);
//     try {
//         rezCompilare=sass.compile(caleScss,{sourceMap:true});
//
//         var caleCss=__dirname+"/temp/galerie_animata.css";
//         fs.writeFileSync(caleCss,rezCompilare.css);
//         res.setHeader("Content-Type","text/css");
//         res.sendFile(caleCss);
//     }
//     catch (err){
//         console.log(err);
//         res.send("Eroare");
//     }
// });

//----------------------------------------- utilizatori-------------------------------------------
parolaServer="tehniciweb";
app.post("/inreg",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){
        console.log(campuriText);

        var eroare="";
        if(campuriText.username==""){
            eroare+="Username necompletat. ";
        }
        if(!campuriText.username.match(new RegExp("^[A-Za-z0-9]+$"))){
            eroare+="Username nu corespunde patternului. ";
        }
        if(!eroare){
            queryUtiliz=`select username from utilizatori where username='${campuriText.username}'`;
            client.query(queryUtiliz, function(err, rezUtiliz){
                if (rezUtiliz.rows.length!=0){
                    eroare+="Username-ul mai exista. ";
                    res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
                }
                else{
                    var parolaCriptata=crypto.scryptSync(campuriText.parola,parolaServer, 64).toString('hex');
                    let token=genereazaToken(100);
                    var comandaInserare=`insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, cod) values ('${campuriText.username}','${campuriText.nume}', '${campuriText.prenume}', '${parolaCriptata}', '${campuriText.email}', '${campuriText.culoare_chat}', '${token}' ) `;
                    client.query(comandaInserare, function(err, rezInserare){
                        if(err){
                            console.log(err);
                            res.render("pagini/inregistrare", {err: "Eroare baza de date"});
                        }
                        else{
                            res.render("pagini/inregistrare", {raspuns: "Datele au fost introduse"});
                            let linkConfirmare=`${obGlobal.protocol}${obGlobal.numeDomeniu}/confirmare/${campuriText.username}/${token}`;
                            trimiteMail(campuriText.email, "Cont nou", "text",`<h1>Bine ai venit in comunitatea Sneakerscape!</h1>
                                            <p style='color:green'>Username-ul tau este ${campuriText.username}.</p>
                                            <a href='${linkConfirmare}'>Link confirmare</a>`);
                        }
                    });

                }
            })
        }
        else
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
    });
    formular.on("field", function(nume,val){  // 1
        console.log(`--- ${nume}=${val}`);
        if(nume=="username")
            username=val;
    })
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");
        caleUtiliz=path.join(__dirname,"poze_uploadate",username)
        if(!fs.existsSync(caleUtiliz))
            fs.mkdirSync(caleUtiliz);
        fisier.filepath=path.join(caleUtiliz,fisier.originalFilename);
        console.log(nume, fisier);
        console.log(nume, fisier.filepath);
    })
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    });
});

//http://localhost:8080/cod/SXJXN4vthtalNW3sGRpsBQBR4ChtYjbDSqKyblitLfiOcomeAHSU3Epi8R7b0iXICQaDBRnIUadKzpvEuUNcVVoacKJ0dAYihn1r
app.get("/confirmare/:username/:token",function(req, res){
    var comandaUpdate=`update utilizatori set confirmat_mail=true where username='${req.params.username}' and cod='${req.params.token}'`;
    client.query(comandaUpdate, function(err, rezUpdate){
        if(err){
            console.log(err);
            randeazaEroare(res, 2);
        }
        else{
            if(rezUpdate.rowCount==1){
                res.render("pagini/confirmare");
            }
            else{
                randeazaEroare(res,-1, "Mail neconfirmat", "Incercati iar");
            }
        }
    })

})

app.post("/login",function(req, res){
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){
        console.log(campuriText);
        var parolaCriptata=crypto.scryptSync(campuriText.parola,parolaServer, 64).toString('hex');
        //var querySelect=`select * from utilizatori where username='${campuriText.username}' and parola='${parolaCriptata}' and confirmat_mail=true `;
        var querySelect=`select * from utilizatori where username= $1::text and parola= $2::text and confirmat_mail=true `;
        console.log(querySelect);
        client.query(querySelect, [campuriText.username, parolaCriptata ] ,function(err, rezSelect){
            if(err){
                console.log(err);
                randeazaEroare(res, 2);
            }
            else{
                console.log(rezSelect.rows.length);
                if(rezSelect.rows.length==1){ //daca am utilizatorul si a dat credentiale corecte

                    //trebuie din baza de date - asta aveti voi de facut
                    caleUser=path.join(__dirname, "poze_uploadate",rezSelect.rows[0].username)
                    let vect_fis=[];
                    if (fs.existsSync(caleUser))
                        vect_fis=fs.readdirSync(caleUser);



                    req.session.utilizator={
                        id:rezSelect.rows[0].id,
                        nume:rezSelect.rows[0].nume,
                        prenume:rezSelect.rows[0].prenume,
                        username:rezSelect.rows[0].username,
                        email:rezSelect.rows[0].email,
                        culoare_chat:rezSelect.rows[0].culoare_chat,
                        rol:rezSelect.rows[0].rol,
                        poza:vect_fis.length>0 ? path.join("/poze_uploadate",rezSelect.rows[0].username,vect_fis[0]):null
                    }
                    res.redirect("/index");
                }
                else{
                    //randeazaEroare(res, -1, "Login esuat", "User sau parola gresita sau nu a fost confirmat mailul", null);

                    req.session.mesajLogin="Login esuat";
                    res.redirect("/index");
                }
            }
        } )
    })
});



app.get("/useri", function(req, res){
    if(req.session.utilizator && req.session.utilizator.rol=="admin"){
        client.query("select * from utilizatori", function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
    }
    else{
        randeazaEroare(res, 403);
    }
});

app.post("/sterge_utiliz", function(req, res){
    var formular= new formidable.IncomingForm();

    formular.parse(req,function(err, campuriText, campuriFile){
        var queryDelete=`delete from utilizatori where id=${campuriText.id_utiliz}`;
        client.query(queryDelete,function(err, rezQuery){
            console.log(err);
            res.redirect("/useri");
        });
    });

})

// ---------------- Update profil -----------------------------

app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        res.render("pagini/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();

    formular.parse(req,function(err, campuriText, campuriFile){

        var criptareParola=crypto.scryptSync(campuriText.parola,parolaServer, 64).toString('hex');

        //TO DO query
        var queryUpdate=`update utilizatori set nume='${campuriText.nume}', prenume='${campuriText.prenume}', email='${campuriText.email}', culoare_chat='${campuriText.culoare_chat}' where parola='${criptareParola}'`;
        console.log(queryUpdate);
        client.query(queryUpdate,  function(err, rez){
            if(err){
                console.log(err);
                res.render("pagini/eroare_generala",{text:"Eroare baza date. Incercati mai tarziu."});
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{
                //actualizare sesiune
                req.session.utilizator.nume= campuriText.nume;
                req.session.utilizator.prenume= campuriText.prenume;
                req.session.utilizator.email= campuriText.email;
                req.session.utilizator.culoare_chat= campuriText.culoare_chat;
            }


            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});

        });


    });
});


app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
});


app.get("/*.ejs", function(req, res){
    //res.sendFile(__dirname+"/index1.html");
    //res.status(403).render("pagini/403");
    randeazaEroare(res,403);
})

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});

/*
app.get("/despre", function(req, res){
    //res.sendFile(__dirname+"/index1.html");
    res.render("pagini/despre");
})
*/

app.get("/ceva", function(req, res, next){
    res.write("Salut-2");

    console.log("2");
    next();
})


app.get("/*", function(req, res){
    res.render("pagini"+req.url, function(err, rezRender){
        if (err){
            console.log(err);
            if(err.message.includes("Failed to lookup view")){
                console.log(err);
                //res.status(404).render("pagini/404");
                randeazaEroare(res,404);
            }
            else{

                res.render("pagini/eroare_generala");
            }
        }
        else{
            //console.log(rezRender);
            res.send(rezRender);
        }
    });

    //console.log("generala:",req.url);
    res.end();
})

function creeazaImagini(){
    var buf=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf8");


    obGlobal.obImagini=JSON.parse(buf);//global



    //console.log(obGlobal.obImagini);
    for (let imag of obGlobal.obImagini.imagini){
        let nume_imag, extensie;
        [nume_imag, extensie ]=imag.cale_imagine.split(".")// "abc.de".split(".") ---> ["abc","de"] imagine.png->imagine.webp
        let dim_mic=150

        imag.mic=`${obGlobal.obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp` //nume-150.webp // "a10" b=10 "a"+b `a${b}`
        //console.log(imag.mic);


        imag.mare=`${obGlobal.obImagini.cale_galerie}/${imag.cale_imagine}`;
        if (!fs.existsSync(imag.mic))
            sharp(__dirname+"/"+imag.mare).resize(dim_mic).toFile(__dirname+"/"+imag.mic);


        let dim_mediu=300;
        imag.mediu=`${obGlobal.obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.png`
        if (!fs.existsSync(imag.mediu))
            sharp(__dirname+"/"+imag.mare).resize(dim_mediu).toFile(__dirname+"/"+imag.mediu);


    }

}
creeazaImagini();

function creeazaErori(){
    var continutFisier= fs.readFileSync(__dirname+"/resurse/json/erori.json", {}, function(err, data){ console.log(data);}).toString("utf8");

    obGlobal.obErori=JSON.parse(continutFisier);// atentie e global pentru ca nu e definit cu var sau let
    //console.log(obGlobal.obErori);
}
creeazaErori();

function randeazaEroare(res, identificator=-1, titlu, text, imagine){
    var eroare= obGlobal.obErori.erori.find(function(elem){ return elem.identificator == identificator })
    titlu= titlu || (eroare && eroare.titlu) || obGlobal.obErori.eroare_default.titlu;
    text= text || (eroare && eroare.text) || obGlobal.obErori.eroare_default.text;
    imagine= imagine || (eroare && path.join(obGlobal.obErori.cale_baza,eroare.imagine))
        || path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
    if(eroare && eroare.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare_generala",{titlu:titlu, text:text, imagine:imagine });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////// Resetare folder imagini qr-code

cale_qr="./resurse/imagini/qrcode";
if (fs.existsSync(cale_qr))
    fs.rmSync(cale_qr, {force:true, recursive:true});
fs.mkdirSync(cale_qr);
client.query("select id from adidasi", function(err, rez){
    for(let prod of rez.rows){
        let cale_prod=obGlobal.protocol+obGlobal.numeDomeniu+"/produs/"+prod.id;
        //console.log(cale_prod);
        QRCode.toFile(cale_qr+"/"+prod.id+".png",cale_prod);
    }
});


var s_port=process.env.PORT || obGlobal.port
app.listen(s_port);
console.log("A pornit")