require("dotenv").config();
const axios = require("axios");

const TOKEN = process.env.BOT || "";
if (!TOKEN) {
  throw new Error("Telegram BOT token is missing. Please set it in the .env file.");
}

const BASEURL = `https://api.telegram.org/bot${TOKEN}`;

// Create a default Axios instance
const axiosInstance = axios.create({
  baseURL: BASEURL,
  timeout: 5000, // Set a timeout for requests
});

function getAxiosInstance() {
  return {
    async get(method, params) { 
      try {
        const response = await axiosInstance.get(`/${method}`, { params });
        return response.data;
      } catch (error) {
        console.error(`GET request failed: ${error.message}`);
        throw error;
      }
    },

    async post(method, data) {
      try {
        const response = await axiosInstance.post(`/${method}`, data);
        return response.data;
      } catch (error) {
        console.error(`POST request failed: ${error.message}`);
        throw error;
      }
    },
  };
}

module.exports = getAxiosInstance;
