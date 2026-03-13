import { Router } from "express";
import { kids_controller } from "../controllers/kids_controller.js";
import { media_controller } from "../controllers/media_controller.js";
import { middleware } from "../middlewares/auth_middleware.js";
import upload from "../middlewares/upload_middleware.js";

const kids_router = Router()

kids_router.post("/", kids_controller.createUser);
kids_router.post("/login", kids_controller.login);
kids_router.post("/:id/audio", middleware.auth, upload.single("audio"), media_controller.uploadAudioMessage);
kids_router.get("/family/:code/dashboard", middleware.auth, middleware.onlySanta, kids_controller.getFamilyDashboard);
kids_router.get("/:id", middleware.auth, kids_controller.getUser);
kids_router.put("/:id", middleware.auth, kids_controller.updateUser);
kids_router.patch("/", middleware.auth, kids_controller.saveFcmToken);
kids_router.delete("/:id", middleware.auth, kids_controller.deleteUser);

export default kids_router;