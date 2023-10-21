const {Schema, model}=require('mongoose');
const usuarioSchema=new Schema({
    username:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    comentarios:{type:Array}
    /*
    [{
        productoId,
        contenido
    }]
    */
});
module.exports=model('usuario', usuarioSchema);