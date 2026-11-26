const express = require('express');
const path = require('path');

const app = express();
const port = 1234;

// Serve static files from the "dist" folder
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve the "index.html" file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
