import { messaging } from "../config/fcm.js";
import db from "../config/db.js";

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

export const notifyUser = async (userId, title, body) => {
  try {
    // 1. Guardar en la base de datos
    await db.query(
      "INSERT INTO notifications (title, body, id_user) VALUES (?, ?, ?)",
      [title, body, userId]
    );

    // 2. Buscar el token FCM del usuario
    const [rows] = await db.query(
      "SELECT fcm_token FROM users WHERE id = ?",
      [userId]
    );

    const token = rows[0]?.fcm_token;

    // 3. Enviar via FCM si el usuario tiene token
    if (token) {
      await sendNotification(token, title, body);
    }

  } catch (err) {
    console.log("❌ ERROR notifyUser:", err);
    throw err;
  }
};