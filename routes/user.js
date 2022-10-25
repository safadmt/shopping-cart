const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
var userHelper = require('../helpers/user-helpers');

const verifyLogin = (req, res, next) => {
  if(req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  let user = req.session.user;
  console.log(user)
  let cartCount = null
  if(req.session.user) {
    cartCount =await userHelper.getCartCount(req.session.user._id)
  }
  productHelper.getAllProduct().then((products) => {

    res.render('user/view-products', {products, user, cartCount})
  })
});

router.get('/login', (req, res) => {
  if(req.session.user) {
    res.redirect('/')
  } else{
    res.render('user/login',{'loginErr': req.session.userloginErr})
    req.session.userloginErr = false
  }
  
});

router.get('/signup', (req, res) => {
  res.render('user/signup')
});

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((insertedId) => {
    req.session.user = insertedId
    req.session.user.loggedIn = true
    res.redirect('/')
  })
});

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if(response.status) {
      req.session.user = response.user
      req.session.user.loggedIn = true;
      res.redirect('/')
    } else {
      req.session.userloginErr = "Invalid username or password"
      res.redirect('/login')
    }
  })
});

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userloggedin= false
  res.redirect('/')
});

router.get('/cart', verifyLogin, async(req, res) => {
  let prod =await userHelper.getCartProduct(req.session.user._id)
  let totalValue =await userHelper.getTotalAmount(req.session.user._id)
    console.log(prod);
  res.render('user/cart', {prod, user:req.session.user, totalValue})
  
  
});

router.get('/add-to-cart/:id', (req, res) => {
  console.log("api call");  
  userHelper.addToCart(req.params.id, req.session.user._id).then((response) => {
    res.json({status: true})
  })
});

router.post('/change-product-quantity', (req, res) => {
  console.log(req.body)
  userHelper.changeProductQuantity(req.body).then(async(response) =>{
    response.total =await userHelper.getTotalAmount(req.body.user)
    res.json(response)
  })
});

router.post('/remove-cart-product', (req, res) => {
  console.log(req.body)
  userHelper.deleteCartProduct(req.body).then((response) => {
    res.json(response)
  })
});

router.get('/place-order',verifyLogin, async(req, res) => {
  let total =await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
});

router.post('/place-order', async(req, res) => {
  console.log(req.body)
  let products =await userHelper.getCartProductList(req.body.userId)
  let totalPrice =await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body,products,totalPrice).then((orderId) => {
    if(req.body['payment-method'] === 'COD') {
      res.json({codSuccess:true})
    } else {
      userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }
    
 }) 
});

router.get('/order-success',verifyLogin, (req, res) => {
  res.render('user/order-success',{user:req.session.user})
});

router.get('/orders',verifyLogin, async(req, res) => {
  let userorders =await userHelper.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,userorders})
});

router.get('/view-order-products/:id',verifyLogin, async(req, res) => {
  let products =await userHelper.getOrderProducts(req.params.id)
  res.render('user/view-order-products', {user:req.session.user,products})
});

router.post('/verify-payment', (req, res) => {
  console.log(req.body)
  userHelper.verifyPayment(req.body).then(() => {
    userHelper.changePaymentstatus(req.body['order[receipt]']).then(() => {
      console.log('Payment Successful')
      res.json({status:true})
    })
  }).catch((err) => {
    console.log(err);
    res.json({status:false, errMsg:''})
  })
});

router.get('/product', (req, res) => {
  res.send('hi man i am safad')
});

router.get('/user-profile', verifyLogin, async(req, res) => {
  let userinfo =await userHelper.getuserInfo(req.session.user._id)
  
  res.render('user/user-profile', {user:req.session.user, userinfo})
})
module.exports = router;
