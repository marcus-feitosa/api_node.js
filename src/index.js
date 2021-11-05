//const { request, response } = require("express");
//npm install supervisor -g
//supervisor src/index.js
const { request, response } = require("express");
const express = require("express");
const { v4:uuidv4 } = require("uuid");


const app = express();
app.use(express.json());
const clientes = [];

function verifyIfExistsAccountCPF(request, response, next){
    const {cpf} = request.headers;
    const cliente = clientes.find(cliente => cliente.cpf === cpf);
    if(!cliente){
        return response.status(400).json({error:"Cliente não encontrado!"});
    }
    request.cliente = cliente;
    return next();
}


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
//app.use(verifyIfExistsAccountCPF);
app.get("/statement/:cpf",verifyIfExistsAccountCPF, (request,response)=>{
    const {cliente} = request;
    return response.json(cliente.statement);
});
app.post("/deposit", verifyIfExistsAccountCPF,(request, response)=>{
    const {description, amount,type} = request.body;
    const{ cliente }=request;
    const statementOperation = {
        description, amount, created_at: new Date(),type
    }
    cliente.statement.push(statementOperation);
    return response.status(201).send();
})

app.listen(8080);