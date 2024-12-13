const app = require('./app');

const http = require("http").createServer(app);


require("dotenv").config(); 
const PORT = process.env.PORT || 4000;
http.listen(PORT,()=>{
    console.log(`running on port ${PORT}`); 
    
})
