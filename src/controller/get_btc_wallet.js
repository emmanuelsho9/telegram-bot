const { default: axios } = require("axios");
require("dotenv").config();

const BASEURL = "https://api.nowpayments.io/v1/payment"
const PRICE = process.env.PRICE || 0;
const KEY = process.env.KEY || 0;

async function getPaymentWallet(id) {
    const data ={
        "price_amount": PRICE,
        "price_currency": "usd",
        "pay_currency": "btc",
        "ipn_callback_url": "https://nowpayments.io",
        "order_id": id,
        "order_description": "Apple Macbook Pro 2019 x 1"
      };
      const headers = {
        'x-api-key': KEY, // Replace with your actual API key
        'Content-Type': 'application/json' // Specify JSON content type
      };
    
      try {
        const response = await axios.post(BASEURL, data, { headers });
        // Handle successful response here
        return response
      } catch (error) {
        // Handle errors here
        console.error(error);
        return error

      }    
}


module.exports = getPaymentWallet