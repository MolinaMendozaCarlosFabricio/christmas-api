import { Router } from "express";
import { notifications_controller } from "../controllers/notifications_controller.js";
import { middleware } from "../middlewares/auth_middleware.js";

const notifications_router = Router();

notifications_router.get("/", middleware.auth, notifications_controller.getNotifications);

export default notifications_router;
