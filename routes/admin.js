var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
var userHelper = require('../helpers/user-helpers')

const verifyLogin = (req, res, next) => {
  if(req.session.admin) {
    next()
  } else {
    res.redirect('/admin/admin-login')
  }
}


/* GET users listing. */
router.get('/', verifyLogin, function(req, res, next) {
  let isadmin = req.session.admin
  productHelper.getAllProduct().then((products) => {
    res.render('admin/view-products', {admin: true, products, isadmin} )
  })
  
});
router.get('/add-product', function(req, res) {
  res.render('admin/add-product');
});
router.post('/add-product', (req, res) => {
  
  productHelper.addProduct(req.body, (insertedId) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + insertedId + '.jpg', (err, done) => {
      if(!err) {
        res.render('admin/add-product');
      } else {
        console.log(err)
      }
    }) 
  });
});

router.get('/delete-product/:id', (req, res) => {
  let productId = req.params.id
  console.log(productId)
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect('/admin/')
  })
});

router.get('/edit-product/:id', async(req, res) => {
  let product =await productHelper.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product', {product})
});

router.post('/edit-product/:id', (req, res) => {
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if(req?.files?.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + req.params.id + '.jpg')
      
    }
  })
  
});

router.get('/placed-orders', async(req, res) => {
  let orders =await productHelper.getPlacedorders()
  console.log(orders._id)
  res.render('admin/placed-orders', {admin: true,isadmin:req.session.admin, orders})
});

router.get('/view-ordered-product/:id', async(req, res) => {
  let orderProducts =await userHelper.getOrderProducts(req.params.id)
  res.render('admin/view-ordered-product', {admin:true, isadmin:req.session.admin,orderProducts})
})

router.post('/change-order-status', (req, res) => {
  console.log(req.body.order)
  productHelper.changeOrderStatus(req.body.order).then((response) => {
    res.json({status:true})
  })
});

router.get('/admin-login', (req, res) => {
  res.render('admin/admin-login', {admin:true})
});

router.get('/admin-signup', (req, res) => {
  res.render('admin/admin-signup')
});

router.post('/admin-signup', (req, res) => {
  productHelper.doadminSignup(req.body).then((response) => {
    req.session.admin = response
    req.session.admin.loggedin = true
    res.redirect('/admin')
  })
});

router.post('/admin-login', (req, res) => {
  productHelper.doadminLogin(req.body).then((response) =>{
    console.log(response)
    if(response.status) {
      req.session.admin = response.admin
      req.session.admin.loggedin = true
      res.redirect('/admin')
    } else {
      req.session.adminlogginErr = 'invalid username or password'
      res.redirect('/admin-login')
    }
    
  })
});

router.get('/admin-logout', (req, res) => {
  req.session.admin = null;
  req.session.loggedin = false
  res.redirect('/admin')
});

router.get('/all-users', verifyLogin, async(req, res) => {
  let users =await productHelper.getAllusers()
  res.render('admin/all-users',{admin:true,isadmin:req.session.admin, users})
})


module.exports = router;
