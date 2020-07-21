const express = require('express');
const router = express.Router();
const moment = require('moment');
const uniqid = require('uniqid');
const User = require('./../model/user');
const Transaction = require('./../model/Transaction')


router.post('/fetchBill', auth, (req, res) => {
    if (!req.body.mobileNumber)
        return res.status(400).send({ status: "ERROR", errorCode: "invalid-api-parameters" });
    User.findOne({ mobileNumber: req.body.mobileNumber }, (err, data) => {
        if (data == null)
            return res.status(404).send({ status: "ERROR", errorCode: "customer-not-found" });
        if (err)
            return res.status(400).send({ status: "ERROR", errorCode: "invalid-api-parameters" }); //need to add message invalid-api-parameter
        let response = {
            "status": "SUCCESS",
            "data": {
                "customerName": data.customerName,
                "dueAmount": (data.dueAmount).toString(),
                "dueDate": data.dueDate,
                "refID": data.refID
            }
        }
        return res.status(200).send(response)
    })
})

router.post('/add', async (req, res) => {
    const user = new User({
        mobileNumber: req.body.mobileNumber,
        customerName: req.body.customerName,
        dueAmount: req.body.dueAmount,
        dueDate: req.body.dueDate,
        refID: uniqid()
    })
    try {
        await user.save();
        res.status(200).send("success")
    } catch (error) {
        res.status(400).send({ error })
    }
})

router.post('/payment-update', auth, checkTransaction, (req, res) => {
    User.findOne({ refID: req.body.refID }, async (err, data) => {
        if (err)
            return res.status(400).send({ error })
        if (!data)
            return res.status(404).send({ status: "ERROR", errorCode: "customer-not-found" });
        if (data.dueAmount != req.body.transaction.amountPaid)
            return res.status(400).send({ status: "ERROR", errorCode: "amount-mismatch" });
        data.dueAmount = 0;
        await data.save();
        const transaction = new Transaction({
            TID: req.body.transaction.id,
            AckID: uniqid(),
            refID: data.refID
        })
        await transaction.save();
        console.log(data);
        res.send({
            "status": "SUCCESS",
            "data": {
                "ackID": transaction.AckID
            }
        });
    })
})

function auth(req, res, next) {
    if (req.headers["x-api-key"] != "123")
        return res.send({
            "status": "ERROR",
            "errorCode": "auth-error"
        })
    next();
}

function checkTransaction(req, res, next) {
    let refID_repeat = false
    console.log("transction started")
    Transaction.findOne({ refID: req.body.refID }, (err, data) => {
        console.log(data)
        if (data) {
            refID_repeat = true
        }
    })
    Transaction.findOne({ refID: req.body.refID, TID: req.body.transaction.id }, (err, data) => {
        if (data)
            return res.send({
                "status": "SUCCESS",
                "data": {
                    "ackID": data.AckID
                }
            })
        else {
            if (refID_repeat)
                return res.status(404).send({ status: "ERROR", errorCode: "invalid-ref-id" })
            next();
        }
    })
}
module.exports = router;