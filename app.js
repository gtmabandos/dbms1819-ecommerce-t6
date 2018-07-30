var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var { Client } = require('pg');
var port = process.env.PORT || 3000

// var client = new Client({
// 	database: 'storedb',
// 	user: 'postgres',
// 	password: 'admin',
// 	host: 'localhost',
// 	port: 5432
//  });

var client = new Client({
	database: 'd68qcht7s34fcp',
	user: 'brobjwlcnyrzok',
	password: '49e9c928324e0f531ee21b2ba6b70bc7597e1892d49b57bca6eec3f0c3ebb3b9',
	host: 'ec2-50-17-189-165.compute-1.amazonaws.com',
	port: 5432
 });

//CREATE TABLE products(id SERIAL PRIMARY KEY, name varchar(255), type varchar(255), description varchar(255), brand varchar(255), price float(2), picture varchar(80));
//INSERT INTO products(name, type, description, brand, price, picture) VALUES ('Curry 5', 'Basketball Shoes', 'The latest update in Stephen Curry signature footwear line is officially complete. Programmed for maximum unpredictability, the lightweight, precision-fitting Curry 5 was developed to help Stephen optimize his on-court performance.', 'Under Armour', '7995', '/Curry5.jpg');
//INSERT INTO products(name, type, description, brand, price, picture) VALUES ('Harden 1', 'Basketball Shoes', 'Designed for his quick handles and even quicker footwork, these basketball shoes are James Harden signature look', 'Adidas', '7500', '/Harden1.jpg');
//INSERT INTO products(name, type, description, brand, price, picture) VALUES ('KD 9', 'Basketball Shoes', 'In response to Kevin Durant trademark versatility and impressive court coverage, it offers support, comfort and responsiveness', 'Nike', '8000', '/KD9.jpg');
//INSERT INTO products(name, type, description, brand, price, picture) VALUES ('Kobe 11', 'Basketball Shoes', 'The KOBE 11 is a progressive low-top that distills Bryant signature legacy to its essence: high performance, lightweight, responsive and sophisticated design.', 'Nike', '8500', '/Kobe11.jpeg');
//INSERT INTO products(name, type, description, brand, price, picture) VALUES ('Kyrie 2', 'Basketball Shoes', 'Kyrie doesnt stop and start - he is always in motion. Play a fast, fluid and explosive game in the Kyrie 2, designed for ultimate agility and Speed.', 'Nike', '6400', '/Kyrie2.jpg');
//INSERT INTO products(name, type, description, brand, price, picture) VALUES ('LeBron 15', 'Basketball Shoes', 'The LEBRON 15 is the most technically advanced shoe of LeBron James career', 'Nike', '9900', '/LeBron15.jpg');
//INSERT INTO products(name, type, description, brand, price, picture) VALUES ('PG 1', 'Basketball Shoes', 'Tailored to Paul George two-way game,delivers low-profile, responsive cushioning, while a number of signature details add a personal touch.', 'Nike', '6000', '/PG1.jpg');


// connect to database
client.connect()
	.then(function() {
		console.log('Connected to database!')
	})
	.catch(function(err) {
		console.log('Cannot connect to database!')
	});

var app = express();

//Set Public folder
app.use(express.static(path.join(__dirname, 'public')));

//Assign Handlebars To .handlebars files
app.engine('handlebars', exphbs({defaultLayout: 'main'}));

//Set Default extension .handlebars
app.set('view engine', 'handlebars');

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/member/Gerald', function(req, res) {
		res.render('member',{
			title: 'Profile Page of Gerald',
			name: 'Gerald T. Mabandos',
			email: 'gmabandos@gmail.com',
			phone: '09201121171',
			imageurl: 'image_gerald.jpg',
			hobbies: ['Basketball', 'Computer Games'],
			background: 'background.jpg'
		});
});

app.get('/member/Benz', function(req, res) {
		res.render('member',{
			title: 'Profile Page of Benz',
			name: 'Benjamin F. Matias',
			email: 'benz.matias13@gmail.com',
			phone: '09398070460',
			imageurl: 'image_benz.jpg',
			hobbies: ['Eat', 'Sleep', 'Repeat'],
			background: 'grid.gif'
		});
});

app.get('/', function(req,res) {
	client.query('SELECT * FROM products', (req, data)=>{
		var products = [];
		for (var i = 0; i < data.rows.length; i++) {
			products.push(data.rows[i]);
		}
		res.render('home',{
			data: products,
			title: 'Team 6 Ecommerce'
		});
	});
});

app.get('/products/:id', (req,res)=>{
	var id = req.params.id;
	client.query('SELECT * FROM Products', (req, data)=>{
		var products = [];
		for (var i = 0; i < data.rows.length+1; i++) {
			if (i==id) {
				products.push(data.rows[i-1]);
			}
		}
		res.render('products',{
			data: products
		});
	});
});

app.post('/products/:id/send', function(req, res) {
	console.log(req.body);
	var id = req.params.id;
	var output = `
		<p>You have a new product order</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Customer Name: ${req.body.name}</li>
			<li>Phone: ${req.body.phone}</li>
			<li>Email: ${req.body.email}</li>
			<li>Product Name: ${req.body.productname}</li>
			<li>Quantity ${req.body.quantity}</li>
		</ul>
	`;

//Email Part
let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'dbms1819.t6@gmail.com', 
            pass: 'Heroku@hub6' 
        }
    });

let mailOptions = {
        from: '"Team 6 Ecommerce" <dbms1819.t6@gmail.com>',
        to: 'gmabandos@gmail.com, benz.matias13@gmail.com',
        subject: 'Team 6 Ecommerce Order Request',
        html: output
    };

 transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        client.query('SELECT * FROM Products', (req, data)=>{
			var products = [];
			for (var i = 0; i < data.rows.length+1; i++) {
				if (i==id) {
					products.push(data.rows[i-1]);
				}
			}
			res.render('products',{
				data: products,
				msg: 'Email has been sent'
			});
		});
     });
});


//Server
app.listen(port, function(){
	console.log('Server Started on Port ' + port);
});


