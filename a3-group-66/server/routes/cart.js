/**
 * This module contains the routes under /cart
 */

'use strict';

/* --- Imported Modules --- */
const express = require('express');
const routes = express.Router();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const {nanoid} = require('nanoid');
const {calculatePrice} = require("../utils/price");

/* --- CartItem - Object ---*/
class CartItem {
    constructor(cartItemId, artworkId, printSize, frameStyle, frameWidth, matColor, matWidth) {
        this.cartItemId = cartItemId;
        this.artworkId = artworkId;
        this.printSize = printSize;
        this.frameStyle = frameStyle;
        this.frameWidth = frameWidth;
        this.matColor = matColor;
        this.matWidth = matWidth;
        this.price = calculatePrice(printSize, frameStyle, frameWidth, matWidth);
    }
}

/* --- Session Storage --- */
/* in-memory Data-Structure */
let sessionStorage = [];
let paymentIntentStorage = [];
let paymentUserStorage = [];


/* ----- Initial GET-Request -----
 * Client-request: GET /cart
 * Responds with an empty cart as well as a newly created sessionID
 * Input : '/' --> this directory
 * */
routes.get('/', async (req, res) => {

    let sessionId = req.cookies.sessionId;
    console.log(sessionId);

    /* - checking weather a sessionID already exists - */
    if (!sessionId) {
        /* creating a new sessionID */
        sessionId = nanoid();
        console.log(`new : ${sessionId}`);
        /* reservation of space in our session Storage */
        sessionStorage[sessionId] = [];
        /* Saving the sessionID as a cookie */
        res.cookie('sessionId', sessionId, {path: '/cart'});
        /* responding with an empty cart & sessionID as a cookie */
        res.status(200);
        res.json([]);
    } else {
        /* - checking weather we the existing sessionID points to a valid cart - */
        try {
            /* - checking weather the existing cart is empty - */
            if (!sessionStorage[sessionId].length) {
                res.json([]);
                res.status(200);
                res.end();
            } else {
                res.json(JSON.parse(sessionStorage[sessionId]));
                res.status(200);
                res.end();
            }
        } catch (e) {
            /* SessionID was invalid */
            console.log("SessionID was invalid");
            res.status(403);
            res.end();
        }
    }

});

/* ----- POST-Request -----
 * Adds an item to the shopping cart
 * Responds with a status-code
 * */
routes.post('/', async (req, res) => {

    /* --- Validating Input --- */

    /* Retrieving Cart Information */
    const sessionId = req.cookies.sessionId;

    /* - checking weather a valid sessionID exists - */
    if (!sessionId) {
        /* SessionID was invalid, respond with "Forbidden" */
        console.log(`SessionId was invalid (${sessionId}) `);
        res.status(403);
        return res.end();
    }


    /* --- Updating the Cart --- */
    try {

        if (!sessionStorage[sessionId]) {
            console.log(`SessionId was invalid (${sessionId}) `);
            res.status(403);
            return res.end();
        }

        const validation = validateRequest(req.body);
        /* - checking weather any of the required fields are missing or invalid - */
        if (Object.keys(validation.errors).length >= 1) {
            /* In case the input wasn't validated, respond with "Bad Request" */
            console.log("Request couldn't be validated");
            console.log("---------------------------------------------------------------------------");
            res.status(400);
            res.json({"message": validation["message"], errors: validation["errors"]})
        }



        /* - checking weather the existing cart is empty - */
        let items = !sessionStorage[sessionId].length ? [] : JSON.parse(sessionStorage[sessionId]);


        /* creating a new CartItem (with a new ItemID) */
        const item = new CartItem(generateItemId(items), req.body.artworkId, req.body.printSize, req.body.frameStyle, req.body.frameWidth, req.body.matColor, req.body.matWidth);

        /* Saving the newly generated Item to the Cart of the Client */
        items.push(item);
        try {
            sessionStorage[sessionId] = JSON.stringify(items);
        } catch (e) {
            /* In case updated Cart can't be saved, respond with "Forbidden" */
            console.log(`Unable to save the updated Cart for ${sessionId}`);
            //console.log(`Error : ${e}`);
            res.status(403);
            return res.end();
        }

        /* In case updating the Cart was a success */
        console.log("Updating the Cart was a success");
        res.status(201);
        return res.end()

    } catch (e) {
        /* Cart doesn't exist */
        console.log("Cart doesn't exist");
        res.status(403);
        return res.end()
    }
});

/* generates an ID based on the number of items currently present in the cart */
function generateItemId(items) {
    /* items.slice(-1)[0] --> Last Element in the Cart */
    return !items.length ? 1 : 1 + items.slice(-1)[0].cartItemId;
}

/* - checking weather any of the required fields are missing or invalid - */
function validateRequest(items) {

    let validation = {};
    validation.message = "Validation failed";
    validation.errors = {};


    /* Artwork */
    if (items.artworkId === undefined) {
        validation.errors["artworkId"] = "missing";
    } else if (typeof items.artworkId !== "number") {
        validation.errors["artworkId"] = "invalid";
    }
    /* PrintSize */
    if (items.printSize === undefined) {
        validation.errors["printSize"] = "missing";
    } else if (items.printSize !== "S" && items.printSize !== "M" && items.printSize !== "L") {
        validation.errors["printSize"] = "invalid";
    }
    /* FrameStyle */
    if (items.frameStyle === undefined) {
        validation.errors["frameStyle"] = "missing";
    }
    /* FrameWidth */
    if (items.frameWidth === undefined) {
        validation.errors["frameWidth"] = "missing";
    } else if (!(items.frameWidth >= 20 && items.frameWidth <= 50)) {
        validation.errors["frameWidth"] = "invalid";
    }
    /* MatWidth */
    if (items.matWidth === undefined) {
        validation.errors["matWidth"] = "missing";
    } else if (!(items.matWidth >= 0 && items.matWidth <= 100)) {
        validation.errors["matWidth"] = "invalid";
    }
    /* MatColor */
    if (items.matWidth !== 0) {
        if (items.matColor === undefined) {
            validation.errors["matColor"] = "missing";
        }
    }

    const frames = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/frames.json')));
    for (let frame of frames) {
        if (frame.id === items.frameStyle) {
            console.log("test test test");
            delete validation.errors["frameStyle"];
            break;
        } else {
            validation.errors["frameStyle"] = 'invalid';
        }
    }

    const colors = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/mat-colors.json')));
    if (items.matWidth > 0) {
        for (let color of colors) {
            if (color.id === items.matColor) {
                delete validation.errors["matColor"];
                break;
            } else {
                validation.errors["matColor"] = "invalid";
            }
        }
    }

    return validation;

}


/* ----- Delete-Request (/cart) -----
 * Clears the shopping cart associated with the session
 * Responds with a status-code
 * */
routes.delete('/', async (req, res) => {

    /* Retrieving Cart Information */
    const sessionId = req.cookies.sessionId;

    /* - checking weather a valid sessionID exists - */
    if (!sessionId || !sessionId.length || typeof sessionId !== "string") {
        /* SessionID was invalid, respond with "Forbidden" */
        console.log(`SessionId was invalid (${sessionId})`);
        res.status(403);
        return res.end();
    }

    try {
        /* clearing the cart */
        if (sessionStorage[sessionId].length) {
            sessionStorage[sessionId] = [];
            /* clearing the cart was a success */
            console.log("clearing the cart was a success");
            res.status(204);
        } else {
            console.log(`No cart was found for ${sessionId}`);
            res.status(403);
        }
        return res.end();
    } catch (e) {
        /* Cart could't be cleared */
        console.log("Cart could't be cleared");
        res.status(403);
        return res.end()
    }

});

/* ----- Delete Request (/cart/{id}) -----
* Removes the given item from the cart
* Responds with a status-code
* */
routes.delete('/:id', async (req, res) => {

    /* retrieving ItemID from queue */
    let sessionId = req.cookies.sessionId;
    let itemId = parseInt(req.params.id);
    console.log(`Item ID : ${itemId}`);

    /* --- Validation of Inputs --- */

    /* - checking weather a valid ItemID was retrieved - */
    if (isNaN(itemId)) {
        console.log("Invalid ItemID");
        res.status(403);
        return res.end()
    }


    /* - checking weather a valid sessionID exists - */
    if (!sessionId) {
        /* SessionID was invalid */
        console.log(`SessionId was invalid (${sessionId})`);
        res.status(403);
        return res.end();
    }

    /* --- Deleting the item from cart --- */
    try {

        if (!sessionStorage[sessionId].length) {
            console.log(`Empty cart for (${sessionId})`);
            res.status(403);
            return res.end();
        }

        const items = JSON.parse(sessionStorage[sessionId]);

        /* checking weather the to be deleted element exists */
        let flag = false;
        for (let item of items) if (parseInt(item.cartItemId) === itemId) flag = true;
        if (!flag) {
            console.log(`Element wasn't found (${itemId})`);
            res.status(404);
            return res.end();
        }
        console.log(`Element was found  (${itemId})`);

        /* Updating the cart */
        try {
            sessionStorage[sessionId] = JSON.stringify(items.filter(item => {
                return (parseInt(item.cartItemId) !== itemId);
            }));
        } catch (e) {
            /* In case updated Cart can't be saved, respond with "Forbidden" */
            console.log(`Unable to save the updated Cart for ${sessionID}`);
            console.log(`Error : ${e}`);
            res.status(403);
            return res.end()
        }

        /* Deleting the item was a success */
        console.log(`Deleting the item ${itemId} was a success`);
        res.status(204);
        return res.end();

    } catch (e) {
        /* if Something else went wrong respond with Forbidden */
        console.log("previously unchecked Exception occurred ");
        res.status(403);
        return res.end()
    }
});

/* ----- GET Request (/cart/{id}) -----
 * Returns a specific shopping cart item
 * */
routes.get('/:id', async (req, res) => {

    /* retrieving ItemID from queue */
    let itemId = parseInt(req.params.id);
    let sessionId = req.cookies.sessionId;

    /* --- Validation of Inputs --- */

    /* - checking weather a valid ItemID was retrieved - */
    if (isNaN(itemId)) {
        console.log("Invalid ItemID");
        res.status(403);
        return res.end()
    }

    /* - checking weather a valid sessionID exists - */
    if (!sessionId || !sessionId.length) {
        /* SessionID was invalid */
        console.log(`SessionId was invalid (${sessionId})`);
        res.status(403);
        return res.end()
    }

    /* --- Retrieving the Item --- */
    try {

        if (!sessionStorage[sessionId].length) {
            console.log(`Empty cart for (${sessionId})`);
            res.status(404);
            return res.end();
        }

        const items = JSON.parse(sessionStorage[sessionId]);

        /* checking weather the to be deleted element exists */
        let flag = false;
        for (let item of items) if (parseInt(item.cartItemId) === itemId) flag = true;
        if (!flag) {
            console.log(`Element wasn't found (${itemId})`);
            res.status(404);
            return res.end();
        }
        console.log(`Element was found  (${itemId})`);

        /* Filtering the cart for the item we are looking for */
        const matchingItem = items.filter(item => {
            return parseInt(item.cartItemId) === itemId
        });
        res.json(matchingItem[0]);
    } catch (e) {
        /* if Something else went wrong respond with Forbidden */
        console.log("previously unchecked Exception occurred ");
        res.status(403);
        return res.end()
    }
});


let BLING_API_KEY = "ak_wes20a3_066";
let ARTMART_BASE_URL = "http://localhost:3000";

routes.post('/checkout', async (req, res) => {

        /* - checking weather a valid sessionID exists - */
        if (!req.cookies.sessionId || !(req.cookies.sessionId in sessionStorage)) {
            /* SessionID was invalid */
            console.log(`SessionId was invalid (${req.cookies.sessionId})`);
            console.log(sessionStorage);

            res.status(403);
            console.log(403);
            return res.end();
        }else{
            //sessionStorage[req.cookies.sessionId] = [new CartItem(1, 1, "M", "classic", 40, "", 40),new CartItem(2, 1, "M", "classic", 40, "", 40)];
            if(!sessionStorage[req.cookies.sessionId].length){
                res.status(400);
                console.log(400);
                return res.end();
            }
            var storage = JSON.parse(sessionStorage[req.cookies.sessionId]);

            console.log(req.body);

            if(!storage.length){
                res.status(400);
                console.log(400);
                return res.end();
            }

            for (let item of storage){

                if(!validateRequest(item)){
                    res.status(400);
                    console.log(400);
                    return res.end();
                }

            }

            let price = 0;
            for (let item of storage){
                console.log(item);
                price = price + item.price;
            }

            var intent = {"amount": price, "currency": "eur", "webhook": process.env.ARTMART_BASE_URL+"/cart/checkout/payment-update"};

            let base64 = require('base-64');
            var url = 'https://web-engineering.big.tuwien.ac.at/s20/bling/payment_intents';
            //url = 'https://en3mzal0vqo9v.x.pipedream.net/s20/bling/payment_intents';
            global.Headers = fetch.Headers;

            const response = await fetch(url, {
               method: 'POST',
               body: JSON.stringify(intent),
               headers: new Headers({
                 'Authorization': 'Basic '+ Buffer.from(process.env.BLING_API_KEY+":").toString('base64'),
                 'Content-Type': 'application/json',
                 'Accept': 'application/json'
               })
             });

            if(response.status != 200) {
                console.log(JSON.stringify(intent));
                console.log(response);
                res.status(400);
                return res.end();
            }

            const paymentIntent = await response.json();
            console.log(JSON.stringify(intent));
            paymentIntentStorage[response.id] = paymentIntent;
            paymentUserStorage[response.id] = req.body;
            res.status(200);
            console.log(200);
            res.setHeader('Content-Type', 'application/json');

            var retJson = {
                  "payment_intent_id": response.id,
                  "client_secret": response.client_secret,
                  "amount": response.amount,
                  "currency": response.currency
              };

            return res.send(retJson);

        }

 });

/**
async function createPaymentIntent(intent) {

}*/

var filename_counter = 1;

routes.post('/checkout/payment-update', async (req, res) => {

    if (typeof paymentIntentStorage[req.body.payment_intent.id] === "undefined" || typeof paymentUserStorage[req.body.payment_intent.id] === "undefined" || !paymentIntentStorage[req.body.payment_intent.id].length || !paymentUserStorage[req.body.payment_intent.id].length) {
        console.log(400);
        res.status(400);
        return res.end();
    }

    console.log(paymentIntentStorage);
    console.log(paymentUserStorage);
    //Create receipt
    var receipt = {};
    receipt.order_date = req.body.created_at;
    receipt.email = paymentUserStorage[req.body.payment_intent.id].email;
    receipt.shipping_address = paymentUserStorage[req.body.payment_intent.id].shipping_address;
    receipt.card = req.body.payment_intent.card;
    receipt.amount = req.body.payment_intent.amount;
    receipt.currency = req.body.payment_intent.currency;
    receipt.cart = [];//JSON.parse(sessionStorage[req.cookies.sessionId]);

    fs.writeFile(path.join(__dirname, '../orders/order-000'+filename_counter+'.json'), JSON.stringify(receipt), { flag: 'wx' }, function (err) {
        if (err) throw err;
        console.log("It's saved!");
        filename_counter += 1
    });
    res.sendStatus(200);
    console.log(200);
    return res.end();
});

module.exports = routes;
const app = express();

module.exports = routes;