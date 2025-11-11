const express = require('express');
const ejs = require('ejs');
const path = require('path')
const app = express();

const session = require('express-session');
app.use(session({
    secret: 'sesisenai',
    resave: false,
    saveUninitialized: false
}));

const verificarAutentificacao = (req, res, next) =>{
    if(req.session.usuario){
        res.locals.usuario = req.session.usuario || null;
        next()
    } else{
        res.redirect('/admin/login')
    }
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('landing/index.ejs');
});

app.get('/admin', verificarAutentificacao, (req,res) => {
    res.render('admin/dashboard')
});

const categorias = require('./routes/categorias');
app.use('/categorias', verificarAutentificacao,  categorias);

const admin = require('./routes/admin');
app.use('/admin', admin);

const produtos = require('./routes/produtos');
app.use('/produtos', verificarAutentificacao, produtos);

app.use('/movimentacao', verificarAutentificacao, require('./routes/movimentacao'));



const porta = 3001;
app.listen(porta, () => {
    console.log(`Servidor http://192.168.0.219:${porta}`);
});