const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());

// ✅ Serve the frontend HTML files from /public folder
app.use(express.static(path.join(__dirname, '../public')));

const upload = multer({ dest: 'uploads/' });

app.post('/api/clone-tts', upload.single('voice'), async (req, res) => {
  const { text } = req.body;
  const voicePath = req.file.path;
  const voiceData = fs.readFileSync(voicePath);
  const base64Audio = voiceData.toString('base64');

  try {
    const response = await axios.post('https://api.minimax.io/v2/text-to-audio', {
      text,
      reference_audio: base64Audio
    }, {
      headers: {
        Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    res.set('Content-Type', 'audio/wav');
    res.send(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Voice cloning failed');
  } finally {
    fs.unlinkSync(voicePath); // delete uploaded file
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
