const express = require('express');
const rotas = express.Router();
const BD = require('../bd');

// LISTAR CATEGORIAS
rotas.get('/listar', async (req, res) => {

    const busca = req.query.busca || '';
    const ordem = req.query.ordem || 'nome_categoria';

    const dados = await BD.query(`
        SELECT *
        FROM categorias
        WHERE ativo = true
        AND (
            CAST(id_categoria AS TEXT) ILIKE $1 OR
            nome_categoria ILIKE $1
        )
        ORDER BY ${ordem}
    `, ['%' + busca + '%']);

    res.render('categorias/lista.ejs', { categorias: dados.rows });
});


// FORMULÁRIO: NOVA CATEGORIA
rotas.get('/novo', async (req, res) => {
    res.render('categorias/novo.ejs');
});


// SALVAR CATEGORIA
rotas.post('/novo', async (req, res) => {
    const { nome_categoria } = req.body;

    const sql = `
        INSERT INTO categorias (nome_categoria)
        VALUES ($1)
    `;

    await BD.query(sql, [nome_categoria]);
    res.redirect('/categorias/listar');
});


// DESATIVAR CATEGORIA (DELETE lógico)
rotas.post('/excluir/:id', async (req, res) => {
    const id = req.params.id;
    await BD.query(`UPDATE categorias SET ativo = false WHERE id_categoria = $1`, [id]);
    res.redirect('/categorias/listar');
});


// FORMULÁRIO: EDITAR
rotas.get('/editar/:id', async (req, res) => {
    const id = req.params.id;

    const categoria = await BD.query(`
        SELECT * FROM categorias WHERE id_categoria = $1
    `, [id]);

    res.render('categorias/editar.ejs', { categoria: categoria.rows[0] });
});


// SALVAR ALTERAÇÃO
rotas.post('/editar/:id', async (req, res) => {
    const id = req.params.id;
    const { nome_categoria } = req.body;

    const sql = `
        UPDATE categorias SET nome_categoria = $1
        WHERE id_categoria = $2
    `;

    await BD.query(sql, [nome_categoria, id]);

    res.redirect('/categorias/listar');
});

module.exports = rotas;
