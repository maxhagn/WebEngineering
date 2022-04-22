/**
 * This module contains the routes under /mats
 */

'use strict';

const express = require('express');
const routes = express.Router();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
let matcolors = require('../resources/mat-colors.json');

routes.get('/', async (req, res) => {

  let colors = loadColors();

  //console.log(colors);

  res.json(colors);

});


module.exports = routes;

 function loadColors() {

  let colors = [];

  for (let i = 0; i < matcolors.length; i++) {
    let color = new Color(matcolors[i].id, matcolors[i].label, matcolors[i].color);
    colors.push(color);
  }
 return colors;

}

class Color {
  constructor(color, label, hex) {
    this.color = color;
    this.label = label;
    this.hex = hex;
  }

}