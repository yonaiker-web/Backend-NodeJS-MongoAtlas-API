//archivo que crear una estructura de como se guardaran las ordenes en mongodb
const mongoose = require('mongoose')

//creamos la estructura de un esquema de mongoose para las ordenes-item
const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        require: true,
    },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
})

//exportamos ORderItem que se el modelo de eschema para almacenar los datos
exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);