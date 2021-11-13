//const { request, response } = require("express");
//npm install supervisor -g
//supervisor src/index.js
const { request, response, text } = require("express");
const express = require("express");
const { v4:uuidv4 } = require("uuid");


const app = express();
app.use(express.json());
const clientes = [];

function getBalance(statement){
    const balance = statement.reduce((acc, operation)=>{
        if (operation.type === 'credit'){
            return acc+ operation.amount;
        }else{
            return acc-operation.amount;
        }
    },0);
    return balance
} 

function verifyIfExistsAccountCPF(request, response, next){
    const {cpf} = request.headers;
    const cliente = clientes.find(cliente => cliente.cpf === cpf);
    if(!cliente){
        return response.status(400).json({error:"Cliente não encontrado!"});
    }
    request.cliente = cliente;
    return next();
}

app.listen(3333);

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
app.get("/statement",verifyIfExistsAccountCPF, (request,response)=>{
    const {cliente} = request;
    return response.json(cliente.statement);
});
app.post("/deposit", verifyIfExistsAccountCPF,(request, response)=>{
    const {description, amount} = request.body;
    const{ cliente }=request;
    const statementOperation = {
        description, amount, created_at: new Date(),type:"credit"
    }
    cliente.statement.push(statementOperation);
    return response.status(201).send();
});
app.post("/withdraw",verifyIfExistsAccountCPF, (request,response)=>{
    const {amount} = request.body;
    const {cliente}= request;
    const balance = getBalance(cliente.statement);

    if(balance< amount){
        return response.status(400).json({error:"Fundos insuficientes!"});
        }
    const statementOperation = {
        amount, 
        created_at: new Date(),
        type:"debit",
        };
    cliente.statement.push(statementOperation);

    return response.status(201).send(); 
})
app.get("/statement/date",verifyIfExistsAccountCPF, (request,response)=>{
    const {cliente} = request;
    const {date}= request.query;

    const dateFormat= new Date(date + " 00:00");
    const statement = cliente.statement.filter(
        (statement)=>
    statement.created_at.toDateString()===
    new Date(dateFormat).toDateString()
    );
    return response.json(statement);
})
app.put("/account", verifyIfExistsAccountCPF, (request,response)=>{
    const {name} = request.body;
    const {cliente} = request;
    cliente.name = name;

    return response.status(201).send();
});

app.get("/account",verifyIfExistsAccountCPF,(request,response)=>{
    const {cliente}= request;
    return response.json(cliente);
});

app.delete("/account",verifyIfExistsAccountCPF,(request,response)=>{
    const {cliente} = request;
    clientes.splice(cliente,1);
return response.status(200).json({text:"Cliente deletado!"});
});



