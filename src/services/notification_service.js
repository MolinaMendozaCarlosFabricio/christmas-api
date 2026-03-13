import { messaging } from "../config/firebase.js";

export const sendNotification = async (token, title, body) => {

  const message = {
    token,
    notification: {
      title,
      body
    }
  };

  await messaging.send(message);

};