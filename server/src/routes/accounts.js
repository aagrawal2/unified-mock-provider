const router = require('express').Router();
const app = require('../server');
const ObjectId = require('mongodb').ObjectId;
//const uniqid = require('uniqid'); //move this from server side to client side

//add new account(s) to db
router.post('/user/:username/provider/:providerName/accounts', (req,res,next) => {    
    Promise.resolve().then(async ()=> {        
        const db = app.locals.db;   
        const collection = req.params.providerName;
        
        //mutate req.body to have username in each document
        const username = req.params.username;
        const userAccounts = req.body;        
        for (userAccount of userAccounts) {
            userAccount.username = username;
        }
        
        //insert many accounts in one write operation
        const result = await db.collection(collection).insertMany(userAccounts);
        res.status(201).send(result.ops);        
    }).catch(next);    
});

//get account(s) from db for a given user in a given provider
router.get('/user/:username/provider/:providerName/accounts',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.params.username;
        const collection = req.params.providerName;

        //.toArray() is good enough for 'n' number of docs and then there might be chance of outOfMemory/performance leak. During performance test we should find value of this 'n'.
        //TODO: in future we might want to use Cursor object to iterate over docs in chunks and return results.         
        const accounts = await db.collection(collection).find({username: username}).toArray();
        res.status(200).send(accounts);

    }).catch(next);
})

//get account details for a particular accountId for a given user in a given provider
router.get('/user/:username/provider/:providerName/account/:accountId',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.params.username;
        const collection = req.params.providerName;
        const accountId = req.params.accountId;

        const accountDetails = await db.collection(collection).find({username:username,_id:ObjectId(accountId)}).toArray();       
        res.status(200).send(accountDetails);

    }).catch(next);
})

//Create transactions - by associate to an existing account for a given user in a given provider 
router.put('/user/:username/provider/:providerName/account/:docId/transactions',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;        
        const collection = req.params.providerName;
        const docId = req.params.docId;
        const body = req.body;        

        //create an object to have all the txnId fields         
        const txnsUpdate = {};     
        const transactions = body.transactions;   
        for (const key in transactions) {
            const value = transactions[key];
            const keyUpdate = 'transactions.'+key;
            txnsUpdate[keyUpdate] = value;
        }

        //update an existing account to create transactions
        const result = await db.collection(collection).updateOne({_id:ObjectId(docId)},{$set:txnsUpdate});
        res.status(200).send(result);        
    }).catch(next);
})

//Update transaction by its key for a given account docId
router.put('/user/:username/provider/:providerName/account/:docId/transaction/:txnId',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const collection = req.params.providerName;
        const docId = req.params.docId;
        const txnId = req.params.txnId;
        const field = 'transactions.'+txnId;
        const transaction = {};
        transaction[field] = req.body.transaction;

        //update an existing transaction 
        const result = await db.collection(collection).updateOne({_id:ObjectId(docId)},{$set:transaction});
        res.status(200).send(result);
    }).catch(next);
})

//delete an account from db per user per provider
router.delete('/user/:username/provider/:providerName/account/:docId',(req,res,next) => {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const collection = req.params.providerName;
        const docId = req.params.docId;

        const result = await db.collection(collection).deleteOne({_id:ObjectId(docId)});
        if (result) {
            if (result.deletedCount === 1) {
                res.status(200).send({message: 'account deleted successfully'});
            }
            else {
                res.status(200).send({error: 'account doesn`t exist'});
            }
        }
        else {
            res.sendStatus(500);
        }
    }).catch(next);
})

//TODO: update an account 
//TODO: add a bill associated with an account

router.delete('/user',(req,res,next) => {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.query.username;
        const password = req.query.password;

        const result = await db.collection('users').deleteOne({username:username,password:password});
        if (result) {
            if (result.deletedCount === 1) {
                res.status(200).send({message: 'deleted successfully'});
            }
            else {
                res.status(200).send({error: 'user doesn`t exist'});
            }
        }
        else {
            res.sendStatus(500);
        }
    }).catch(next);
})

module.exports = router;
