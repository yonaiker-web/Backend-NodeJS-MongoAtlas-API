//inicializamos una variable que requiere de express
const express = require('express');
const app = express();
//requerimos la libreria body-parser (version vieja)
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
//archivo para valida que solo usuarios con token hagan peticiones
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

//requerimos el modulo de dotenv para usar las varibles de entorno
require('dotenv/config');


//CORS permitir peticiones http
app.use(cors());
app.options('*', cors());

//middleware
//app.use(bodyParser.json());  //version vieja
app.use(express.json()); //nueva
//obtiene el tipo de peticion y la ruta de la api (eje: GET, POST...)
app.use(morgan('tiny'));
//valida que solo los usuarios con token puede hacer peticiones por la API
app.use(authJwt());
//permite visualizar las imagenes agregasdas a un produtc sin autenticacion de usuario
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
//corregimso si ocurre algun erro de un token malo
app.use(errorHandler)

//importamos el modelo de router para las peticiones http
//const productsRouter = require('./routes/products')


//routers
const categoriesRoutes = require('./routes/categories');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const productsRoutes = require('./routes/products');


//la constante api tendra almacenada la version del api en uso actualmente
const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);


//iniciamos la conexion a la base de datos con la variable de entorno
mongoose.connect(process.env.URL_DB)
.then(() => {
    console.log("Base de Datos conectada");
})
.catch((err) => {
    console.error(err);
})

//ruta en desarrollo

//ponemos a express en la escucha por el puerto 3010
app.listen(3010, () => {
    //imprimimos en la terminal
    console.log("Servidor corriendo http://localhost:3010");
})

//ruta en produccion
/* var server = app.listen(process.env.PORT || 3010, function () {
    var port = server.address().port;
    console.log("Express trabajando en el puerto:" + port);
}) */