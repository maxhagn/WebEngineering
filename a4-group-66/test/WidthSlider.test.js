import { mount } from '@vue/test-utils';
import { chance } from './jest-tuwien/chance';

import WidthSlider from '../src/components/config/WidthSlider';

async function testEvent(inputType, fieldEvent) {
  const wrapper = mount(WidthSlider, {
    propsData: { min: 0, max: 100, value: 0, label: "Test" }
  });
  const field = wrapper.get(`input[type="${inputType}"]`);

  const xs = chance.n(chance.integer, 10, { min: 0, max: 100 });
  for (const [i, x] of xs.entries()) {
    const y = (x / 10).toString();
    field.element.value = y;
    await field.trigger(fieldEvent);
    const inputEvents = wrapper.emitted('input');

    const msg = `The test changed the ${inputType} field's value to "${y}"
and expected the component to emit an "input" event with an integer payload of ${x}.
What actually happened: `;

    const noEvent = 'No "input" event was emitted.'
    expect(inputEvents, msg + noEvent).toBeTruthy()
    expect(inputEvents, msg + noEvent).toHaveLength(i + 1);

    const payload = inputEvents.flat()[i];
    expect(typeof payload, msg + `The payload was of type ${typeof payload}.`).toBe('number');
    expect(payload, msg + `The payload was ${payload}.`).toBe(x);
  }
}

function testProp(inputType) {
  const x = chance.integer({ min: 0, max: 100 })
  const y = (x / 10).toString()
  const wrapper = mount(WidthSlider, {
    propsData: { min: 0, max: 100, value: x, label: "Test" }
  });
  const field = wrapper.get(`input[type="${inputType}"]`);

  const msg = `The test mounted the component with the "value" prop set to ${x}
and expected the ${inputType} field's value to be "${y}".
What actually happened: `

  expect(field.element.value, msg + `The ${inputType} field's value was "${field.element.value}".`).toEqual(y);
}

describe('Width Slider component', () => {
  it('uses "value" prop to set initial text field value', () => {
    testProp('number')
  });

  it('uses "value" prop to set range slider value', () => {
    testProp('range')
  });

  it('emits "input" event when the text field value changes', async () => {
    await testEvent('number', 'change')
  });

  it('emits "input" event when the range slider value changes', async () => {
    await testEvent('range', 'input')
  });

  it('ensures values are within range', async () => {
    const min = 30;
    const max = 50;
    const wrapper = mount(WidthSlider, {
      propsData: { min: min, max: max, value: min, label: "Test" }
    });
    const field = wrapper.get('input[type="number"]');

    const xs = [];
    for (let i = 0; i < 10; i++) {
      if (chance.bool()) {
        xs[i] = [chance.integer({ min: max - 1 }), max]
      } else {
        xs[i] = [chance.integer({ max: min - 1 }), min]
      }
    }

    for (const [i, [x, z]] of xs.entries()) {
      const y = (x / 10).toString();
      field.element.value = y;
      await field.trigger('change');
      const inputEvents = wrapper.emitted('input');

      const msg = `The test mounted the component with the "min" and "max" props set to ${min} and ${max}, respectively.
It then changed the number field's value to "${y}"
and expected the component to emit an "input" event with an integer payload of ${z}.
What actually happened: `

      const noEvent = 'No "input" event was emitted.'
      expect(inputEvents, msg + noEvent).toBeTruthy()
      expect(inputEvents, msg + noEvent).toHaveLength(i + 1);

      const payload = inputEvents.flat()[i];
      expect(typeof payload, msg + `The payload was of type ${typeof payload}.`).toBe('number');
      expect(payload, msg + `The payload was ${payload}.`).toBe(z);
    }
  });

  it('performs decimal truncation', async () => {
    const wrapper = mount(WidthSlider, {
      propsData: { min: 0, max: 100, value: 0, label: "Test" }
    });
    const field = wrapper.get('input[type="number"]');

    const ys = chance.n(chance.floating, 10, { min: 0, max: 10 });
    for (const [i, y] of ys.entries()) {
      const x = Math.trunc(y * 10);
      field.element.value = y.toString();
      await field.trigger('change');
      const inputEvents = wrapper.emitted('input');

      const msg = `The test changed the number field's value to "${y}"
and expected the component to emit an "input" event with an integer payload of ${x}.
What actually happened: `;

      const noEvent = 'No "input" event was emitted.'
      expect(inputEvents, msg + noEvent).toBeTruthy()
      expect(inputEvents, msg + noEvent).toHaveLength(i + 1);

      const payload = inputEvents.flat()[i];
      expect(typeof payload, msg + `The payload was of type ${typeof payload}.`).toBe('number');
      expect(payload, msg + `The payload was ${payload}.`).toBe(x);
    }
  });

});