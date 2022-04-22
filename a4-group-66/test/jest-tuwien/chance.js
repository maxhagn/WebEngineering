const Chance = require('chance');
const chance = new Chance(__SEED__);
chance.mixin({
    'nn': (fn, n1, n2, opts = {}) => chance.unique(fn, chance.integer({ min: n1, max: n2 }), opts),
    'cartItem': () => {
        const matWidth = chance.integer({ min: 0, max: 100 });
        const item = {
            cartItemId: chance.integer({ min: 1, max: 100 }),
            price: chance.integer({ min: 3000, max: 12500 }),
            artworkId: chance.artworkId(),
            printSize: chance.pickone(['S', 'M', 'L']),
            frameStyle: chance.word(),
            frameWidth: chance.integer({ min: 20, max: 50 }),
            matWidth: matWidth
        };
        if (matWidth > 0) {
            item.matColor = chance.word();
        }
        return item;
    },
    'artwork': (artworkId = null) => {
        return {
            artworkId: artworkId ?? chance.artworkId(),
            title: chance.sentence({ words: chance.integer({ min: 1, max: 10 }), punctuation: false }),
            artist: chance.name({ middle: chance.bool() }),
            date: chance.year({ min: 1400, max: 2020 }).toString(),
            image: 'https://example.com/images/' + chance.string({ length: 6, casing: 'upper', alpha: true, numeric: true }) + '.jpg'
        }
    },
    'artworkId': () => {
        return chance.integer({ min: 1, max: 1000000 })
    },
    'shippingDestination': () => {
        const n = chance.integer()
        return {
            country: new Chance(n).country(),
            displayName: new Chance(n).country({full: true}),
            cost: chance.integer({ min: 100, max: 10000 })
        }
    },
    'customer': () => {
        return {
            email: chance.email(),
            shipping_address: chance.shippingAddress()
        }
    },
    'shippingAddress': () => {
        return {
            name: chance.name(),
            address: chance.address(),
            city: chance.city(),
            country: chance.country(),
            postal_code: chance.postcode(),
            phone: chance.phone()
        }
    },
    'card': () => {
        return {
            cardholder: chance.name(),
            cardnumber: chance.cc(),
            exp_month: +chance.exp_month(),
            exp_year: +chance.exp_year(),
            cvc: chance.integer({ min: 100, max: 999 })
        }
    },
    'blingPaymentIntentId': () => {
        return 'pi_' + chance.nanoid()
    },
    'blingClientSecret': () => {
        return 'cs_' + chance.nanoid()
    },
    'nanoid': () => {
        return chance.string({ pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-', length: 21 });
    },
    'frame': () => {
        const style = chance.word();
        return {
            style: style,
            label: chance.capitalize(style),
            slice: chance.integer({ min: 10, max: 300 }),
            cost: chance.integer({ min: 50, max: 200 }),
            thumbImage: chance.url(),
            borderImage: chance.url()
        }
    },
    'mat': () => {
        const color = chance.word();
        return {
            color: color,
            label: chance.capitalize(color),
            hex: chance.color({ format: 'hex' })
        }
    }
});

module.exports = { chance };