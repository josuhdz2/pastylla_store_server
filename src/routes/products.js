const ruta=require('express').Router();
const multer=require('multer');
const { v4: uuidv4 } = require('uuid');
const {initializeApp, cert}=require('firebase-admin/app');
const {getStorage}=require('firebase-admin/storage');
const ProductoModelo=require('../models/producto');
const UsuarioModelo=require('../models/usuarios');
const path=require('path');
//const firebaseConfig=require(process.env.FIRESTORE_ACCOUNT);
const firebaseConfig=JSON.parse(process.env.FIRESTORE_OBJECT);
initializeApp({
    credential:cert(firebaseConfig),
    storageBucket:"pastyllastorestorage.appspot.com"
});
const storage=multer.memoryStorage();
/*const storage=multer.diskStorage({
    destination: function(req, file, cb)
    {
        cb(null, 'src/public/images/')
    },
    filename: function(req, file, cb)
    {//nombre del input, fecha, codigo random+formato del doc
        const uniqueSuffix = file.fieldname + '-' + Date.now() + '-' + (Math.round(Math.random() * 1E9) + path.extname(file.originalname))
        cb(null, uniqueSuffix)
    }
})*/
//const upload =multer({storage:storage})   //anterior sentencia
const upload=multer({storage:storage}).array('imagenes', 10);

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
ruta.post('/actualizar/:id', (req, res)=>
{
    console.log(req.body)
    ProductoModelo.findByIdAndUpdate(req.params.id, {$set:req.body})
    .then((prod)=>
    {
        res.redirect('/admin/listaProductos');
    })
    .catch((err)=>
    {
        console.log(err);
        res.status(400).send("Ha ocurrido un error.");
    });
});
ruta.post('/agregarImagenes/:id', (req, res)=>
{
    upload(req, res, (err)=>
    {
        if(err)
        {
            return res.status(400).send("Error al enviar imagenes");
        }
        if(!req.files || req.files.length===0)
        {
            return res.status(400).send("No se agregaro imagenes");
        }
        const bucket=getStorage().bucket();
        const imagenesPromise=[];
        req.files.forEach((file, index)=>
        {
            const nombreImagen=`imagen${uuidv4()}.png`;
            const blob=bucket.file(nombreImagen);
            const buffer=file.buffer;
            const blobStream=blob.createWriteStream();
            imagenesPromise.push(
                new Promise((resolve, reject)=>
                {
                    blobStream.on("error", (err)=>
                    {
                        reject(err);
                    });
                    blobStream.on("finish", ()=>
                    {
                        resolve(nombreImagen);
                        //url de acceso: https://firebasestorage.googleapis.com/v0/b/pastyllastorestorage.appspot.com/o/imagen62530ab0-4ac7-4ece-938e-4b9fee470163.png?alt=media
                    });
                    blobStream.end(buffer);
                })
            )
        });
        Promise.all(imagenesPromise)
        .then((nombres)=>
        {
            console.log(nombres)
            ProductoModelo.findByIdAndUpdate(req.params.id, {$addToSet:{imagenes:{$each:nombres}}})
            .then((prod)=>
            {
                res.redirect('/admin/listaProductos')
            })
            .catch((err)=>
            {
                console.log(err);
                res.status(400).send("Error al guardar las imagenes");
            });
        })
    })
})
ruta.post('/registroProducto', (req, res)=>//nueva ruta
{
    upload(req, res, (err)=>
    {
        if(err)
        {
            return res.status(400).send("Error al enviar imagenes");
        }
        if(!req.files || req.files.length===0)
        {
            return res.status(400).send("No se agregaron imagenes");
        }
        const bucket=getStorage().bucket();
        const imagenesPromise=[];
        req.files.forEach((file, index)=>
        {
            const nombreImagen=`imagen${uuidv4()}.png`;
            const blob=bucket.file(nombreImagen);
            const buffer=file.buffer;
            const blobStream=blob.createWriteStream();
            imagenesPromise.push(
                new Promise((resolve, reject)=>
                {
                    blobStream.on("error", (err)=>
                    {
                        reject(err);
                    });
                    blobStream.on("finish", ()=>
                    {
                        resolve(nombreImagen);
                        //url de acceso: https://firebasestorage.googleapis.com/v0/b/pastyllastorestorage.appspot.com/o/imagen62530ab0-4ac7-4ece-938e-4b9fee470163.png?alt=media
                    });
                    blobStream.end(buffer);
                })
            )
        });
        Promise.all(imagenesPromise)
        .then((nombres)=>
        {
            req.body.imagenes=nombres;
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
        .catch(()=>
        {
            res.status(400).send("error al procesar imagenes")
        })
    })
});
ruta.get('/eliminarProducto/:id', (req, res)=>
{
    ProductoModelo.findByIdAndDelete(req.params.id)
    .then(async (prod)=>
    {
        console.log(prod)
        try
        {
            const bucket=getStorage().bucket();
            for(const idImagen of prod.imagenes)
            {
                const file=bucket.file(idImagen);
                await file.delete();
            }
            res.status(200).send();
        }
        catch(err)
        {
            console.log(err)
            res.status(400).send();
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.status(400).send();
    })
})
ruta.get('/eliminarImagen/:id', (req, res)=>
{
    console.log("se esta eliminando")
    const bucket=getStorage().bucket();
    ProductoModelo.findOneAndUpdate({imagenes:req.params.id}, {$pull:{imagenes:req.params.id}})
    .then((prod)=>
    {
        console.log(prod)
        const blob=bucket.file(req.params.id);
        blob.delete()
        .then((ok)=>
        {
            console.log("se elimino correctamente");
            res.status(200).send();
        })
        .catch((err)=>
        {
            console.log("no se pudo eliminar")
            console.log(err)
            res.status(400).send();
        });
    })
    .catch((err)=>
    {
        console.log("error en la base de datos")
        console.error(err)
        res.status(400);
    })
})
/*ruta.post('/registroProducto', upload.array('imagenes', 10), (req, res)=>
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
});*/
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