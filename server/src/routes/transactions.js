import app from '../server';
import { ObjectId } from 'mongodb';

const router = require('express').Router();

//add new transaction(s) to db
router.post('/user/:username/provider/:providerName/account/:accountId/transactions', (req,res,next) => {    
    Promise.resolve().then(async ()=> {        
        const db = app.locals.db;   
        const collection = req.params.providerName;
        
        //mutate req.body to have accountId in each document
        const accountId = req.params.accountId;
        const username = req.params.username;
        const transactions = req.body;        
        for (const transaction  of transactions) {
            transaction.accountId = accountId;
            transaction.username = username;
        }
        
        //insert many transactions in one write operation
        const result = await db.collection(collection).insertMany(transactions);
        res.status(201).send(result.ops);        
    }).catch(next);    
});

//get transaction(s) from db for a given user in a given provider in a given account
router.get('/user/:username/provider/:providerName/account/:accountId/transactions',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.params.username;
        const collection = req.params.providerName;
        const accountId = req.params.accountId;

        //.toArray() is good enough for 'n' number of docs and then there might be chance of outOfMemory/performance leak. During performance test we should find value of this 'n'.
        //TODO: in future we might want to use Cursor object to iterate over docs in chunks and return results.         
        const accounts = await db.collection(collection).find({username: username, accountId: accountId}).toArray();
        res.status(200).send(accounts);

    }).catch(next);
})

//get transaction details for a particular transactionId for a given user in a given provider in a given account
router.get('/user/:username/provider/:providerName/account/:accountId/transaction/:transactionId',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.params.username;
        const collection = req.params.providerName;
        const accountId = req.params.accountId;
        const transactionId = req.params.transactionId;

        const transactionDetails = await db.collection(collection).find({username:username,accountId:accountId,_id:ObjectId(transactionId)}).toArray();       
        res.status(200).send(transactionDetails);

    }).catch(next);
})

//Update transaction by its key for a given account docId
router.put('/user/:username/provider/:providerName/account/:accountId/transaction/:transactionId',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const collection = req.params.providerName;        
        const transactionId = req.params.transactionId;
        const transaction = req.body.transaction;
        const body = req.body;

        //prepare $unset object if exist from req.body
        const unset = {};
        for (const key in body) {
            if(body.hasOwnProperty(key)) {
                let value = body[key];
                //if it's an embedded object then find valus of last nested key for $unset
                let keyEmbedded = undefined;
                if(typeof value === 'object') {                                        
                    while(typeof value === 'object') {
                        let tmpKey = Object.getOwnPropertyNames(value)[0];                        
                        value = value[tmpKey];
                    }                    
                }
                if(value === 'null' || /^\s*$/.test(value)) {
                    unset[key] = '';    
                }                
            }
        }

        let result = await db.collection(collection).updateOne({_id:ObjectId(transactionId)},{$set:body});
        if(Object.keys(unset).length !== 0) {
            result = await db.collection(collection).updateOne({_id:ObjectId(transactionId)},{$unset:unset});
        }
        
        if (result) {
            if (result.modifiedCount === 1) {
                res.status(200).send({message: 'transaction updated successfully'});
            }
            else {
                res.status(200).send({error: `transaction didn't get updated`});
            }
        }
        else {
            res.sendStatus(500);
        }
    }).catch(next);
})

//delete a transaction from db per user per provider per account
router.delete('/user/:username/provider/:providerName/account/:accountId/transaction/:transactionId',(req,res,next) => {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const collection = req.params.providerName;
        const transactionId = req.params.transactionId;

        const result = await db.collection(collection).deleteOne({_id:ObjectId(transactionId)});
        if (result) {
            if (result.deletedCount === 1) {
                res.status(200).send({message: 'transaction deleted successfully'});
            }
            else {
                res.status(200).send({error: 'transaction doesn`t exist'});
            }
        }
        else {
            res.sendStatus(500);
        }
    }).catch(next);
})

export default router;
