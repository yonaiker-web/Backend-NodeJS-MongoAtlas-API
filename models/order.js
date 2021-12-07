//archivo que crear una estructura de como se guardaran las ordenes en mongodb
const mongoose = require('mongoose')

//creamos la estructura de un esquema de mongoose para las ordenes
const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
        default:0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

//obtiene el valor id creado automaticamente de mongoDB
orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
//convierte este valor _id a un valor string id en la base de datos
orderSchema.set('toJSON', {
    virtuals: true
})


//exportamos User que se el modelo de eschema para almacenar los datos
exports.Order = mongoose.model('Order', orderSchema);