//const { request, response } = require("express");
//npm install supervisor -g
//supervisor src/index.js
const { request, response } = require("express");
const express = require("express");
const { v4:uuidv4 } = require("uuid");


const app = express();
app.use(express.json());
const clientes = [];


app.post("/account", (request, response)=>{
    const {cpf, name} = request.body;
   
    const clienteAlreadyExists = clientes.some((clientes)=> clientes.cpf === cpf);
    if(clienteAlreadyExists){
        return response.status(400).json({error : "Cliente já cadastrado!"})
    }
    clientes.push({cpf,
        name,
        id:uuidv4(),
        statement:[]});

    return response.status(201).send();
   
});

app.get("/statement/:cpf", (request,response)=>{
    const {cpf} = request.params;
    const cliente = clientes.find(cliente => cliente.cpf === cpf);
    if(!cliente){
        return response.status(400).json({error:"Cliente não encontrado!"});
    }
    return response.json(cliente.statement);
});

app.listen(3333);