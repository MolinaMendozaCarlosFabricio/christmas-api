import { Router } from "express";
import { wishes_controller } from "../controllers/wishes_controller.js";
import { media_controller } from "../controllers/media_controller.js";
import { middleware } from "../middlewares/auth_middleware.js"
import upload from "../middlewares/upload_middleware.js";
const wishes_router = Router();

wishes_router.use(middleware.auth);

wishes_router.post("/", wishes_controller.createWish);
wishes_router.post("/:id/photo", upload.single("photo"), media_controller.uploadWishPhoto)
wishes_router.get("/:code", wishes_controller.getWishes);
wishes_router.put("/:id", wishes_controller.updateWish);
wishes_router.patch("/state/:id", wishes_controller.setWishStatus);
wishes_router.delete("/:id", wishes_controller.deleteWish);

export default wishes_router;