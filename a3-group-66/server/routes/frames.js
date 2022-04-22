/**
 * This module contains the routes under /frames
 */

'use strict';

const express = require('express');
const routes = express.Router();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
let frames = require('../resources/frames.json');

routes.get('/', async (req, res) => {

  let framestyles = loadFrameStyles();
  res.json(framestyles);


});

routes.get('/:style/:imageType', async (req, res) => {

  let style = req.params.style;
  let imageType = req.params.imageType;


  console.log(style + ' ' + imageType);

  if (imageType === 'thumbImage') {
    res.sendFile(path.join(__dirname, `../resources/frame-styles/${style}-thumb.png`));
    res.contentType('image/png');
  }

  else  if (imageType === 'borderImage') {
    res.sendFile(path.join(__dirname, `../resources/frame-styles/${style}.jpg`));
    res.contentType('image/jpeg');
  }

  else {
    res.sendStatus(404);
  }


});


module.exports = routes;

class Framestyle {
  constructor(style, label, slice) {
    this.style = style;
    this.label = label;
    this.slice = slice;
  }
}

function loadFrameStyles() {

  let framestyles = [];

  for (let i = 0; i < frames.length; i++) {
    let framestyle = new Framestyle(frames[i].id, frames[i].label, frames[i].border.slice);
    framestyles.push(framestyle);
  }

  return framestyles;
}

