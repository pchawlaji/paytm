const express = require("express");
const PORT = 3001;
const rootRouter = require("./routes/index");
var cors = require('cors')
const app = express();

app.use(cors());

// Add body parser
app.use(express.json());

app.use("/api/v1", rootRouter);


app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
};

// Add the error handler middleware at the end of your middleware stack
app.use(errorHandler);
