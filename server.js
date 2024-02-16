const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = new sqlite3.Database('mydatabase.db');

app.post('/upload', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }
    const file = req.file;
    const buffer = file.buffer;
    const filename = file.originalname;

    db.run('INSERT INTO AudioFiles (filename, audio_data) VALUES (?, ?)', [filename, buffer], function(err) {
        if (err) {
            res.status(500).send('Error saving to database');
            return console.error(err.message);
        }
        console.log(`A new file has been added with ID ${this.lastID}`);
        res.send('File uploaded successfully.');
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
