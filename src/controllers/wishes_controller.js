import db from "../config/db.js";

// Comentario 1

/* CREATE wish (solo el dueño) */
const createWish = async (req, res) => {
  console.log("🎯 [CREATE WISH] user:", req.user);

  try {
    const { thing } = req.body;
    console.log("Body:", req.body);

    await db.query(
      "INSERT INTO wishes(object, id_user) VALUES(?,?)",
      [thing, req.user.id]
    );

    console.log("✅ Wish inserted for user:", req.user.id);

    res.json({ message: "Wish added" });
  } catch (err) {
    console.log("❌ ERROR createWish:", err);
    res.status(500).json(err);
  }
};


/* READ wishes */
const getWishes = async (req, res) => {
  console.log("📖 [GET WISHES] user:", req.user);

  try {
    let query;
    let params = [];

    if (req.user.role === "parent") {
      console.log("🎅 Santa requesting ALL wishes");

      query = `
        SELECT 
          w.*,
          u.username,
          im.url AS photo_url
        FROM wishes w
        JOIN users u ON u.id = w.id_user
        LEFT JOIN image_metadata im 
          ON im.id = w.id_photo
        WHERE u.family_code = ?
      `;

      params.push(req.params.code);
    } else {
      console.log("👦 Kid requesting own wishes");

      query = `
        SELECT 
          w.*,
          im.url AS photo_url
        FROM wishes w
        LEFT JOIN image_metadata im 
          ON im.id = w.id_photo
        WHERE w.id_user = ?
      `;
      params.push(req.user.id);
    }

    const [rows] = await db.query(query, params);

    console.log("✅ Wishes found:", rows.length);

    res.json({ wishes: rows });
  } catch (err) {
    console.log("❌ ERROR getWishes:", err);
    res.status(500).json(err);
  }
};


/* UPDATE */
const updateWish = async (req, res) => {
  console.log("✏️ [UPDATE WISH]", {
    user: req.user,
    wishId: req.params.id,
    body: req.body
  });

  try {
    await db.query(
      "UPDATE wishes SET object=? WHERE id=? AND id_user=?",
      [req.body.thing, req.params.id, req.user.id]
    );

    console.log("✅ Wish updated");

    res.json({ message: "Updated" });
  } catch (err) {
    console.log("❌ ERROR updateWish:", err);
    res.status(500).json(err);
  }
};

const setWishStatus = async (req, res) => {
  console.log("[SET STATUS", {
    user: req.user,
    wishId: req.params.id,
    body: req.body
  });

  try {
    const { state } = req.body
    await db.query(
      "UPDATE wishes SET state = ? WHERE id = ? AND id_user = ?",
      [state, req.params.id, req.user.id]
    );

    console.log("Wish state updated");

    res.json({ message: "State updated" });
  } catch(err) {
    console.log("❌ ERROR updateWishState:", err);
    res.status(500).json(err);
  }
}

/* DELETE */
const deleteWish = async (req, res) => {
  console.log("🗑️ [DELETE WISH]", {
    user: req.user,
    wishId: req.params.id
  });

  try {
    await db.query(
      "DELETE FROM wishes WHERE id=? AND id_user=?",
      [req.params.id, req.user.id]
    );

    console.log("✅ Wish deleted");

    res.json({ message: "Deleted" });
  } catch (err) {
    console.log("❌ ERROR deleteWish:", err);
    res.status(500).json(err);
  }
};


export const wishes_controller = {
  createWish,
  getWishes,
  updateWish,
  setWishStatus,
  deleteWish,
};
