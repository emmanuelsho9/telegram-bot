const getAxiosInstance = require("../config/tel_config");
const Subscription = require("../schema/user_sub");
const getPaymentWallet = require("./get_btc_wallet");
const PRICE = process.env.PRICE || 0;


const calculateEndDate = (startDate, daysToAdd) => {
  // Create a new Date object based on the start date
  const start = new Date(startDate);
  
  // Add the specified number of days
  start.setDate(start.getDate() + daysToAdd);
  
  // Return the new end date
  return start;
};


const calculateDaysLeft = (startDate, endDate) => {
  // Ensure startDate and endDate are valid Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the difference in milliseconds
  const differenceInMillis = end - start;

  // Convert milliseconds to days
  const daysLeft = Math.ceil(differenceInMillis / (1000 * 60 * 60 * 24));

  // If days left is negative, it means the subscription has expired
  return daysLeft > 0 ? daysLeft : 0;
};


async function sendMessage(messageOb) {
  const axiosInstance = getAxiosInstance();

  try {
    // Retrieve the subscription by ID
    const user = await Subscription.findByPk(messageOb.chat.id);

    if (!user) {
      console.log(`No subscription found for ID: ${messageOb.chat.id}`);
      return axiosInstance.post("sendMessage", {
        chat_id: messageOb.chat.id,
        text: `No active license found for this chat.`,
      });
    }

    // Calculate remaining days
    const daysLeft = calculateDaysLeft(user.startDate, user.endDate);

    // Update the subscription with the new `daysLeft`
    await Subscription.update(
      { daysLeft: daysLeft }, // Correctly wrapped field-value pair
      { where: { id: messageOb.chat.id } }
    );

    // Prepare message based on `daysLeft`
    const messageText =
      daysLeft === 0
        ? `You no longer have a license to use this software: ${daysLeft}`
        : `Your license remains ${daysLeft} days.`;

    // Send the message via Telegram API
    return axiosInstance.post("sendMessage", {
      chat_id: messageOb.chat.id,
      text: messageText,
    });
  } catch (error) {
    return axiosInstance.post("sendMessage", {
      chat_id: messageOb.chat.id,
      text: `An error occurred: ${error.message}`,
    });
  }
}
async function startSubscription(messageOb) {
  try {
    // Check if a subscription already exists for the given chat ID
    const user = await Subscription.findByPk(messageOb.chat.id);
    if (user) {
      return; // Exit if the user already has a subscription
    }

    // Prepare subscription details
    const id = messageOb.chat.id;
    const price = PRICE;
    const daysLeft = 15;
    const startDate = new Date(); // Current date
    const endDate = calculateEndDate(startDate, daysLeft); // Calculate the end date based on days left

    // Create a new subscription record
    await Subscription.create({
      id,
      price,
      daysLeft,
      startDate,
      endDate,
    });

  } catch (error) {
    console.error("Error in startSubscription:", error.message);
  }
}




async function handleLicense(messageOb) {
  const axiosInstance = getAxiosInstance();

  try {
    // Retrieve the subscription by ID
    const user = await Subscription.findByPk(messageOb.chat.id);

    if (!user) {
      return axiosInstance.post("sendMessage", {
        chat_id: messageOb.chat.id,
        text: `No active license found for this chat.`,
      });
    }

   
    

    // Calculate remaining days
    const daysLeft = calculateDaysLeft(user.startDate, user.endDate);

    // Update the subscription with the new `daysLeft`
    await Subscription.update(
      { daysLeft: daysLeft }, // Correctly wrapped field-value pair
      { where: { id: messageOb.chat.id } }
    );

    // Prepare message based on `daysLeft`
    const messageText =
      daysLeft === 0
        ? `You no longer have a license to use this software: ${daysLeft}`
        : `Your license remains ${daysLeft} days.`;

        if(daysLeft===0){
          return axiosInstance.post("sendMessage", {
            chat_id: messageOb.chat.id,
            text: `You no longer have active license kindly /renew`,
          });
        }

    // Send the message via Telegram API
    return axiosInstance.post("sendMessage", {
      chat_id: messageOb.chat.id,
      text: messageText,
    });
  } catch (error) {
    return axiosInstance.post("sendMessage", {
      chat_id: messageOb.chat.id,
      text: `An error occurred: ${error.message}`,
    });
  }

}


async function handRenewal(messageOb) {
  const axiosInstance = getAxiosInstance();

  try {
    // Retrieve the subscription by ID
    const user = await Subscription.findByPk(messageOb.chat.id);

    if (!user) {
      return axiosInstance.post("sendMessage", {
        chat_id: messageOb.chat.id,
        text: `No active license found for this chat.`,
      });
    }

    // Calculate remaining days
    const daysLeft = calculateDaysLeft(user.startDate, user.endDate);

    // Update the subscription with the new `daysLeft`
    await Subscription.update({ daysLeft }, { where: { id: messageOb.chat.id } });

    // If the license has expired, provide payment details
    if (daysLeft === 0) {
      const payment = await getPaymentWallet(messageOb.chat.id); // Assume this fetches payment info
      const userPaymentData = payment.data;
      

      // Structure payment data
      const subData = `
Payment Details:
- Amount: ${userPaymentData.price_amount}
- Pay Address: ${userPaymentData.pay_address}
- Currency: ${userPaymentData.pay_currency}

Note: Your payment information expires in 30 minutes.`;

      return axiosInstance.post("sendMessage", {
        chat_id: messageOb.chat.id,
        text: subData,
      });
    }

    // If the license is still active, send the remaining days
    const messageText = `Your license remains active for ${daysLeft} days.`;
    return axiosInstance.post("sendMessage", {
      chat_id: messageOb.chat.id,
      text: messageText,
    });

  } catch (error) {
    console.error("Error in handRenewal:", error.message);

    return axiosInstance.post("sendMessage", {
      chat_id: messageOb.chat.id,
      text: `An error occurred while processing your renewal: ${error.message}`,
    });
  }
}

function handleMessage(messageOb) {
  const messageText = messageOb.text || "";

  if (messageText.charAt(0) === "/") {
    const command = messageText.substr(1); // Extract command without '/'
    switch (command) {
      case "start":
        // Perform actions for the /start command
        return startSubscription(messageOb);
      
      case "license":
        // Perform actions for the /license command
        return handleLicense(messageOb);

      case "renew":
          // Perform actions for the /license command
        return handRenewal(messageOb);

      default:
        // Handle unknown commands
        return sendMessage(messageOb);
    }
  } else {
    // Echo the received message back to the user
    return sendMessage(messageOb, `You said: ${messageText}`);
  }
}

module.exports = {
  handleMessage,
};
