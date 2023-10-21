const ruta=require('express').Router();
const UserModel=require('../models/usuarios');
const cryptojs=require('crypto-js');
const jwt=require('jsonwebtoken');
const secretCrypto=process.env.SECRET_CRYPTO;
const secretJwt=process.env.SECRET_JWT;
const verify=(req, res, next)=>
{
    const token=req.headers.authorization;
    if(!token)
    {
        return res.json({response:"failed", error:"No se ha iniciado sesion"});
    }
    jwt.verify(token, secretJwt, (err, decoded)=>
    {
        if(err)
        {
            console.log(err);
            return res.json({response:"failed", error:"No se pudo verificar la sesion"});
        }
        //console.log(decoded);
        req.body.userInfo=decoded;
        next();
    });
}
ruta.get('/info', verify, (req, res)=>
{
    UserModel.findOne({email:req.body.userInfo.email})
    .then((user)=>
    {
        if(user)
        {
            res.json({response:"success", userInfo:user});
        }
        else
        {
            res.json({response:"failed", error:"No se encontro informacion del usuario"});
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"Ha ocurrido un error al obtener la informacion del usuario"});
    })
});
ruta.post('/modificarInfo', verify, (req, res)=>
{
    UserModel.findOneAndUpdate({email:req.body.userInfo.email}, {$set:{
        username:req.body.username,
        email:req.body.email
    }})
    .then((usu)=>
    {
        if(usu)
        {
            res.json({response:"success", userInfo:usu});
        }
        else
        {
            res.json({response:"failed", error:"No se encontro el usuario a modificar"});
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:'failed', error:"Error interno del servidor"});
    })
})
ruta.post('/registro', (req, res)=>
{
    UserModel.findOne({email:req.body.email})
    .then((user)=>
    {
        if(user)
        {
            res.json({response:"failed", error:"El correo proporcionado ya esta registrado"});
        }
        else
        {
            console.log(req.body);
            var newUser=new UserModel({
                username:req.body.username,
                email:req.body.email,
                password:cryptojs.AES.encrypt(req.body.password, secretCrypto).toString()
            });
            newUser.save()
            .then(()=>
            {
                res.json({response:"success"})
            })
            .catch((err)=>
            {
                console.log(err);
                res.json({response:"failed", error:"Ha ocurrido un error al registrar al usuario"});
            });
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"No se pudo realizar el registro"})
    })
});
ruta.post('/login', (req, res)=>
{
    console.log('acceso de ruta')
    UserModel.findOne({email:req.body.email})
    .then((user)=>
    {
        if(user)
        {
            if(req.body.password==cryptojs.AES.decrypt(user.password, secretCrypto).toString(cryptojs.enc.Utf8))
            {
                var usuario={
                    username:user.username,
                    email:user.email
                };
                var userToken=jwt.sign(usuario, secretJwt);
                res.json({response:"success", token:userToken});
            }
            else
            {
                res.json({response:"failed", error:"La inormacion proporcionada no es la correcta"})
            }
        }
        else
        {
            res.json({response:"failed", error:"La informacion proporcionada no es la correcta"})
        }
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"Error al realizar la busqueda"})
    })
});
ruta.post('/comentar', verify, (req, res)=>
{
    var comentario={
        productoId:req.body.productoId,
        contenido:req.body.comentario
    };
    UserModel.findOneAndUpdate({email:req.body.userInfo.email}, {$addToSet:{comentarios:comentario}})
    .then(()=>
    {
        res.json({response:"success"});
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"Ha ocurrido un error al realizar el comentario"});
    });
});
ruta.get('/eliminarCuenta', verify, (req, res)=>
{
    console.log(req.body.userInfo);
    UserModel.findOneAndDelete({email:req.body.userInfo.email})
    .then((data)=>
    {
        console.log('cuenta eliminada');
        res.json({response:"success"});
    })
    .catch((err)=>
    {
        console.log(err);
        res.json({response:"failed", error:"No se encontro usuario a eliminar"});
    })
})
module.exports=ruta;