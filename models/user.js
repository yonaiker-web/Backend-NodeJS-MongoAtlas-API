//archivo que crear una estructura de como se guardaran los usuarios en mongodb
const mongoose = require('mongoose')

//creamos la estructura de un esquema de mongoose para los usuarios
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip :{
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    }
})

//obtiene el valor id creado automaticamente de mongoDB
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
//convierte este valor _id a un valor string id en la base de datos
userSchema.set('toJSON', {
    virtuals: true,
});

//exportamos User que se el modelo de eschema para almacenar los datos
exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;