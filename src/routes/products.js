const ruta=require('express').Router();
const multer=require('multer');
const ProductoModelo=require('../models/producto')
const path=require('path');
const storage=multer.diskStorage({
    destination: function(req, file, cb)
    {
        cb(null, 'src/public/images/')
    },
    filename: function(req, file, cb)
    {//nombre del input, fecha, codigo random+formato del doc
        const uniqueSuffix = file.fieldname + '-' + Date.now() + '-' + (Math.round(Math.random() * 1E9) + path.extname(file.originalname))
        cb(null, uniqueSuffix)
    }
})
const upload =multer({storage:storage})
ruta.get('/', (req, res)=>
{
    res.send('Servicio en linea')
});
ruta.get('/vistaGeneral', (req, res)=>
{
    res.send('Se envian todos los recursos para la vista principal de la aplicacion')
});
ruta.post('/registroProducto', upload.array('imagenes', 10), (req, res)=>
{
    req.body.imagenes=req.files.map(objeto=>objeto.filename);
    console.log(req.body)
    ProductoModelo.create(req.body)
    .then((data)=>
    {
        console.log('success');
        res.redirect('/admin/adminpage')
    })
    .catch((err)=>
    {
        console.log(err);
        res.send("Error en la base de datos");
    });
})
module.exports=ruta;