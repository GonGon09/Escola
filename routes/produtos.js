const express = require('express');
const rotas = express.Router();
const BD = require('../bd'); // <-- igual ao seu código de disciplinas

// Listar produtos (R - Read)
// localhost:3000/produtos/listar
rotas.get('/listar', async (req, res) => {
    const busca = req.query.busca || '';
    const ordem = req.query.ordem || 'nome_produto';

    const dados = await BD.query(`
        SELECT p.*, c.nome_categoria
        FROM produtos p
        LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
        WHERE p.ativo = true
        AND (
            CAST(p.id_produto AS TEXT) ILIKE $1 OR
            p.nome_produto ILIKE $1 OR
            p.marca ILIKE $1
        )
        ORDER BY ${ordem}
    `, ['%' + busca + '%']);

    console.log(dados.rows);
    res.render('produtos/lista.ejs', { dadosProdutos: dados.rows, ordem: ordem, busca: busca });
});



rotas.get('/adm_listar', async (req, res) => {
    const busca = req.query.busca || '';
    const ordem = req.query.ordem || 'nome_produto';

    const dados = await BD.query(`
        SELECT p.*, c.nome_categoria
        FROM produtos p
        LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
        WHERE p.ativo = true
        AND (
            CAST(p.id_produto AS TEXT) ILIKE $1 OR
            p.nome_produto ILIKE $1 OR
            p.marca ILIKE $1
        )
        ORDER BY ${ordem}
    `, ['%' + busca + '%']);

    console.log(dados.rows);
    res.render('admin/admin.ejs', { dadosProdutos: dados.rows, ordem: ordem, busca: busca });
});



// Form para cadastrar novo produto
rotas.get('/novo', async (req, res) => {
    const categorias = await BD.query(`
        SELECT id_categoria, nome_categoria
        FROM categorias
        WHERE ativo = true
        ORDER BY nome_categoria
    `);

    res.render('produtos/novo.ejs', { categorias: categorias.rows });
});

// Salvar novo produto
rotas.post('/novo', async (req, res) => {
    const { nome_produto, tamanho, marca, descricao, quantidade, estoque_minimo, valor, imagem, id_categoria } = req.body;

    const sql = `
        INSERT INTO produtos
        (nome_produto, tamanho, marca, descricao, quantidade, estoque_minimo, valor, imagem, id_categoria)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;

    await BD.query(sql, [
        nome_produto, tamanho, marca, descricao,
        quantidade, estoque_minimo, valor, imagem, id_categoria
    ]);

    res.redirect('/produtos/listar');
});

// Excluir (D - Delete lógico)
rotas.post('/excluir/:id', async (req, res) => {
    const id = req.params.id;

    const sql = 'UPDATE produtos SET ativo = false WHERE id_produto = $1';
    await BD.query(sql, [id]);

    res.redirect('/produtos/listar');
});

// Form para editar produto
rotas.get('/editar/:id', async (req, res) => {
    const id = req.params.id;

    const produto = await BD.query('SELECT * FROM produtos WHERE id_produto = $1', [id]);
    const categorias = await BD.query(`
        SELECT id_categoria, nome_categoria FROM categorias WHERE ativo = true ORDER BY nome_categoria
    `);

    res.render('produtos/editar.ejs', {
        produto: produto.rows[0],
        categorias: categorias.rows
    });
});

// Salvar edição
rotas.post('/editar/:id', async (req, res) => {
    const id = req.params.id;
    const { nome_produto, tamanho, marca, descricao, quantidade, estoque_minimo, valor, imagem, id_categoria } = req.body;

    const sql = `
        UPDATE produtos SET 
        nome_produto = $1,
        tamanho = $2,
        marca = $3,
        descricao = $4,
        quantidade = $5,
        estoque_minimo = $6,
        valor = $7,
        imagem = $8,
        id_categoria = $9
        WHERE id_produto = $10
    `;

    await BD.query(sql, [
        nome_produto, tamanho, marca, descricao, quantidade,
        estoque_minimo, valor, imagem, id_categoria, id
    ]);

    res.redirect('/produtos/listar');
});

module.exports = rotas;
