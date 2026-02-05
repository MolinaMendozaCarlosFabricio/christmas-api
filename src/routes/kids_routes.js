import { Router } from "express";
import { kids_controller } from "../controllers/kids_controller.js";
import { middleware } from "../middlewares/auth_middleware.js";

const kids_router = Router()

kids_router.post("/", kids_controller.createUser);
kids_router.post("/login", kids_controller.login);
kids_router.get("/", middleware.auth, middleware.onlySanta, kids_controller.getUsers);
kids_router.get("/:id", middleware.auth, kids_controller.getUser);
kids_router.put("/:id", middleware.auth, kids_controller.updateUser);
kids_router.patch("/goodness/:id", middleware.auth, middleware.onlySanta, kids_controller.setGoodness);
kids_router.delete("/:id", middleware.auth, middleware.onlySanta, kids_controller.deleteUser);

export default kids_router;