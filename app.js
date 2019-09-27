const express =require("express");
const bodyParser = require("body-parser");//?
const engines = require("consolidate");//?
const paypal = require('paypal-rest-sdk');
const port = process.env.PORT || 3000;

const app = express();

app.engine("ejs", engines.ejs);//?
app.set("views", "./views"); //?
app.set("view engine", "ejs");//?

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AVBzf2mB7f4ZGPNy_jGTsTGIlaMMbe073qLB75bWNTI76u8FQkRTUrdBBxHzXgHcQlqQ4arziO3mHcm8',
    'client_secret': 'ENTrwdrNRT4IIVGEPOKSxwiFxIuw9_hWvjX-XINiMNxTRUaXcaatqBUikVhml8a9eeL5g9ejLcaEx2g6'
  });

app.get("/", (req, res) => {
    res.render("index")
});

app.get('/paypal', (req,res) => {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://10.0.0.1:3000/success",
            "cancel_url": "http://10.0.0.1:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            //res.send('ok')
            res.redirect(payment.links[1].href)
        }
    });
});

app.get('/success', (req,res) => {
    var PayerID = req.query.PayerID
    var paymentId = req.query.paymentId
    var execute_payment_json = {
        "payer_id": PayerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };  

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(payment);
            res.render('success');
        }
    });
})

app.get('/cancel', (req,res) => {
    res.render('cancel')
})


app.listen(port, ()=> {
    console.log("Server is running");
})