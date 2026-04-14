import db from "../config/db.js";

const getNotifications = async (req, res) => {
  console.log("🔔 [GET NOTIFICATIONS] user:", req.user.id);

  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE id_user = ? ORDER BY id DESC",
      [req.user.id]
    );

    res.json({ notifications: rows });
  } catch (err) {
    console.log("❌ ERROR getNotifications:", err);
    res.status(500).json(err);
  }
};

export const notifications_controller = {
  getNotifications,
};
