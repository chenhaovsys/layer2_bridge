import express from 'express';
import bodyParser from 'body-parser';
import { runBridgeAction } from './main.js'; // Import the function to run bridge actions

const app = express();
app.use(bodyParser.json());

app.post('/bridge', async (req, res) => {
  const { mode } = req.body;

  try {
    const result = await runBridgeAction(req.body);
    res.json(result);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Bridge API running at http://localhost:${PORT}`);
});
