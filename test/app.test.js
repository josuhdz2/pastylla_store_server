const app=require('../src/app');
const {faker}=require('@faker-js/faker');
const supertest=require('supertest');
const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzdWFyaW9UZXN0IiwiZW1haWwiOiJjb3JyZW90ZXN0QGdtYWlsLmNvbSIsImlhdCI6MTY5NjQ2OTUxOH0.AT_hD_JHwkdWjL21KLKJ3TBN6D3D7p1oKsmSNcAtNd8';
describe('Escaneo de rutas', ()=>
{
    test('verificar existencia de ruta /', async()=>
    {
        const response=await supertest(app).get('/').send();
        expect(response.statusCode).toBe(200);
    });
    test('verificar existencia de ruta /admin', async()=>
    {
        const response=await supertest(app).get('/admin').send();
        expect(response.statusCode).toBe(200);
    });
    test('verificar existencia de ruta /admin/adminpage', async()=>
    {
        const response=await supertest(app).get('/admin/adminpage').send();
        expect(response.statusCode).toBe(200);
    });
    test('verificar existencia de ruta /admin/listaProductos', async()=>
    {
        const response=await supertest(app).get('/admin/listaProductos').send();
        expect(response.statusCode).toBe(200);
    });
    test('verificar existencia de ruta /admin/producto/650bdea21fad02a7ee5eb840', async()=>
    {
        const response=await supertest(app).get('/admin/producto/650bdea21fad02a7ee5eb840').send();
        expect(response.statusCode).toBe(200);
    });
    test('verificar existencia de ruta /admin/registroProducto', async()=>
    {
        const response=await supertest(app).get('/admin/registroProducto').send();
        expect(response.statusCode).toBe(200);
    });
});
/*describe('Obtencion de respueta de API para generacion de comentarios', ()=>
{
    test('creacion de comentario', async()=>
    {
        const response=await supertest(app)
        .post('/usuario/comentar')
        .set('Authorization', token)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            productoId:"650bdea21fad02a7ee5eb840",
            comentario:"Este producto es muy bueno y cumple con mis espectativas."
        });
        expect(response.statusCode).toBe(200);
    });
});*/
describe('Sesion de usuario', ()=>
{
    test('registro de nuevo usuario', async()=>
    {
        const response=await supertest(app)
        .post('/usuario/registro')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            username:faker.internet.userName(),
            email:faker.internet.email(),
            password:"12345678"
        });
        expect(response.body.response).toBe('success');
    });
    test('registro de usuario con informacion existente', async()=>
    {
        const response=await supertest(app)
        .post('/usuario/registro')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            username:"otro usuario",
            email:"correotest@gmail.com",
            password:"nuevapassword"
        });
        expect(response.body.response).toBe('failed');
    })
    test('login de usuario con informacion correcta', async()=>
    {
        const response=await supertest(app)
        .post('/usuario/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            email:"correotest@gmail.com",
            password:"12345678"
        });
        expect(response.body.response).toBe('success');
    });
    test('login de usuario con informacion incorrecta', async()=>
    {
        const response=await supertest(app)
        .post('/usuario/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            email:"correoincorrecto@gmail.com",
            password:"passincorrecto"
        });
        expect(response.body.response).toBe('failed');
    })
});
describe('Manejo de informacion de usuario', ()=>
{
    test('optencion de informacion de usuario', async()=>
    {
        const response=await supertest(app)
        .get('/usuario/info')
        .set('Authorization', token)
        .send();
        expect(response.body.response).toBe('success');
    });
    /*test('modificacion de la informacion del usuario', async()=>
    {
        const response=await supertest(app)
        .post('/usuario/modificarInfo')
        .set('Authorization', token)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send();
        expect(response.body.response).toBe('success');
    })*/
});
describe('Obtencion y busqueda de productos', ()=>
{
    test('obtencion de la informacion de un producto', async()=>
    {
        const response=await supertest(app).get('/productos/infoProducto/653052c0971ff4ed855bdb8d').send();
        console.log(response.body);
        expect(response.body.response).toBe("success");
    });
    test('obtencion de los ultimos productos para pantalla inicial', async()=>
    {
        const response=await supertest(app).get('/productos/vistaGeneral').send();
        console.log(response.body);
        expect(response.body.response).toBeDefined();
    });
    test('busqueda de un producto no existente', async()=>
    {
        const response=await supertest(app)
        .post('/productos/buscar')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            busqueda:"555"
        });
        expect(response.body.lista).toHaveLength(0);
    });
    test('busqueda de producto existente', async()=>
    {
        const response=await  supertest(app)
        .post('/productos/buscar')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            busqueda:"jordan"
        })
        expect(response.body.lista).toBeInstanceOf(Array);
    })
})