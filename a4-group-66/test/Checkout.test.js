import { shallowMount, createLocalVue } from "@vue/test-utils";
import { chance } from "./jest-tuwien/chance";
import fetchMock from "fetch-mock-jest";
import flushPromises from "flush-promises";
import VueRouter from 'vue-router'

import routes from '../src/routes';
import Checkout from "../src/pages/Checkout";

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter({ routes })

const BLING_BASE_URL = 'https://web-engineering.big.tuwien.ac.at/s20/bling'

function mountPage(cart = null) {
  cart = cart ?? chance.nn(chance.cartItem, 3, 5);
  const destinationsList = chance.nn(chance.shippingDestination, 3, 5);
  const destinations = new Map();
  for (const destination of destinationsList) {
    destinations.set(destination.country, destination);
  }
  const store = {
    state: {
      destinations: destinations,
      cart: cart
    },
    getters: {
      sortedDestinations: destinationsList,
      cartIsEmpty: cart.length == 0,
      cartTotal: cart.reduce((z, x) => z + x.price, 0)
    },
    commit: () => { },
    dispatch: () => { }
  }
  const wrapper = shallowMount(Checkout, {
    localVue,
    router,
    stubs: ['router-link'],
    mocks: {
      $store: store
    }
  });
  return wrapper;
}

function fillForm(wrapper) {
  const customer = chance.customer();
  customer.shipping_address.country = chance.pickone(wrapper.vm.$store.getters.sortedDestinations).country;
  const card = chance.card();

  wrapper.get('#email').element.value = customer.email;
  wrapper.get('#email').trigger('input');
  wrapper.get('#name').element.value = customer.shipping_address.name;
  wrapper.get('#name').trigger('input');
  wrapper.get('#address').element.value = customer.shipping_address.address;
  wrapper.get('#address').trigger('input');
  wrapper.get('#city').element.value = customer.shipping_address.city;
  wrapper.get('#city').trigger('input');
  wrapper.get('#country').element.value = customer.shipping_address.country;
  wrapper.get('#country').trigger('change');
  wrapper.get('#postalcode').element.value = customer.shipping_address.postal_code;
  wrapper.get('#postalcode').trigger('input');
  wrapper.get('#phone').element.value = customer.shipping_address.phone ?? "";
  wrapper.get('#phone').trigger('input');
  wrapper.get('#cardholder').element.value = card.cardholder;
  wrapper.get('#cardholder').trigger('input');
  wrapper.get('#cardnumber').element.value = card.cardnumber;
  wrapper.get('#cardnumber').trigger('input');
  wrapper.get('#cardexpiry').element.value = card.exp_month + '/' + card.exp_year;
  wrapper.get('#cardexpiry').trigger('input');
  wrapper.get('#cardcvc').element.value = card.cvc;
  wrapper.get('#cardcvc').trigger('input');

  const checkoutResponse = {
    payment_intent_id: chance.blingPaymentIntentId(),
    client_secret: chance.blingClientSecret(),
    amount: chance.integer({ min: 100 }),
    currency: 'eur'
  }

  const blingEndpoint = BLING_BASE_URL + '/payment_intents/' + checkoutResponse.payment_intent_id + '/confirm';
  const blingResponse = {
    id: checkoutResponse.payment_intent_id,
    client_secret: checkoutResponse.client_secret,
    amount: checkoutResponse.amount,
    currency: 'eur',
    created_at: new Date(),
    status: 'succeeded',
    card: {
      cardholder: card.cardholder,
      last4: card.cardnumber.slice(-4),
      exp_month: card.exp_month,
      exp_year: card.exp_year
    }
  }

  return { customer, card, checkoutResponse, blingEndpoint, blingResponse }
}

describe('Checkout page', () => {

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('redirects to cart page if shopping cart is empty', async () => {
    const wrapper = mountPage([])
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.$route.path).toBe('/cart');
  });

  it('displays correct subtotal', () => {
    const wrapper = mountPage()
    const expectedSubtotal = (wrapper.vm.$store.getters.cartTotal / 100).toFixed(2);
    expect(wrapper.get('#price-subtotal').text()).toBe(expectedSubtotal);
  });

  it('updates shipping costs reactively', async () => {
    const wrapper = mountPage()
    for (const destination of wrapper.vm.$store.getters.sortedDestinations) {
      wrapper.get('#country').element.value = destination.country;
      await wrapper.get('#country').trigger('change');
      const expectedCost = (destination.cost / 100).toFixed(2);
      const msg = `\
The test used the following random shipping destinations:
${JSON.stringify(wrapper.vm.$store.getters.sortedDestinations, null, 2)}\n
It selected the country "${destination.country}" and expected the displayed shipping cost to be ${expectedCost}.`
      expect(wrapper.get('#price-shipping').text(), msg).toEqual(expectedCost);
    }
  });

  it('updates the total price reactively', async () => {
    const wrapper = mountPage()
    for (const destination of wrapper.vm.$store.getters.sortedDestinations) {
      wrapper.get('#country').element.value = destination.country;
      await wrapper.get('#country').trigger('change');
      const expectedTotal = ((wrapper.vm.$store.getters.cartTotal + destination.cost) / 100).toFixed(2);
      const msg = `\
The test used a random cart with a subtotal of ${wrapper.vm.$store.getters.cartTotal} euro cents
and selected a random shipping destination with a cost of ${destination.cost} euro cents.
It expected the displayed total price to be ${expectedTotal} euro.`
      expect(wrapper.get('#price-total').text(), msg).toEqual(expectedTotal);
    }
  });

  it('implements payment process (success)', async () => {
    const wrapper = mountPage()
    const { customer, card, checkoutResponse, blingEndpoint, blingResponse } = fillForm(wrapper);

    fetchMock.postOnce(/\/cart\/checkout/, checkoutResponse)
    fetchMock.postOnce(blingEndpoint, blingResponse)
    fetchMock.mock('*', 404)

    await wrapper.get('#checkout-form').trigger('submit');
    await flushPromises()

    const msg = `
The test filled out the form with valid customer and credit card information and submitted it.
It expected requests to the Artmart backend and the Bling service.
\nWhat actually happened: `

    expect(fetchMock, msg + 'There was no backend request.').toHavePosted(/\/cart\/checkout/);

    const artmartPayload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(artmartPayload, msg + 'The payload sent to the backend was incorrect.').toEqual(customer);

    expect(fetchMock, msg + 'There was no Bling request.').toHavePosted(blingEndpoint);

    const blingPayload = JSON.parse(fetchMock.mock.calls[1][1].body);
    const expectedBlingPayload = { client_secret: checkoutResponse.client_secret, ...card };
    expect(blingPayload, msg + 'The payload sent to Bling was incorrect.').toEqual(expectedBlingPayload);

    expect(fetchMock.mock.calls, msg + 'There were more requests than expected.').toHaveLength(2)
  });

  it('implements payment process (failure 1)', async () => {
    const wrapper = mountPage()
    const { customer } = fillForm(wrapper);

    fetchMock.postOnce(/\/cart\/checkout/, 400)
    fetchMock.mock('*', 404)

    await wrapper.get('#checkout-form').trigger('submit');
    await flushPromises()

    const msg = `
The test filled out the form with valid customer and credit card information and submitted it.
It expected a request to the Artmart backend and prepared it to fail, after which it expected no further requests.
\nWhat actually happened: `

    expect(fetchMock, msg + 'There was no backend request.').toHavePosted(/\/cart\/checkout/);

    const artmartPayload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(artmartPayload, msg + 'The payload sent to the backend was incorrect.').toEqual(customer);

    expect(fetchMock.mock.calls, msg + 'There were more requests than expected.').toHaveLength(1)
  });

  it('implements payment process (failure 2)', async () => {
    const wrapper = mountPage()
    const { customer, card, checkoutResponse, blingEndpoint, blingResponse } = fillForm(wrapper);
    blingResponse.status = 'failed';
    blingResponse.payment_error = chance.pickone(['card_expired', 'card_declined']);

    fetchMock.postOnce(/\/cart\/checkout/, checkoutResponse)
    fetchMock.postOnce(blingEndpoint, { status: 402, body: blingResponse })
    fetchMock.mock('*', 404)

    await wrapper.get('#checkout-form').trigger('submit');
    await flushPromises()

    const msg = `
The test filled out the form with valid customer and credit card information and submitted it.
It expected requests to the Artmart backend and the Bling service, and prepared the Bling request to fail.
\nWhat actually happened: `

    expect(fetchMock, msg + 'There was no backend request.').toHavePosted(/\/cart\/checkout/);

    const backendPayload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(backendPayload, msg + 'The payload sent to the backend was incorrect.').toEqual(customer);

    expect(fetchMock, msg + 'There was no Bling request.').toHavePosted(blingEndpoint);

    const blingPayload = JSON.parse(fetchMock.mock.calls[1][1].body);
    const expectedBlingPayload = { client_secret: checkoutResponse.client_secret, ...card };
    expect(blingPayload, msg + 'The payload sent to Bling was incorrect.').toEqual(expectedBlingPayload);

    expect(fetchMock.mock.calls, msg + 'There were more requests than expected.').toHaveLength(2)
  });

  it('shows message while processing payment', async () => {
    const wrapper = mountPage()
    const { checkoutResponse } = fillForm(wrapper);

    fetchMock.postOnce(/\/cart\/checkout/, checkoutResponse, { delay: 10000 })
    fetchMock.mock('*', 404)

    await wrapper.get('#checkout-form').trigger('submit');

    expect(wrapper.text()).toEqual('Processing payment...')

    wrapper.destroy();
  });

  it('shows success message when payment succeeds', async () => {
    const wrapper = mountPage()
    const { checkoutResponse, blingEndpoint, blingResponse } = fillForm(wrapper);

    fetchMock.postOnce(/\/cart\/checkout/, checkoutResponse)
    fetchMock.postOnce(blingEndpoint, blingResponse)
    fetchMock.mock('*', 404)

    await wrapper.get('#checkout-form').trigger('submit');
    await flushPromises()

    expect(wrapper.text()).toEqual('Your payment was completed successfully. Thank you for your purchase! ← Back to Search')
  });

  it('shows error message when payment fails (1)', async () => {
    const wrapper = mountPage()
    fillForm(wrapper);

    fetchMock.postOnce(/\/cart\/checkout/, 400)

    expect(wrapper.text(), 'The error message was shown before there was an error.')
      .not.toMatch('An error occurred during payment. Please try again.')

    await wrapper.get('#checkout-form').trigger('submit');
    await flushPromises()

    expect(wrapper.text()).toMatch('An error occurred during payment. Please try again.')
  });

  it('shows error message when payment fails (2)', async () => {
    const wrapper = mountPage()
    const { checkoutResponse, blingEndpoint, blingResponse } = fillForm(wrapper);
    blingResponse.status = 'failed';
    blingResponse.payment_error = chance.pickone(['card_expired', 'card_declined']);

    fetchMock.postOnce(/\/cart\/checkout/, checkoutResponse)
    fetchMock.postOnce(blingEndpoint, { status: 402, body: blingResponse })
    fetchMock.mock('*', 404)

    expect(wrapper.text(), 'The error message was shown before there was an error.')
      .not.toMatch('An error occurred during payment. Please try again.')

    await wrapper.get('#checkout-form').trigger('submit');
    await flushPromises()

    expect(wrapper.text()).toMatch('An error occurred during payment. Please try again.')

  });

});