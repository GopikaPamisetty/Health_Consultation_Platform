import multer from 'multer';

const storage = multer.memoryStorage(); // or use diskStorage
const upload = multer({ storage });

export default upload;
