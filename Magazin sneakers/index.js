const express = require("express");
app = express();

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"))

console.log("Director proiect:", __dirname);

app.get(["/", "/index", "/home"], function (req, res){
    res.render("pagini/index", {ip: req.ip, v: [1, 2, 3, 4, 5], mat: [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]})
})

app.get("/despre", function(req, res) {
    res.render("pagini/despre");
})

app.get("/pagina2*", function (req, res) {
    res.render("pagini/pagina2");
})

app.get("/pagina_temp*", function (req, res) {
    res.render("pagini/pagina_temp");
})
app.get("/*.ejs", function (req, res) {
    res.status(403).render("pagini/403");
})

app.get("/*", function (req, res) {
    res.render("pagini" + req.url, function (err, rezRender){
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                console.log(err);
                res.status(404).render("pagini/404");
            }
        }
        else {
            res.render("pagini/eroare_generala");
        }
    });
    console.log("generala:", req.url);
    res.end();
})

app.listen(8080);
console.log("A pornit!");