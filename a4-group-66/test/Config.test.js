import { shallowMount, createLocalVue } from '@vue/test-utils';
import { chance } from './jest-tuwien/chance';
import fetchMock from "fetch-mock-jest";
import flushPromises from "flush-promises";
import VueRouter from 'vue-router'

import routes from '../src/routes';
import Config from '../src/pages/Config';
import WidthSlider from "../src/components/config/WidthSlider";
import FrameStylePicker from "../src/components/config/FrameStylePicker";
import MatColorPicker from "../src/components/config/MatColorPicker";

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter({ routes })

function mkMockStore() {
  const framesList = chance.n(chance.frame, 3, 5);
  const frames = new Map();
  for (const frame of framesList) {
    frames.set(frame.style, frame);
  }
  const matsList = chance.n(chance.mat, 3, 5);
  const mats = new Map();
  for (const mat of matsList) {
    mats.set(mat.style, mat);
  }
  return {
    state: {
      frames: frames,
      mats: mats,
      cart: []
    },
    getters: {
      sortedFrames: framesList,
      sortedMats: matsList,
      cartIsEmpty: true,
      cartTotal: 0
    },
    commit: () => { },
    dispatch: jest.fn(() => Promise.resolve(true))
  }
}

function setup() {
  const store = mkMockStore();
  const artwork = chance.artwork();
  fetchMock.getOnce(/\/artworks\/[0-9]+/, artwork)
  const wrapper = shallowMount(Config, {
    localVue,
    router,
    stubs: ['router-link'],
    mocks: { $store: store },
    propsData: {
      artworkId: artwork.artworkId
    }
  });
  return { wrapper, artwork, store }
}

function mkConfig(store) {
  const frameStyles = store.getters.sortedFrames.map(x => x.style);
  const matColors = store.getters.sortedMats.map(x => x.color);
  const config = {
    printSize: chance.pickone(['S', 'M', 'L']),
    frameWidth: chance.integer({ min: 20, max: 50 }),
    frameStyle: chance.pickone(frameStyles),
    matWidth: chance.integer({ min: 20, max: 50 }),
    matColor: chance.pickone(matColors)
  }
  const frame = store.state.frames.get(config.frameStyle)
  const cF = (config.frameWidth / 10) * frame.cost;
  const cM = (config.matWidth / 10) * 5;
  const s = { S: 1, M: 2, L: 3.5 }[config.printSize];
  const price = (3000 + cF + cM) * s;
  return { config, price }
}

describe('Config page', () => {

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('contains frame width slider subcomponent', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const widthSliders = wrapper.findAllComponents(WidthSlider);
    expect(widthSliders.length, 'Unexpected number of WidthSlider components.').toBeGreaterThanOrEqual(1);

    const frameWidthSlider = widthSliders.at(0);
    expect(frameWidthSlider.props().min, 'Unexpected value for "min" prop.').toBe(20)
    expect(frameWidthSlider.props().max, 'Unexpected value for "max" prop.').toBe(50)
    expect(frameWidthSlider.props().label, 'Unexpected value for "label" prop.').toBe('Frame')
  });

  it('contains frame style picker subcomponent', async () => {
    const { wrapper } = setup();
    await flushPromises();
    const frameStylePicker = wrapper.findComponent(FrameStylePicker)
    expect(frameStylePicker.exists(), 'FrameStylePicker not found.').toBe(true)
  });

  it('contains mat width slider subcomponent', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const widthSliders = wrapper.findAllComponents(WidthSlider);
    expect(widthSliders.length, 'Unexpected number of WidthSlider components.').toBe(2);

    const matWidthSlider = widthSliders.at(1);
    expect(matWidthSlider.props().min, 'Unexpected value for "min" prop.').toBe(0)
    expect(matWidthSlider.props().max, 'Unexpected value for "max" prop.').toBe(100)
    expect(matWidthSlider.props().label, 'Unexpected value for "label" prop.').toBe('Mat')
  })

  it('contains mat color picker subcomponent', async () => {
    const { wrapper } = setup();
    await flushPromises();
    const matColorPicker = wrapper.findComponent(MatColorPicker)
    expect(matColorPicker.exists(), 'MatColorPicker not found.').toBe(true)
  });

  it('updates frame width reactively', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const widthSliders = wrapper.findAllComponents(WidthSlider);
    expect(widthSliders.length, 'Unexpected number of WidthSlider components.').toBeGreaterThanOrEqual(1);
    const frameWidthSlider = widthSliders.at(0);

    const xs = chance.unique(chance.integer, 10, { min: 20, max: 50 });
    for (const x of xs) {
      frameWidthSlider.vm.$emit('input', x);
      await wrapper.vm.$nextTick();
      const msg = "The test simulated a change of the frame width, but the corresponding data wasn't updated."
      expect(wrapper.vm.config.frameWidth, msg).toBe(x);
    }
  });

  it('updates frame style reactively', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const frameStylePicker = wrapper.findComponent(FrameStylePicker);
    expect(frameStylePicker.exists(), 'FrameStylePicker not found.').toBe(true)

    const frameStyles = chance.shuffle(wrapper.vm.$store.getters.sortedFrames.map(x => x.style))
    for (const frameStyle of frameStyles) {
      frameStylePicker.vm.$emit('input', frameStyle)
      await wrapper.vm.$nextTick();
      const msg = "The test simulated a change of the selected frame style, but the corresponding data wasn't updated."
      expect(wrapper.vm.config.frameStyle, msg).toBe(frameStyle);
    }
  });

  it('updates mat width reactively', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const widthSliders = wrapper.findAllComponents(WidthSlider);
    expect(widthSliders.length, 'Unexpected number of WidthSlider components.').toBe(2);
    const matWidthSlider = widthSliders.at(1);

    const xs = chance.unique(chance.integer, 10, { min: 0, max: 100 });
    for (const x of xs) {
      matWidthSlider.vm.$emit('input', x);
      await wrapper.vm.$nextTick();
      const msg = "The test simulated a change of the mat width, but the corresponding data wasn't updated."
      expect(wrapper.vm.config.matWidth, msg).toBe(x);
    }
  });

  it('updates mat color reactively', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const matColorPicker = wrapper.findComponent(MatColorPicker);
    expect(matColorPicker.exists(), 'MatColorPicker not found.').toBe(true)

    const matColors = chance.shuffle(wrapper.vm.$store.getters.sortedMats.map(x => x.color))
    for (const matColor of matColors) {
      matColorPicker.vm.$emit('input', matColor)
      await wrapper.vm.$nextTick();
      const msg = "The test simulated a change of the selected mat color, but the corresponding data wasn't updated."
      expect(wrapper.vm.config.matColor, msg).toBe(matColor);
    }
  });

  it('updates price reactively', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const priceSpan = wrapper.get('#price');
    for (let i = 0; i < 10; i++) {
      const { config, price } = mkConfig(wrapper.vm.$store);
      const priceText = (price / 100).toFixed(2);
      wrapper.vm.$data.config = config;
      await wrapper.vm.$nextTick();
      const msg = 'The test changed the config data, but the price on the page did not change as expected.'
      expect(priceSpan.text(), msg).toBe('€ ' + priceText)
    }
  });

  it('"Add to Cart" button adds an item to the shopping cart', async () => {
    const { wrapper, artwork, store } = setup();
    await flushPromises();

    const { config } = mkConfig(wrapper.vm.$store);
    wrapper.vm.$data.config = config;

    const addToCartButton = wrapper.get('button.buy');
    await addToCartButton.trigger('click');

    const product = { artworkId: artwork.artworkId, ...config };

    const msg = `The test clicked on the "Add to Cart" button and expected the appropriate store action to be dispatched.
But either the action wasn't dispatched or the payload was wrong.`
    expect(store.dispatch, msg).toHaveBeenCalledWith('addToCart', product);
  });

  it('redirects to cart page after adding an item to the shopping cart', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const { config } = mkConfig(wrapper.vm.$store);
    wrapper.vm.$data.config = config;

    const addToCartButton = wrapper.get('button.buy');
    await addToCartButton.trigger('click');

    await flushPromises();
    expect(wrapper.vm.$route.path).toBe('/cart')
  });
});