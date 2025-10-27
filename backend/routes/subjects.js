import express from "express";
import { getSubjects, addSubject } from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSubjects);
router.post("/", protect, addSubject);

export default router;
