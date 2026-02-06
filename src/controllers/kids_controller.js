import db from "../config/db.js";

/* CREATE (solo niños) */
const createUser = async (req, res) => {
  console.log("👶 [REGISTER KID]", req.body);

  const { username, age, country, password } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO users(username, age, country, password, good_kid, is_santa)
       VALUES(?,?,?,?, true, false)`,
      [username, age, country, password]
    );

    console.log("✅ Kid created with id:", result.insertId);

    res.json({ id: result.insertId });
  } catch (err) {
    console.log("❌ ERROR createUser:", err);
    res.status(500).json(err);
  }
};


/* LOGIN */
const login = async (req, res) => {
  console.log("🔐 [LOGIN ATTEMPT]", req.body.username);

  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username=?",
      [username]
    );

    if (!rows.length) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    if (user.password != password) {
      console.log("❌ Wrong password");
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("✅ Login success:", user.id);

    res.json({
      user,
      role: user.is_santa ? "santa" : "kid"
    });

  } catch (err) {
    console.log("❌ ERROR login:", err);
    res.status(500).json(err);
  }
};


/* READ ALL (solo Santa) */
const getUsers = async (req, res) => {
  console.log("🎅 [GET ALL KIDS]");

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE is_santa = false"
    );

    console.log("✅ Kids count:", rows.length);

    res.json({ kids: rows });
  } catch (err) {
    console.log("❌ ERROR getUsers:", err);
    res.status(500).json(err);
  }
};


/* READ ONE */
const getUser = async (req, res) => {
  console.log("📖 [GET USER]", req.params.id);

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [req.params.id]
    );

    console.log("✅ User found:", rows[0]?.id);

    res.json({ user: rows[0] });
  } catch (err) {
    console.log("❌ ERROR getUser:", err);
    res.status(500).json(err);
  }
};


/* UPDATE */
const updateUser = async (req, res) => {
  console.log("✏️ [UPDATE USER]", {
    id: req.params.id,
    body: req.body
  });

  try {
    const { username, age, country, password } = req.body;

    await db.query(
      `UPDATE users SET username = ?, age = ?, country = ?, password = ? WHERE id = ?`,
      [username, age, country, password, req.params.id]
    );

    console.log("✅ User updated");

    res.json({ message: "Updated" });
  } catch (err) {
    console.log("❌ ERROR updateUser:", err);
    res.status(500).json(err);
  }
};


/* TOGGLE GOODNESS */
const setGoodness = async (req, res) => {
  console.log("⭐ [TOGGLE GOODNESS] user:", req.params.id);

  try {
    const [rows] = await db.query(
      "SELECT good_kid FROM users WHERE id = ?",
      [req.params.id]
    );

    const newValue = !rows[0].good_kid;

    await db.query(
      `UPDATE users SET good_kid = ? WHERE id=?`,
      [newValue, req.params.id]
    );

    console.log("✅ Goodness changed to:", newValue);

    res.json({ message: "Goodness updated" });
  } catch (err) {
    console.log("❌ ERROR setGoodness:", err);
    res.status(500).json(err);
  }
};


/* DELETE */
const deleteUser = async (req, res) => {
  console.log("🗑️ [DELETE USER]", req.params.id);

  try {
    await db.query("DELETE FROM users WHERE id=?", [req.params.id]);

    console.log("✅ User deleted");

    res.json({ message: "Deleted" });
  } catch (err) {
    console.log("❌ ERROR deleteUser:", err);
    res.status(500).json(err);
  }
};

export const kids_controller = {
  createUser,
  login,
  getUsers,
  getUser,
  updateUser,
  setGoodness,
  deleteUser
};