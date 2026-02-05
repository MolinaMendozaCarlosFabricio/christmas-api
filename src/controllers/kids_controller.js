import db from "../config/db.js";

/* CREATE (solo niños) */
const createUser = async (req, res) => {
  const { username, age, country, password } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO users(username, age, country, password, good_kid, is_santa)
       VALUES(?,?,?,?, true, false)`,
      [username, age, country, password]
    );

    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json(err);
  }
};

/* LOGIN (niño o Santa) */
const login = async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username=?",
    [username]
  );

  if (!rows.length)
    return res.status(404).json({ message: "User not found" });

  const user = rows[0];

  if (user.password != password)
    return res.status(401).json({ message: "Invalidad password" });

  res.json({
    user: user,
    role: user.is_santa ? "santa" : "kid"
  });
};

/* READ ALL (solo Santa) */
const getUsers = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM users WHERE is_santa = false");
  res.json({kids:rows});
};

/* READ ONE */
const getUser = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE id = ?",
    [req.params.id]
  );
  res.json({user:rows[0]});
};

/* UPDATE */
const updateUser = async (req, res) => {
  const { username, age, country, password } = req.body;

  await db.query(
    `UPDATE users SET username = ?, age = ?, country = ?, password = ? WHERE id = ?`,
    [username, age, country, password, req.params.id]
  );

  res.json({ message: "Updated" });
};

/* UPDATE */
const setGoodness = async (req, res) => {
  const [rows] = await db.query(
    "SELECT good_kid FROM users WHERE id = ?",
    [req.params.id]
  );

  await db.query(
    `UPDATE users SET good_kid = ? WHERE id=?`,
    [!rows[0].good_kid, req.params.id]
  );

  res.json({ message: "Goodness updated" });
};

/* DELETE */
const deleteUser = async (req, res) => {
  await db.query("DELETE FROM users WHERE id=?", [req.params.id]);
  res.json({ message: "Deleted" });
};

export const kids_controller = {
    createUser,
    login,
    getUsers,
    getUser,
    updateUser,
    setGoodness,
    deleteUser
}