const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let body, validationResult;
try {
    const ev = require('express-validator');
    body = ev.body;
    validationResult = ev.validationResult;
} catch (e) {
    body = null;
    validationResult = null;
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, uniqueSuffix + '-' + cleanName);
    }
});

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /\.(jpeg|jpg|png|gif|webp)$/i;
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/pjpeg', 'image/x-png'];

        const extMatches = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeMatches = allowedMimes.includes(file.mimetype.toLowerCase());

        if (extMatches && mimeMatches) {
            return cb(null, true);
        }
        cb(new Error(`Invalid file type for '${file.fieldname}'. Only JPG, JPEG, PNG, GIF, and WEBP images are allowed.`));
    }
});

const uploadFields = upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'otherPics', maxCount: 5 }
]);

const registrationValidations = body ? [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword')
        .notEmpty().withMessage('Confirm Password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    body('gender')
        .notEmpty().withMessage('Gender is required'),
    body('hobbies')
        .notEmpty().withMessage('At least one hobby must be selected')
] : [];

app.get('/', (req, res) => {
    res.render('register', { error: {}, formData: {} });
});

app.post('/register', (req, res) => {
    uploadFields(req, res, async (uploadErr) => {
        const errors = {};

        if (uploadErr) {
            if (uploadErr instanceof multer.MulterError) {
                if (uploadErr.code === 'LIMIT_FILE_SIZE') {
                    errors.general = 'One or more files exceed the maximum allowed size of 5MB.';
                } else if (uploadErr.code === 'LIMIT_UNEXPECTED_FILE') {
                    errors.otherPics = 'Too many files uploaded (maximum 5 pictures allowed).';
                } else {
                    errors.general = `Upload error: ${uploadErr.message}`;
                }
            } else {
                errors.general = uploadErr.message;
            }
        }

        if (body && validationResult && registrationValidations.length > 0) {
            for (const validation of registrationValidations) {
                await validation.run(req);
            }
            const validationResults = validationResult(req);
            if (!validationResults.isEmpty()) {
                validationResults.array().forEach(err => {
                    const field = err.path || err.param;
                    if (!errors[field]) {
                        errors[field] = err.msg;
                    }
                });
            }
        } else {
            const { username, email, password, confirmPassword, gender, hobbies } = req.body;
            if (!username || username.trim() === '') {
                errors.username = 'Username is required';
            } else if (username.trim().length < 3) {
                errors.username = 'Username must be at least 3 characters long';
            }

            if (!email || email.trim() === '') {
                errors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.email = 'Please enter a valid email address';
            }

            if (!password || password === '') {
                errors.password = 'Password is required';
            } else if (password.length < 6) {
                errors.password = 'Password must be at least 6 characters long';
            }

            if (!confirmPassword || confirmPassword === '') {
                errors.confirmPassword = 'Confirm Password is required';
            } else if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }

            if (!gender) {
                errors.gender = 'Gender is required';
            }

            if (!hobbies) {
                errors.hobbies = 'At least one hobby must be selected';
            }
        }

        const hasProfilePicture = req.files && req.files.profilePicture && req.files.profilePicture.length > 0;
        if (!hasProfilePicture && !errors.profilePicture && !errors.general) {
            errors.profilePicture = 'Profile picture is required';
        }

        const hasOtherPics = req.files && req.files.otherPics && req.files.otherPics.length > 0;
        if (!hasOtherPics && !errors.otherPics && !errors.general) {
            errors.otherPics = 'At least one other picture is required';
        }

        if (Object.keys(errors).length > 0) {
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    if (file && file.path && fs.existsSync(file.path)) {
                        try { fs.unlinkSync(file.path); } catch (e) {}
                    }
                });
            }

            return res.status(400).render('register', {
                error: errors,
                formData: req.body
            });
        }

        const profilePic = req.files.profilePicture[0];
        const otherPics = req.files.otherPics;

        res.render('result', {
            username: req.body.username,
            email: req.body.email,
            gender: req.body.gender,
            hobbies: req.body.hobbies,
            profilePic: profilePic,
            otherPics: otherPics
        });
    });
});

app.get('/download/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('<h3>404: File Not Found</h3><p>The requested file does not exist or has been removed.</p><a href="/">Return to Registration</a>');
    }

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('File download error:', err);
            if (!res.headersSent) {
                res.status(500).send('Error occurred while downloading file.');
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});