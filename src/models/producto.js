const {Schema, model}=require('mongoose');
const productoSchema=new Schema({
    tipo:{type:String, required:true},
    nombre:{type:String, required:true},
    marca:{type:String, required:true},
    tallas:{type:String, required:true},
    descripcion:{type:String, requires:true},
    precio:{type:Number, required:true},
    imagenes:{type:Array, required:true},
    opcional_modelo:{type:String},
    opcional_video:{type:String}
});
module.exports=model('producto', productoSchema);