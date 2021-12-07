//archivo que crear una estructura de como se guardaran los productos en mongodb
const mongoose = require('mongoose')

//creamos la estructura de un esquema de mongoose para los productos
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    brand: {
        type: String,
        default: ''
    },
    price : {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})


//obtiene el valor id creado automaticamente de mongoDB
productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
//convierte este valor _id a un valor string id en la base de datos
productSchema.set('toJSON', {
    virtuals: true
})

//exportamos Product que se el modelo de eschema para almacenar los datos
exports.Product = mongoose.model('Product', productSchema);