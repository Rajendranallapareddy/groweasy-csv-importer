import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/', upload.single('file'), uploadController.uploadCSV);

export default router;