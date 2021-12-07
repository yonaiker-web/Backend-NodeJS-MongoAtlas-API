//archivo CRUD de categorias a mongodb
const { Category } = require('../models/category')
const express = require('express')
const router = express.Router();

//obtenemos datos de categoria
router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    //si no obtiene nada
    if(!categoryList) {
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
})

//obtenemos datos por id de categoria
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    //si no obtiene nada
    if(!category) {
        res.status(500).json({message: 'No se encontro la Categoria con el ID proporcionado'})
    }
    res.status(200).send(category);
})

//agregamos nuevos campos a la tabla de category en mongodb manejandolo como una peticion asincrona
router.post(`/`, async (req, res) => {
    //desde la peticion post creamos una nueva categoria con la estructura
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })

    //lo guardamos en mongodb
    category = await category.save();
    
    //si no tiene algu valor retornamos
    if(!category)
    return res.status(404).send('La categoria no fue creada!')

    //si tiene devolvemos la categoria
    res.send(category);
})

//actualizar los datos por id
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon || category.icon,
        color: req.body.color,
    },
        { new: true }
    )
    

    //si no tiene algu valor retornamos
    if(!category)
    return res.status(404).send('La categoria no fue actualizada!')

    //si tiene devolvemos la categoria
    res.send(category);
})

//eliminar datos por id, manejandolo como una promesa con then catch
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id)
        .then(category => {
            if(category) {
                return res.status(200).json({success: true, message: 'La categoria fue eliminada!'})
            } else {
                return res.status(404).json({ success: false, message: 'Categoria no encontrada!'})
            }
        })
        .catch(err => {
            return res.status(400).json({success: false, error: err})
        })
})

module.exports = router;

