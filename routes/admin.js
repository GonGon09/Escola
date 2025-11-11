const express = require('express');
const rotas = express.Router();
const BD = require('../bd');


rotas.get('/login', (req,res) => {
    res.render('admin/login.ejs')
});

rotas.post('/login', async(req,res) => {
    const email = req.body.email;
    const senha = req.body.senha;

    const sql= 'select * from usuarios where email = $1 and senha = $2';
    const dados = await BD.query(sql, [email, senha])

    if(dados.rows.length == 0 ) {
        res.render('admin/login', {mensagem:  'Email ou senha incorretos'})

    }   else{
        req.session.usuario = dados.rows[0];
        res.redirect('/admin')
    }
});

rotas.get('/logout', (req,res) => {
    req.session.destroy();
    res.render('admin/login.ejs')
});



module.exports= rotas;