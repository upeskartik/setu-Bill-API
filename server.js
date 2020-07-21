require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors')
const app = express();
app.use(cors())
const fetchBill = require('./routes/fetch-bill');

app.use(express.json())

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log('connected to DB')
        app.listen(PORT, () => console.log(`server running at ${PORT}`))
    })
    .catch(err => console.log(err))

app.use('/api/v1/', fetchBill);