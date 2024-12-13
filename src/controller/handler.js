const { handleMessage } = require("./telegram");

async function  handler(req)  {
const {body}= req;    
if(body){
    const messageOb = body.message;
    await handleMessage(messageOb);
}
return;
}

module.exports = {handler}