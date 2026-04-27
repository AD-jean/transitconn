import path from 'path';
import { env } from "../config/env";
import fs from 'fs';
import multer from 'multer';
import { AppError } from './error.middleware';


const uploadDir = path.resolve(env.upload.dir);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir)
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`)
    },
});

const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,

) => {
    const allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = path.extname(file.originalname).slice(1).toLowerCase();

    if (!allowedExts.includes(ext)) {
        return cb(new AppError(`Format non autorise. Formats acceptes : ${allowedExts}`))
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
    fileSize: parseInt(process.env['MAX_FILE_SIZE_MB'] ?? '10') * 1024 * 1024,
    },
});
