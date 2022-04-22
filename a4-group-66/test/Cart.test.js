import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import { chance } from "./jest-tuwien/chance";

import Cart from "../src/pages/Cart";
import CartItem from "../src/components/CartItem";

function mkMockStore() {
  const cart = chance.nn(chance.cartItem, 3, 5);
  return {
    state: { cart: cart },
    getters: {
      cartIsEmpty: cart.length == 0,
      cartTotal: cart.reduce((z, x) => z + x.price, 0)
    },
    commit: () => { },
    dispatch: () => { }
  }
}

describe("Cart page", () => {
  it("shows empty message if there are no items in the shopping cart", () => {
    const wrapper = shallowMount(Cart, {
      stubs: ['router-link'],
      mocks: {
        $store: {
          state: { cart: [] },
          getters: {
            cartIsEmpty: true,
            cartTotal: 0
          },
          commit: () => { },
          dispatch: () => { }
        }
      }
    });
    expect(wrapper.text()).toEqual('There are no items in your shopping cart.')
  });

  it("contains a cart item subcomponent for each item in the shopping cart", () => {
    const store = mkMockStore();
    const wrapper = shallowMount(Cart, { stubs: ['router-link'], mocks: { $store: store } });
    const cartItemComponents = wrapper.findAllComponents(CartItem);
    expect(cartItemComponents).toHaveLength(store.state.cart.length);
    for (let i = 0; i < store.state.cart.length; i++) {
      const cartItemComponent = cartItemComponents.at(i);
      const msg = `The CartItem subcomponent at position ${i} is not bound to the shopping cart item at position ${i}.`
      expect(cartItemComponent.props('cartItem'), msg).toEqual(store.state.cart[i]);
    }
    expect(wrapper.text()).not.toMatch('There are no items in your shopping cart.');
  });

  it("shows correct total price", () => {
    const store = mkMockStore();
    const wrapper = shallowMount(Cart, { stubs: ['router-link'], mocks: { $store: store } });
    const priceSpan = wrapper.get('#price-total');
    const total = (store.getters.cartTotal / 100).toFixed(2);
    expect(priceSpan.element.innerHTML).toBe(total);
  });

  it('"Checkout" button links to checkout page', () => {
    const store = mkMockStore();
    const wrapper = shallowMount(Cart, {
      stubs: {
        RouterLink: RouterLinkStub
      },
      mocks: {
        $store: store
      }
    });
    const checkoutButton = wrapper.findComponent(RouterLinkStub);
    expect(checkoutButton.exists(), 'Could not find checkout button router link component.').toBe(true);
    expect(checkoutButton.props('to')).toBe('/checkout');
  });
});
