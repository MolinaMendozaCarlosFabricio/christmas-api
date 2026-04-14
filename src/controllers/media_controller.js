import { s3 } from "../config/s3.js";
import db from "../config/db.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { notifyUser } from "../services/notification_service.js";


const uploadWishPhoto = async (req, res) => {

  try {

    const wishId = req.params.id;

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const filename = `${uuidv4()}-${req.file.originalname}`;

    const [existing] = await db.query(
      `
      SELECT im.*
      FROM wishes w
      LEFT JOIN image_metadata im ON im.id = w.id_photo
      WHERE w.id = ?
      `,
      [wishId]
    );

    // Si ya hay foto, eliminarla de S3
    if (existing.length && existing[0].filename) {

      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: existing[0].filename
      }));

      await db.query(
        `DELETE FROM image_metadata WHERE id = ?`,
        [existing[0].id]
      );

    }

    // Subir nueva imagen
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    const url = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${filename}`;

    const [result] = await db.query(
      `
      INSERT INTO image_metadata(filename, url)
      VALUES(?,?)
      `,
      [filename, url]
    );

    await db.query(
      `UPDATE wishes SET id_photo=? WHERE id=?`,
      [result.insertId, wishId]
    );

    res.json({
      message: "Photo uploaded / replaced",
      url
    });

  } catch (err) {

    console.log("❌ ERROR uploadWishPhoto:", err);
    res.status(500).json(err);

  }

};

const uploadAudioMessage = async (req, res) => {

  try {

    const childId = req.params.id;

    if (!req.file)
      return res.status(400).json({ message: "No audio uploaded" });

    const filename = `${uuidv4()}-${req.file.originalname}`;

    const [existing] = await db.query(
      `SELECT * FROM audio_metadata WHERE id_child = ?`,
      [childId]
    );

    // eliminar audio viejo si existe
    if (existing.length) {

      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: existing[0].filename
      }));

      await db.query(
        `DELETE FROM audio_metadata WHERE id_child = ?`,
        [childId]
      );

    }

    // subir nuevo audio
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    const url = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${filename}`;

    await db.query(
      `
      INSERT INTO audio_metadata(filename, url, id_child)
      VALUES(?,?,?)
      `,
      [filename, url, childId]
    );

    // Notificar a los padres
    const [userRows] = await db.query("SELECT username, family_code FROM users WHERE id = ?", [childId]);
    const { username, family_code } = userRows[0] || {};

    const [parents] = await db.query(
      `
        SELECT id
        FROM users
        WHERE family_code = ?
        AND role = "parent"
      `,
      [family_code]
    );

    for (const parent of parents) {
      await notifyUser(
        parent.id,
        "Mensaje de voz 🎤",
        `${username || childId} subió un nuevo audio`
      );
    }

    res.json({
      message: "Audio uploaded / replaced",
      url
    });

  } catch (err) {

    console.log("❌ ERROR uploadAudio:", err);
    res.status(500).json(err);

  }

};

const getWishPhoto = async (req, res) => {

  try {

    const wishId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT im.*
      FROM wishes w
      JOIN image_metadata im ON im.id = w.id_photo
      WHERE w.id = ?
      `,
      [wishId]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Photo not found" });

    res.json({
      photo: rows[0]
    });

  } catch (err) {

    console.log("❌ ERROR getWishPhoto:", err);
    res.status(500).json(err);

  }

};

const getAudio = async (req, res) => {

  try {

    const audioId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT *
      FROM audio_metadata
      WHERE id = ?
      `,
      [audioId]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Audio not found" });

    res.json({
      audio: rows[0]
    });

  } catch (err) {

    console.log("❌ ERROR getAudio:", err);
    res.status(500).json(err);

  }

};

export const media_controller = {
  uploadWishPhoto,
  uploadAudioMessage,
  getWishPhoto,
  getAudio,
};