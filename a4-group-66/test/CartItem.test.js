import { shallowMount } from "@vue/test-utils";
import { chance } from "./jest-tuwien/chance";
import fetchMock from "fetch-mock-jest";
import flushPromises from "flush-promises";

import CartItem from "../src/components/CartItem";
import FramedArtwork from "../src/components/FramedArtwork";
import MuseumLabel from "../src/components/MuseumLabel";

describe("Cart Item component", () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it("uses framed artwork subcomponent", async () => {
    const cartItem = chance.cartItem();
    const artwork = chance.artwork(cartItem.artworkId);
    fetchMock.getOnce(/\/artworks\/[0-9]+/, artwork)
    const wrapper = shallowMount(CartItem, { stubs: ["router-link"], propsData: { cartItem: cartItem } });
    await flushPromises();
    const framedArtwork = wrapper.findComponent(FramedArtwork);
    expect(framedArtwork.exists()).toBe(true);
    expect(framedArtwork.props().artwork.image).toBe(artwork.image);
    expect(framedArtwork.props().artwork.title).toBe(artwork.title);
    expect(framedArtwork.props().config.printSize).toBe(cartItem.printSize);
    expect(framedArtwork.props().config.frameStyle).toBe(cartItem.frameStyle);
    expect(framedArtwork.props().config.matColor).toBe(cartItem.matColor);
  });

  it("uses museum label subcomponent", async () => {
    const cartItem = chance.cartItem();
    const artwork = chance.artwork(cartItem.artworkId);
    fetchMock.getOnce(/\/artworks\/[0-9]+/, artwork)
    const wrapper = shallowMount(CartItem, { stubs: ["router-link"], propsData: { cartItem: cartItem } });
    await flushPromises();
    const museumLabel = wrapper.findComponent(MuseumLabel);
    expect(museumLabel.exists()).toBe(true);
    expect(museumLabel.props().artwork.title).toBe(artwork.title);
    expect(museumLabel.props().artwork.artist).toBe(artwork.artist);
    expect(museumLabel.props().artwork.date).toBe(artwork.date);
  });

  it("shows correct frame description", async () => {
    const cartItem = chance.cartItem();
    const artwork = chance.artwork(cartItem.artworkId);
    fetchMock.getOnce(/\/artworks\/[0-9]+/, artwork)
    const wrapper = shallowMount(CartItem, { stubs: ["router-link"], propsData: { cartItem: cartItem } });
    await flushPromises();
    const frameDescription = (c) => {
      let s = { S: "Small", M: "Medium", L: "Large" }[c.printSize];
      s += ` print in a ${c.frameWidth / 10} cm`;
      s += ` ${c.frameStyle} frame`;
      if (c.matWidth > 0) {
        s += ` with a ${c.matWidth / 10} cm`;
        s += ` ${c.matColor} mat`;
      }
      s += ".";
      return s;
    }
    expect(wrapper.text()).toMatch(frameDescription(cartItem));
  });

  it("shows correct price", async () => {
    const cartItem = chance.cartItem();
    const artwork = chance.artwork(cartItem.artworkId);
    fetchMock.getOnce(/\/artworks\/[0-9]+/, artwork)
    const wrapper = shallowMount(CartItem, { stubs: ["router-link"], propsData: { cartItem: cartItem } });
    await flushPromises();
    expect(wrapper.text()).toMatch('€ ' + (cartItem.price / 100).toFixed(2));
  });

  it('"x" button removes item from shopping cart', async () => {
    const cartItem = chance.cartItem();
    const artwork = chance.artwork(cartItem.artworkId);
    fetchMock.getOnce(/\/artworks\/[0-9]+/, artwork)
    const storeMock = { dispatch: jest.fn() };
    const wrapper = shallowMount(CartItem, {
      stubs: ["router-link"],
      mocks: { $store: storeMock },
      propsData: { cartItem: cartItem },
    });
    await flushPromises();
    const removeButton = wrapper.get('button.cart-remove');
    await removeButton.trigger('click');
    const msg = `The test clicked on the remove button and expected the appropriate store action to be dispatched.
But either the action wasn't dispatched or the payload was wrong.`
    expect(storeMock.dispatch, msg).toHaveBeenCalledWith('removeFromCart', cartItem.cartItemId);
  });

});
