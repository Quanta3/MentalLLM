// server.js
import express from 'express';
import auth from './Routes/auth.js'; // Include the .js extension

const app = express();

app.use(express.json());

app.get('/', (req, res)=>{
    res.send("Hello World")
})
app.use('/', auth);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
