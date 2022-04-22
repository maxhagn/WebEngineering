<template>
  <fieldset>
    <legend>{{legend}}</legend>
    <div class="config-row">
      <label>{{label}}</label>
      <div>
        <input type="number" step="0.1" v-bind:aria-label="label" v-bind:value="value/10" v-on="changeListeners" v-bind:min="min/10" v-bind:max="max/10"/>
        cm
      </div>
    </div>
    <input type="range" step="0.1" aria-hidden="true" v-bind:value="value/10" v-on="inputListeners" v-bind:min="min/10" v-bind:max="max/10"/>
  </fieldset>
</template>

<script>
export default {
  name: "WidthSlider",
  props: {
    min: Number,
    max: Number,
    value: Number,
    label: String
  },
  computed: {
    /* Notified if the "Number-Input" changes */
    changeListeners: function () {
      var vm = this
      return Object.assign({},
        this.$listeners,
        {
          change: function (event) {
            if ( event.target.value < vm.min ) {
              vm.$emit('input', Math.trunc(vm.min))
            } else if ( event.target.value > vm.max ) {
              vm.$emit('input', Math.trunc(vm.max))
            }
            else {
              vm.$emit('input', Math.trunc(event.target.value*10))
            }
          }
        }
      )
    },
    inputListeners: function () {
      var vm = this
      return Object.assign({},
        this.$listeners,
        {
          input: function (event) {
            if ( event.target.value < vm.min ) {
              vm.$emit('input', Math.trunc(vm.min))
            } else if ( event.target.value > vm.max ) {
              vm.$emit('input', Math.trunc(vm.max))
            }
            else {
              vm.$emit('input', Math.trunc(event.target.value*10))
            }
          }
        }
      )
    }
  }
};
</script>

<style>

input[type="number"] {
    -moz-appearance: textfield;
    width: 2.5em;
    height: 1em;
    font-family: inherit;
    font-size: inherit;
    text-align: right;
    background-color: var(--bg-color);
    border: none;
    padding: 3px;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
}

/*
Styling the range input element is very tricky.
If you want to know more, see
https://css-tricks.com/sliding-nightmare-understanding-range-input
*/
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 0.5rem;
    background: transparent;
    background-color: var(--bg-color);
    border-radius: 0.5rem;
    margin: 1rem 0;
}

::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-style: none;
    border-radius: 50%;
    background-color: white;
    box-shadow: 1px 1px 3px;
    margin-top: -2px;
    color: rgb(144,144,144);
}

::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-style: none;
    border-radius: 50%;
    background-color: white;
    box-shadow: 1px 1px 3px;
    color: rgb(144,144,144);
}

input[type="range"]:focus {
    outline: none;
}
</style>

<style scoped>
fieldset {
  border: none;
  min-width: auto;
  border-bottom: 1px solid #eff2f5;
  padding: 15px 20px 15px 20px;
  margin: 0;
}

/* legend is necessary for accessibility, but we don't want to show it */
fieldset legend {
  position: absolute;
  clip: rect(0 0 0 0);
}

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
</style>
