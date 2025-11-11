const express = require('express');
const rotas = express.Router();
const BD = require('../bd');

// LISTAR MOVIMENTAÇÕES + RESUMO
rotas.get('/listar', async (req, res) => {
  try {
    const sqlMov = `
      SELECT 
        m.id_movimentacao, 
        m.tipo_movimentacao, 
        m.quantidade, 
        m.data, 
        p.nome_produto
      FROM movimentacoes m
      INNER JOIN produtos p ON p.id_produto = m.id_produto
      WHERE m.ativo = true
      ORDER BY m.data DESC;
    `;

    const sqlResumo = `
      SELECT
        COALESCE(SUM(CASE WHEN tipo_movimentacao = 'E' THEN quantidade END), 0) AS total_entradas,
        COALESCE(SUM(CASE WHEN tipo_movimentacao = 'S' THEN quantidade END), 0) AS total_saidas,
        COALESCE(SUM(CASE WHEN tipo_movimentacao = 'E' THEN quantidade END), 0) -
        COALESCE(SUM(CASE WHEN tipo_movimentacao = 'S' THEN quantidade END), 0) AS saldo
      FROM movimentacoes
      WHERE ativo = true;
    `;

    const dados = await BD.query(sqlMov);
    const resumo = await BD.query(sqlResumo);

    res.render('movimentacao/lista.ejs', { 
      dadosMov: dados.rows, 
      resumo: resumo.rows[0] 
    });

  } catch (err) {
    console.error("Erro ao listar movimentações:", err);
    res.status(500).send("Erro ao carregar movimentações");
  }
});

// FORMULÁRIO NOVA MOVIMENTAÇÃO
rotas.get('/novo', async (req, res) => {
  const dadosProdutos = await BD.query(`
    SELECT id_produto, nome_produto 
    FROM produtos 
    WHERE ativo = true 
    ORDER BY nome_produto;
  `);

  res.render('movimentacao/novo.ejs', { produtos: dadosProdutos.rows });
});

// CADASTRAR MOVIMENTAÇÃO
rotas.post('/novo', async (req, res) => {
  const { id_produto, tipo_movimentacao, quantidade, descricao } = req.body;

  try {
    await BD.query(`
      INSERT INTO movimentacoes (id_produto, tipo_movimentacao, quantidade, data, descricao, ativo)
      VALUES ($1, $2, $3, NOW(), $4, true);
    `, [id_produto, tipo_movimentacao, quantidade, descricao]);

    // Atualiza estoque do produto
    if (tipo_movimentacao === "E") {
      await BD.query(`UPDATE produtos SET estoque = estoque + $1 WHERE id_produto = $2`, [quantidade, id_produto]);
    } else {
      await BD.query(`UPDATE produtos SET estoque = estoque - $1 WHERE id_produto = $2`, [quantidade, id_produto]);
    }

    res.redirect('/movimentacao/listar');
  } catch (err) {
    console.error("Erro ao cadastrar movimentação:", err);
    res.status(500).send("Erro ao salvar movimentação");
  }
});

// EXCLUIR MOVIMENTAÇÃO (desfaz o movimento)
rotas.post('/excluir/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const dados = await BD.query(`SELECT * FROM movimentacoes WHERE id_movimentacao = $1`, [id]);
    const mov = dados.rows[0];

    if (!mov) {
      return res.status(404).send("Movimentação não encontrada");
    }

    // desfaz o movimento antes de excluir
    if (mov.tipo_movimentacao === "E") {
      await BD.query(`UPDATE produtos SET estoque = estoque - $1 WHERE id_produto = $2`, [mov.quantidade, mov.id_produto]);
    } else {
      await BD.query(`UPDATE produtos SET estoque = estoque + $1 WHERE id_produto = $2`, [mov.quantidade, mov.id_produto]);
    }

    await BD.query(`DELETE FROM movimentacoes WHERE id_movimentacao = $1`, [id]);

    res.redirect('/movimentacao/listar');
  } catch (err) {
    console.error("Erro ao excluir movimentação:", err);
    res.status(500).send("Erro ao excluir movimentação");
  }
});



module.exports = rotas;
