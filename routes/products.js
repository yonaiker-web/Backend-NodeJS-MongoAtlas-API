//archivo CRUD de productos a mongodb
const { Product } = require('../models/product')
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
//libreria para manejar la subida de archivos con exress y node
const multer = require('multer')

//extructura de los tipo de datos de imagenes
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

//guarda la imagen agregar al producto
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //validamos que sea una extension de imagen
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Tipo de imagen invalida');

        //si se valida que tiene una extension de imagenes no muestra erro = null
        if (isValid) {
            uploadError = null;
        }
        //'public/uploads' = la ruta en donde se guardaran los archivos
        cb(uploadError, 'public/uploads');
        
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        //valida y da extension a las imagenes
        const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  })
  
  const uploadOptions = multer({ storage: storage })

//obtenemos datos de product desglosando los campos de category
router.get(`/`, async (req, res) => {

    //filtrado para selecciona mas de dos campos
    let filter = {}
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category')

    //si no obtiene nada
    if(!productList) {
        res.status(500).json({success: false})
    }

    res.send(productList);
})

//obtenemos datos por id, junto a los datos de la tabla category
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    //si no obtiene nada
    if(!product) {
        res.status(500).json({success: false})
    }

    res.send(product);
})

//agremaos a la base de datos con post manejando una peticion asincrona
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    //validamos que el prodicto tenga un id de categoria valida
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Categoria Invalida');
    //console.log(category);

    //validamos que tenga una imagen
    const file = req.file;
    if (!file) return res.status(400).send('Falta cargar la imagen');

    //fileName sera lo que se cargue en filename que es la funcion multer para cargar archivos
    const fileName = req.file.filename
    //es la ruta desde donde se cargar el archivo
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    //desde la peticion post creamos un producto con la estructura
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })
    
    //lo guardamos en mongodb manejado como una peticion asincrona
    product = await product.save();

    //si no hay producto
    if(!product)
    return res.status(500).send('El producto no fue creado!');
    console.log(product);

    res.send(product)
})

//actualizar los datos por id
router.put('/:id', async (req, res) => {
    //validamos que el producto tenga un id valido
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Id de Producto invalido')
    }
    //validamos que el prodicto tenga un id de categoria valida
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Categoria Invalida');

    const product = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    },
        { new: true }
    )

    //si no tiene algu valor retornamos
    if(!product)
    return res.status(500).send('El producto no fue actualizado!')

    //si tiene devolvemos la categoria
    res.send(product);
})

//eliminar datos por id, manejandolo como una promesa con then catch
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then(product => {
            if(product) {
                return res.status(200).json({success: true, message: 'El producto fue eliminada!'})
            } else {
                return res.status(404).json({ success: false, message: 'Producto no encontrada!'})
            }
        })
        .catch(err => {
            return res.status(400).json({success: false, error: err})
        })
})

//obtenemos la cantidad total de campos de la tabla product
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();

    if(!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount,
    });
});


//obtenemos n cantidad de registros
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0

    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});

//carga un maximo de 10 imagenes a un producto
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    //validamos que el producto tenga un id valido    
    if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('el Id del producto es invalido');
        }
        //guardamos el requerimiento que este en files
        const files = req.files;
        //declaramos que sera un array
        let imagesPaths = [];
        //la ruta desde donde se esta guardando el archivo
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        //
        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        //la estructura y el cargo que se va a actualizar
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product)
            return res.status(500).send('La geleria no fue actualizada');

        res.send(product);
    }
);


module.exports = router;