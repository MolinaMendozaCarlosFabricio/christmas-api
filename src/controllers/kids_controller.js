import db from "../config/db.js";

// Comentario 2

/* CREATE (solo niños) */
const createUser = async (req, res) => {
  console.log("👶 [REGISTER KID]", req.body);

  let { username, age, country, password, role, family_code } = req.body;

  try {
    if (role == "parent"){
      family_code = Math.random().toString(36).substring(2,8).toUpperCase();
    }

    const [result] = await db.query(
      `INSERT INTO users(username, age, country, password, role, family_code)
       VALUES(?,?,?,?,?,?)`,
      [username, age, country, password, role, family_code]
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
    password.trim()

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
    });

  } catch (err) {
    console.log("❌ ERROR login:", err);
    res.status(500).json(err);
  }
};


/* READ MY CHILDS (Padres) */
const getUsers = async (req, res) => {
  console.log("🎅 [GET ALL KIDS]");

  try {
    const code = req.params.code
    const [rows] = await db.query(
      `
      SELECT 
        u.*,
        a.url AS audio_url
      FROM users u
      LEFT JOIN audio_metadata a 
        ON a.id_child = u.id
      WHERE u.family_code = ?
      AND u.role = "child"
      AND a.id = (
        SELECT MAX(id)
        FROM audio_metadata
        WHERE id_child = u.id
      )
      `,
        [code]
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

const bindFamiliy = async (req, res) => {
  console.log("[CREATE ARE_FAMILY] ", {
    body: req.body
  });

  try {
    const { id_parent, id_child } = req.body;

    await db.query(
      "INSERT INTO are_family (id_parent, id_child) VALUES (?,?)",
      [id_parent, id_child]
    )

    console.log(`Family binded for ${id_parent} and ${id_child}`);

    res.status(201).json({ message: `Family binded for ${id_parent} and ${id_child}` });
  } catch(err) {
    console.log("Error: ", err);
    res.status(500).json(err);
  }
}

const getFamilyDashboard = async (req, res) => {

  console.log("👨‍👩‍👧 [FAMILY DASHBOARD]");

  try {

    const code = req.params.code;

    const [rows] = await db.query(
      `
      SELECT
        u.id AS kid_id,
        u.username,
        a.url AS audio_url,
        w.id AS wish_id,
        w.object,
        w.state,
        im.url AS photo_url
      FROM users u
      LEFT JOIN audio_metadata a
        ON a.id_child = u.id
      LEFT JOIN wishes w
        ON w.id_user = u.id
      LEFT JOIN image_metadata im
        ON im.id = w.id_photo
      WHERE u.family_code = ?
      AND u.role = "child"
      ORDER BY u.id, w.id
      `,
      [code]
    );

    const kidsMap = {};

    for (const row of rows) {

      if (!kidsMap[row.kid_id]) {

        kidsMap[row.kid_id] = {
          id: row.kid_id,
          username: row.username,
          audio_url: row.audio_url,
          wishes: []
        };

      }

      if (row.wish_id) {

        kidsMap[row.kid_id].wishes.push({
          id: row.wish_id,
          object: row.object,
          state: row.state,
          photo_url: row.photo_url
        });

      }

    }

    const kids = Object.values(kidsMap);

    console.log("✅ Kids:", kids.length);

    res.json({
      family_code: code,
      kids
    });

  } catch (err) {

    console.log("❌ ERROR getFamilyDashboard:", err);
    res.status(500).json(err);

  }

};

export const kids_controller = {
  createUser,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  bindFamiliy,
  getFamilyDashboard
};