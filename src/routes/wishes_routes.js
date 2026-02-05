import { Router } from "express";
import { wishes_controller } from "../controllers/wishes_controller.js";
import { middleware } from "../middlewares/auth_middleware.js"
const wishes_router = Router();

wishes_router.use(middleware.auth);

wishes_router.post("/", wishes_controller.createWish);
wishes_router.get("/", wishes_controller.getWishes);
wishes_router.put("/:id", wishes_controller.updateWish);
wishes_router.delete("/:id", wishes_controller.deleteWish);

export default wishes_router;