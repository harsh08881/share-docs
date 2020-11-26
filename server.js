const express = require('express');
const expresslayouts = require('express-ejs-layouts');
const indexRouter =require('./routes/index')
const userRouter = require('./routes/user')
const bodyparser = require('body-parser')
const mongoose = require('mongoose');
const dotenv = require('dotenv')



dotenv.config();


// express call
 const app = express()

// template engine configuration
app.set('view engine', 'ejs');
// app.set('views',__dirname +'/views');
// app.set('layout', 'layouts/layout');
app.use(expresslayouts);



//passport configuration

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.json());

// server static files
app.use(express.static('public'));

// route handlers in router folder





// mongodb connnection


mongoose.connect(process.env.DATABASE_URI,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("database connected"));
// mongoose.connection.once('open',() => console.log('cossnnected to db'))

app.use('/',indexRouter)
app.use('/users',userRouter)
app.use('/files/upload',require('./routes/upload'))
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

const port =process.env.PORT || 8000;
// port listen 
app.listen(port, console.log(`Listening on port`));