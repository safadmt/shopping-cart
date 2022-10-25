
var db = require('../config/connection');
var collections = require('../config/collection');
const { resolve } = require('promise');
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt');
module.exports = {

    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data)
            callback(data.insertedId)
        })
    },
    getAllProduct: () => {
        return new Promise(async(resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id: objectId(proId)}).then((response) =>{
                resolve(response)
            })
            
        })
    },

    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id: objectId(proId)}).then((response) => {
                resolve(response)
            })
        })
    },

    updateProduct: (prodId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id: objectId(prodId)},
            {
                $set: {
                    Name: productDetails.Name,
                    Category: productDetails.Category,
                    Price: productDetails.Price,
                    Description: productDetails.Description
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    getPlacedorders: () => {
        return new Promise(async(resolve, reject) => {
            let orders =await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
            console.log(orders)
            resolve(orders)
        })
    },

    changeOrderStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
               $set: {status: 'shipped'}
            }).then((response) => {
                resolve(response)
            })
            
        })
    },

    doadminSignup: (adminData) => {
        return new Promise(async(resolve, reject) => {
            adminData.Password =await bcrypt.hash(adminData.Password, 10)
            db.get().collection(collections.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                adminData._id = data.insertedId
                resolve(adminData)
            })
        })
    },

    doadminLogin: (adminData) => {
        
        return new Promise(async(resolve, reject) => {
            let loginstatus = false;
            let response = {}
            let admin =await db.get().collection(collections.ADMIN_COLLECTION).findOne({Email: adminData.Email})
            if(admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if(status) {
                        console.log('Admin login success')
                        response.admin = admin;
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed')
                        resolve({status: false})
                    }
                })
            } else {
                console.log('login failed')
                resolve({status: false})
            }
        })
    },

    getAllusers: () =>{
        return new Promise(async(resolve, reject) => {
            let users=await db.get().collection(collections.USER_COLLECTION).find().toArray()
            console.log(users)
            resolve(users)
        })
    }
}