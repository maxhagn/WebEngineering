/**
 * Saves an Object to the local storage
 *
 * @param cart the cart object which is going to be saved
 * @returns items
 */
function setLocalStorage(key, cart) {
    localStorage.setItem(key, JSON.stringify(cart));
    return cart;
}

function getLocalStorage(key) {
    var items = JSON.parse(localStorage.getItem(key) || "[]");
    return items;
}


function httpGetById(url, id)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url + id, false); // true for asynchronous
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.response);
}

function httpGetAll(url)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.response;
}

function setDescription(printSize, frameStyle, frameWidth, matColor, matWidth)  {
    var result = "";

    switch (printSize) {
        case 'S':
            result += "Small";
            break;
        case 'M':
            result += "Medium";
            break;
        case 'L':
            result += "Large";
            break;
    }

    result += " print in a ";
    result += frameWidth;
    result += " cm ";
    result += frameStyle;

    if ( matWidth === 0 ) {
        result += " frame.";
    }  else {
        result += " frame with a ";
        result += matWidth;
        result += " cm ";
        result += matColor;
        result += " mat.";

    }

    return result;
}

function deleteCartItem(x) {
    let items = getLocalStorage('cart');
    items.splice(x,1);
    setLocalStorage('cart', items);
    window.location.reload();
}