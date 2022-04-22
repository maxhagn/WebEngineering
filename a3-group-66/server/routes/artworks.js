/**
 * This module contains the routes under /artworks
 */

'use strict';

const express = require('express');
const routes = express.Router();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
let cache = {};
let highlightsIDs = require('../resources/highlights.json');

routes.get('/', async (req, res) => {

  if (req.query.q == null) {

      let highlights = await loadHighlights();

    res.json(highlights);
  } else {
          let artworks = await getArtworks(req.query.q);
     if (artworks) {
         res.json(artworks);
     } else {
         res.json([]);}
  }
});

routes.get('/:id', async (req, res) => {
  let artwork = await retrieveObject(req.params.id);

  //console.log(req.params.id);

  if (artwork) {
    res.json(artwork);
  } else
  { res.sendStatus(404);
  }
});


module.exports = routes;


 class Artwork {
  constructor(title, artist, date, image, artworkId) {
    this.artworkId = artworkId;
    this.title = title;
    this.artist = artist;
    this.date = date;
    this.image = image;
  } }

   async function retrieveObject(id) {

   // console.log('idtype: ' + typeof id);

       if (id in cache) {
           return cache[id];
       }


     const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
     const response = await fetch(url);

   //  console.log(response.status);

       if (response.status != 200){
           return null;
       }


       const responseArtwork = await response.json();
   //  console.log(responseArtwork);


     let title = responseArtwork.title;
     let artist = responseArtwork.artistDisplayName;
     let date = responseArtwork.objectDate;
     let image = responseArtwork.primaryImageSmall;
     let artworkId = parseInt(id, 10);

     let returnArtwork = new Artwork(title, artist, date, image, artworkId);

     cache[id] = returnArtwork;

     return returnArtwork;
   }

 async function loadHighlights() {

    let highlights = [];

    for (let i = 0; i < highlightsIDs.length; i++) {              /////////// then get the objects

        let artwork = await retrieveObject(highlightsIDs[i]);


       // console.log('highloght: ' + artwork);

        highlights.push(artwork);
    }

    return highlights;
}

async function getArtworks(q) {

    if (q in cache) {
        return cache[q];
    }

     let artworks = [];

    const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${q}`;


    try {
        const response = await fetch(url);            /////// get all the relevant IDs first
        const rawData = await response.json();
        const responseArtworkIDs = await rawData.objectIDs;
      //  console.log(responseArtworkIDs);


        for (let i = 0; i < responseArtworkIDs.length; i++) {              /////////// then get the objects

            let artwork = await retrieveObject(responseArtworkIDs[i]);

            artworks.push(artwork);
        }

        cache[q] = artworks;

        return artworks;

    } catch(error) {
        return null;
    }

}
