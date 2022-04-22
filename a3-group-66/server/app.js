/**
 * This module registers all the application logic
 * Use this file to register the routes you implemented.
 */

'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');

const artworkRoutes = require('./routes/artworks');
const shippingRoutes = require('./routes/shipping');
const cartRoutes = require('./routes/cart');
const framesRoutes = require('./routes/frames');
const matsRoutes = require('./routes/mats');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Register the modules containing the routes
app.use('/artworks', artworkRoutes);
app.use('/shipping', shippingRoutes);
app.use('/cart', cartRoutes);
app.use('/frames', framesRoutes);
app.use('/mats', matsRoutes);

app.use((req,res,next) => {
  res.sendStatus(404);
});

module.exports = app;
