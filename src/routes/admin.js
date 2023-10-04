const ruta=require('express').Router();
const ProductModel=require('../models/producto');
ruta.get('/', (req, res)=>
{
    res.render('login')
});
ruta.get('/adminpage', (req, res)=>
{
    res.render('admin');
});
ruta.get('/listaProductos', (req, res)=>
{
    ProductModel.find()
    .then((productos)=>
    {
        if(Object.keys(productos).length!=0)
        {
            res.render('listaProductos', {prodList:productos});
        }
        else
        {
            res.send('No hay productos registrados.');
        }
    })
    .catch((err)=>
    {
        res.send('Ha ocurrido un error con la obtencion de productos')
    });
});
ruta.get('/producto/:id', (req, res)=>
{
    ProductModel.findById(req.params.id)
    .then((producto)=>
    {
        if(producto)
        {
            res.render('infoProducto', {prod:producto});
        }
        else
        {
            res.send('No se encontro el producto requerido');
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.send('Ha ocurrido un error al consultar el producto especifico')
    })
})
ruta.get('/registroProducto', (req, res)=>
{
    res.render('registroProducto');
});
ruta.post('/login', (req, res)=>
{
    if(req.body.password!=process.env.ADMIN_PASS)
    {
        res.send('informacion no aceptada');
        return;
    }
    res.redirect('/admin/adminpage')
});
module.exports=ruta;