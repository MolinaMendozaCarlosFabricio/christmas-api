import db from "../config/db.js"

/* CREATE wish (solo el dueño) */
const createWish = async (req, res) => {
  const { object } = req.body;

  await db.query(
    "INSERT INTO wishes(object, id_user) VALUES(?,?)",
    [object, req.user.id]
  );

  res.json({ message: "Wish added" });
};

/* READ wishes */
const getWishes = async (req, res) => {
  let query;
  let params = [];

  if (req.user.role === "santa") {
    query = `
      SELECT w.*, u.username
      FROM wishes w
      JOIN users u ON u.id = w.id_user
    `;
  } else {
    query = "SELECT * FROM wishes WHERE id_user = ?";
    params.push(req.user.id);
  }

  const [rows] = await db.query(query, params);
  res.json(rows);
};

/* UPDATE */
const updateWish = async (req, res) => {
  await db.query(
    "UPDATE wishes SET object=? WHERE id=? AND id_user=?",
    [req.body.object, req.params.id, req.user.id]
  );

  res.json({ message: "Updated" });
};

/* DELETE */
const deleteWish = async (req, res) => {
  await db.query(
    "DELETE FROM wishes WHERE id=? AND id_user=?",
    [req.params.id, req.user.id]
  );

  res.json({ message: "Deleted" });
};

export const wishes_controller = {
    createWish,
    getWishes,
    updateWish,
    deleteWish,
}