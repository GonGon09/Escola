const {pool, Pool} = require('pg');
const BD = new Pool(
    {
        user: "postgres", //usuario cadastrado no bd
        host: "localhost", //Endereço do servidor do BD
        database: "_2025_projeto", //Nome do BD a ser conectado
        password: "admin",
        port: 5432 //Porta de conexão

    }
);
 module.exports = BD;