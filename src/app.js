require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const path=require('path');
const productsRouter=require('./routes/products');
const adminRouter=require('./routes/admin');
const port=process.env.PORT||3000;
mongoose.set('strictQuery', false);
console.log(process.env.LOCAL_DATABASE_URL)
mongoose.connect(process.env.LOCAL_DATABASE_URL)
.then(()=>
{
    console.log('Database connected...');
})
.catch((err)=>
{
    console.log('Error with connecting database...\n'+err);
});
const app=express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.set('views','src/views/');
app.get('/', (req, res)=>
{
    res.send('Servicio en linea');
});
app.use('/productos', productsRouter);
app.use('/admin', adminRouter);
app.listen(port, ()=>
{
    console.log('Server running on port 3000');
});