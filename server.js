const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the Angular build directory
app.use(express.static(path.join(__dirname, `dist/campaign-manager/${process.env.NODE_ENV}`)));

// Serve the index.html file for any other requests (for Angular's routing)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, `dist/campaign-manager/${process.env.NODE_ENV}`, 'index.html'));
});

// Set the port to serve the application
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});