const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const upload = multer();
const app = express();


const port = 3000;

const pool = new Pool({ 
    host: 'localhost',
    port: 5432,
    user: 'root',
    password: 'secret',
    database: 'fichiers'

})



app.use(express.json({ limit: '50mb' }));

app.get('/api/fichiers', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nom, content, date_ajout FROM fichiers ORDER BY date_ajout DESC')
        const files = result.rows.map(row => ({
            id: row.id,
            name: row.nom,
            content: row.content,
            createdAt: row.date_ajout
        }))
        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post('/api/fichiers/upload', upload.array('files'), async (req, res) => {
    try {
        // If multipart/form-data with files
        if (req.files && req.files.length > 0) {
            const inserted = []
            for (const f of req.files) {
                const nom = f.originalname
                const content = f.buffer.toString('utf8')
                const result = await pool.query('INSERT INTO fichiers (nom, content) VALUES ($1, $2) RETURNING id, nom, content, date_ajout', [nom, content])
                const row = result.rows[0]
                inserted.push({ id: row.id, name: row.nom, createdAt: row.date_ajout })
            }
            return res.status(201).json({ files: inserted })
        }

        // Fallback: accept JSON body with `nom` and `content` fields
        const { nom, content } = req.body
        if (nom && content) {
            const result = await pool.query('INSERT INTO fichiers (nom, content) VALUES ($1, $2) RETURNING id, nom, contenu, date_ajout', [nom, contenu])
            const row = result.rows[0]
            return res.status(201).json({ id: row.id, name: row.nom, createdAt: row.date_ajout })
        }

        res.status(400).json({ error: 'No files or content provided' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


app.listen(port, () =>{
    console.log(`server is running on port ${port}`)
})