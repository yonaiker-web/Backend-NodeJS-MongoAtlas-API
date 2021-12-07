//archivo para pedir y agregar ordenes a mongodb
const { Order } = require('../models/order')
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if(!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'} 
        });

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

//agregamos nuevos campos a la tabla de orders en mongodb manejandolo como una peticion asincrona
router.post(`/`, async (req, res) => {
    //estructura para almacenar un arreglo de todas las ordernes de una order
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        //esperamos que se guarde 
        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved =  await orderItemsIds;
    
    //calculando el precio total de una orden usando los precios de cada producto y la cantidad por ello
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product[0].price * orderItem.quantity;
        return totalPrice
        //corregir 6.60
        //console.log(orderItem.product[0].price);
        //console.log(totalPrice);
        //console.log(orderItem.product.price);
        //console.log(orderItem.quantity);
    }))

    const totalPrice = totalPrices.reduce((a,b) => a + b , 0);

    //console.log(totalPrices);
    //desde la peticion post creamos una nueva orden con la estructura
    //el orderItems sera un arreglo de los orderItemsIds
    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })

    //lo guardamos en mongodb
    order = await order.save();
    
    //si no tiene algu valor retornamos
    if(!order)
    return res.status(404).send('La Orden no fue creada!')

    //si tiene devolvemos la categoria
    res.send(order);
})

//actualizar los datos por id
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status,
    },
        { new: true }
    )
    

    //si no tiene algu valor retornamos
    if(!order)
    return res.status(404).send('La orden no fue actualizada!')

    //si tiene devolvemos la categoria
    res.send(order);
})

//eliminar datos por id, manejandolo como una promesa con then catch
router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'La orden fue eliminada!'})
        } else {
            return res.status(404).json({success: false , message: "Orden no encontrada!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

//obtenemos el precio total del precio total de todas las ordenes
router.get('/get/totalsales', async (req, res)=> {
    //generamos un grupo con el id nulo y el precio total de la orden
    const totalSales = await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('No se puede generar la orden')
    }

    //extraemos solo el precio total y no el arreglo que generamos
    res.send({totalsales: totalSales.pop().totalsales})
})

//obtenemos la cantidad total de ordenes
router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments()

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
})

//obtener las ordenes e un usuario por id
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})



module.exports = router;

{/* 
{
    "orderItems": [
        {
            "quantity": 3,
            "product": ""
        },
        {
            "quantity": 2,
            "product": ""
        }
    ]
    "shippingAddress1": "flowers Street, 45",
    "shippingAddress2": "1-B",
    "city": "Pargue",
    "zip": "0000",
    "country": "Czech republic",
    "phone": "+4222588741",
    "user": ""
}
*/}