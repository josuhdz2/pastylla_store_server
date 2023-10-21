const ruta=require('express').Router();
const multer=require('multer');
const ProductoModelo=require('../models/producto');
const UsuarioModelo=require('../models/usuarios');
const path=require('path');
const { verify } = require('crypto');
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
    ProductoModelo.find({estado:true})
    .then((prod)=>
    {
        if(Object.keys(prod).length!=0)
        {
            res.json({response:"success", lista:prod});
        }
        else
        {
            res.json({response:"failed", error:"No se encontraron productos registrados"});
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"Error interno en la base de datos"});
    })
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
});
ruta.get('/comentarios/:id', (req, res)=>
{
    UsuarioModelo.aggregate([
        {$unwind:{path:'$comentarios'}},
        {$match:{'comentarios.productoId':req.params.id}},
        {$project:{username:1, comentarios:1}}
    ])
    .then((comen)=>
    {
        console.log(comen);
        res.json({response:"success", comentarios:comen});
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"No se pudo realizar la consulta de comentarios"})
    })
});
ruta.post('/favoritos', (req, res)=>
{
    var listaIds=req.body.lista.split(",");
    ProductoModelo.find({_id:{$in:listaIds}})
    .then((prod)=>
    {
        if(Object.keys(prod).length!=0)
        {
            res.json({response:"success", lista:prod});
        }
        else
        {
            res.json({response:"failed", error:"No se encontraron los productos"})
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"error en la base de datos"});
    })
});
ruta.post('/prodCarritos', (req, res)=>
{
    var listaIds=req.body.lista.split(",");
    ProductoModelo.find({_id:{$in:listaIds}})
    .then((prod)=>
    {
        if(Object.keys(prod).length!=0)
        {
            res.json({response:"success", carrito:prod});
        }
        else
        {
            res.json({response:"failed", error:"No se encontraron los productos"})
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"error en la base de datos"});
    })
});
ruta.get('/infoProducto/:id', (req, res)=>
{
    ProductoModelo.findById(req.params.id)
    .then((prod)=>
    {
        console.log("info del prod", prod)
        if(prod)
        {
            res.json({response:"success", producto:prod})
        }
        else
        {
            res.json({response:"failed", error:"No se encontro el producto buscado"});
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"No se ha podido realizar la busqueda de productos"})
    })
});
ruta.post('/categoria', (req, res)=>
{
    ProductoModelo.find({tipo:req.body.categoria})
    .then((prod)=>
    {
        res.json({response:"success", lista:prod});
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"Ha ocurrido un error interno"});
    });
})
ruta.post('/buscar', (req, res)=>
{
    ProductoModelo.find({nombre:{$regex:req.body.busqueda}})
    .then((prod)=>
    {
        res.json({response:"success", lista:prod});
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"Ha ocurrido un error interno"});
    });
})
module.exports=ruta;