const BLING_BASE_URL = 'https://web-engineering.big.tuwien.ac.at/s20/bling'

/**
 * Confirms a payment intent with Bling to execute a payment transaction.
 * 
 * @param {string} paymentIntentId The identifier of the payment intent.
 * @param {string} clientSecret The client secret of the payment intent.
 * @param {Object} card Customer credit card information.
 * @returns {boolean} Whether the payment succeeded or not.
 */
export async function confirmPaymentIntent(paymentIntentId, clientSecret, card) {
    console.log(card);
    const res = await fetch(BLING_BASE_URL + '/payment_intents/'+paymentIntentId+'/confirm', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(card)
    })
    /*
    if (!res.ok || typeof(res) == undefined) {
        return null;
    }*/
    return res.json();
}
