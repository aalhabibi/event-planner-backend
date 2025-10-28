import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validateRegister } from "../middleware/validation.js";
import { validateLogin } from "../middleware/validation.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

export default router;
