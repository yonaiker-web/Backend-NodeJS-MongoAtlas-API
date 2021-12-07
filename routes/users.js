//archivo para pedir y agregar usuarios a mongodb
const { User } = require('../models/user')
const express = require('express')
const router = express.Router();
//libreria para encryotar con hash
const bcrypt = require('bcryptjs')
//dependencia para crear tokens
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) => {
    //.select('-passwordHash') quitamos que este campo se muestra cuando pedimos la data
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
})

//obtenemos datos por id de usuarios
router.get('/:id', async (req, res) => {
    //.select('-passwordHash') quitamos que este campo se muestra cuando pedimos la data
    const user = await User.findById(req.params.id).select('-passwordHash');

    //si no obtiene nada
    if(!user) {
        res.status(500).json({message: 'No se encontro el Usuario con el ID proporcionado'})
    }
    res.status(200).send(user);
})

//agregamos nuevos campos a la tabla de users en mongodb manejandolo como una peticion asincrona
router.post(`/`, async (req, res) => {
    //desde la peticion post creamos un nuevo usuario con la estructura
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    //lo guardamos en mongodb
    user = await user.save();
    
    //si no tiene algu valor retornamos
    if(!user)
    return res.status(404).send('El usuario no fue creada!')

    //si tiene devolvemos el usuario
    res.send(user);
})

//validamos usuario y contraseña para login (clave principal el email)
router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('Usuario no encontrado')
    }

    //validamos que el email y que el password ingresado sea el mismo que la base de dato
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        //creamos la estructura de un token
        const token = jwt.sign(
            {
                //userId sera el mismo id del usuario
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            //el token expira en 1 dia
            {expiresIn: '1d'}
        )
        
        res.status(200).send({user: user.email, token: token})
    } 
    else {
         res.status(400).send('La contraseña es incorrecta');
    }  
})

//registramos un usuario
router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('EL usuario no fue creado!')

    res.send(user);
})

//obtenemos la cantidad total de campos de la tabla users
router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments();

    if(!userCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        userCount: userCount,
    });
});

//eliminar datos por id, manejandolo como una promesa con then catch
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then(user => {
            if(user) {
                return res.status(200).json({success: true, message: 'El Usuario fue eliminada!'})
            } else {
                return res.status(404).json({ success: false, message: 'Usuario no encontrada!'})
            }
        })
        .catch(err => {
            return res.status(400).json({success: false, error: err})
        })
})


module.exports = router;