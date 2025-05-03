import express from 'express';
import cors from 'cors'
import auth from './Routes/auth.js'; 
import connectDB from './Utils/connectDB.js';
import router from './Routes/router.js'
import dotenv from 'dotenv'


const app = express();

dotenv.config()
connectDB()

app.use(cors())

app.use(express.json());

app.get('/', (req, res)=>{
    res.send("Hello World")
})
app.use('/', auth);
app.use('/user', router)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
