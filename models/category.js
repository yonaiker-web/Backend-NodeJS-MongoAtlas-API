//archivo que crear una estructura de como se guardaran las categorias en mongodb
const mongoose = require('mongoose')

//creamos la estructura de un esquema de mongoose para las categorias
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: { 
        type: String,
    }
})

//exportamos User que se el modelo de eschema para almacenar los datos
exports.Category = mongoose.model('Category', categorySchema);