const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')
const expressSession = require('express-session')
const mongoose = require('mongoose')
const Persona = require('./models/Persona')

const app = express()
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(expressSession({
    secret: "sonomrmiguardi",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto',
        maxAge: 3600000
    }
}))
const db_username = "luca";
const db_password = "localhost";
const db_name = "Palestra";

const db = mongoose.connect(`mongodb+srv://${db_username}:${db_password}@cluster0.03n59.mongodb.net/${db_name}?retryWrites=true&w=majority`, { useNewUrlParser: true }, () => {
    console.log("Sono connesso a MongoDB");
})

app.listen(3000, () => {
    console.log("Sono acceso")
})

app.get('/palestra', (req, res) =>{
    if (req.session.username != null){
        res.redirect('/palestra/corsi')
    }
    else{
        res.redirect('/palestra/login')
    }
})

//PAGINA LOGIN
app.get('/palestra/login', (req, res) => {
    if (req.session.username != null){
        res.redirect('/palestra/corsi')
    }
    else{
        res.sendFile(
            path.resolve(__dirname, "views", "login.html")
        )
    }
})

//VERIFICA CHE L'ACCOUNTE E' PRESENTE NEL SERVER
app.post('/verifica', (req, res) => {
    let pers = {
        nome: req.body.nome,
        password: req.body.password
    }
    if (Object.keys(pers).length < 2 || Object.keys(pers).length > 2){
        res.redirect('/palestra/login')
    }
    Persona.find(pers, (err, persona) => {
        if (err) throw err
        else {
            if (persona.length == 0) {
                res.redirect('/palestra/login')
                return
            }
            else {
                req.session.username = req.body.nome        //SETTO NELLA SESSIONE DELL'UTENTE APPENA LOGGATO IL NOME 
                req.session.password = req.body.password    //SETTO NELLA SESSIONE DELL'UTENTE APPENA LOGGATO IL NOME 
                res.redirect('/palestra/corsi')
            }
        }
    })
})

//PAGINA REGISTER
app.get("/palestra/register", (req, res) => {
    if (req.session.username != null){
        res.redirect('/palestra/corsi')
    }
    else{
        res.sendFile(
            path.resolve(__dirname, "views", "register.html")
        )
    }
})

//REGISTRAZIONE NUOVO UTENTE
app.post('/palestra/reg', (req, res) => {
    let objPersona = {
        nome: req.body.nome,
        cognome: req.body.cognome,
        password: req.body.password,
        corso1: "no"
    }
    Persona.create(objPersona, (err, persona) => {
        if (err) {
            req.session.nonvalido = "nome utente già esistente"
            res.redirect('/palestra/register')
            return;
        }
        else {
            req.session.username = req.body.nome            //SETTO NELLA SESSIONE DELL'UTENTE APPENA ISCRITTO IL NOME 
            req.session.password = req.body.password        //SETTO NELLA SESSIONE DELL'UTENTE APPENA ISCRITTO LA PASSWORD 
            res.redirect('/palestra/corsi')
        }
    })
})

//SE L'UTENTE E' PRESENTE REINDIRIZZA A CORSI
app.get('/palestra/corsi', (req,res) =>{
    if (req.session.username != null){
        res.sendFile(
            path.resolve(__dirname, "views", "corsi.html")
        )
    }
    else{
        res.redirect('/palestra/register')
    }
})

//VISUALIZZA SE SEI ISCRITTO
app.get('/palestra/corsi/corsiRegistrati', (req, res) =>{
    let pers = {
        nome: req.session.username,
        password: req.session.password
    }
    Persona.find(pers, (err, persona) => {
        if (err) throw err
        else {
            if(persona[0].corso1 == "si"){
                res.json(true)
            }
            else{
                res.json(false)
            }
        }
    })
})

//ISCRIZIONE CORSO 1
app.put('/palestra/corsi/register',(req,res) =>{
    let pers = {
        nome: req.session.username,
        password: req.session.password
    }
    Persona.updateOne(pers, {"corso1":"si"}, (err, persona) => {
        if (err) {
            console.log("errore")
            res.json("errore")
            return;
        }
        else {
            res.json(true)
        }
    })
})

//ANNULLA ISCRIZIONE CORSO 1
app.put('/palestra/corsi/annulla',(req,res) =>{
    let pers = {
        nome: req.session.username,
        password: req.session.password
    }
    Persona.updateOne(pers, {"corso1":"no"}, (err, persona) => {
        if (err) {
            console.log("errore")
            res.json("errore")
            return;
        }
        else {
            res.json(true)
        }
    })
})