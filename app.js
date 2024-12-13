const express = require ('express');
const { handler } = require('./src/controller/handler');
const sequelize = require('./src/config/db');



const app = express ();



app.use(express.json());
app.use(express.urlencoded({ extended: true}));

sequelize.sync({ alter: true});




app.post("*", async (req, res) => { 
    
   res.send(await handler(req));
});




 

// const endpoint  = '/api/v1/';


module.exports = app;