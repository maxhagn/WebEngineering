<template>
  <div class="cart-item" v-if="artwork">


      <div class="cart-preview">
          <router-link :to="configRoute">
        <framed-artwork v-bind:artwork="artwork" v-bind:config="config"/>
          </router-link>
      </div>

      <MuseumLabel v-bind:artwork="artwork">
          <div class="cart-frame-description">{{frameDescription}}</div>
          <div class="cart-price">€ {{cartItem.price/100}}</div>
          <button class="cart-remove" v-on:click="removeItem()"></button>
      </MuseumLabel>

  </div>
</template>

<script>


import FramedArtwork from "@/components/FramedArtwork";
import MuseumLabel from "@/components/MuseumLabel";
import * as ArtmartService from "@/services/ArtmartService";

export default {
  name: "CartItem",
  components: {
      FramedArtwork,
      MuseumLabel
  },
  props: {
    cartItem: {
      artworkId: Number,
      price: Number,
      printSize: String,
      frameWidth: Number,
      frameStyle: String,
      matWidth: Number,
      matColor: String
    }
  },
  data() {
    return {
      artwork: null,
      config: []
    };
  },

    mounted() {
    this.getArtwork();
    this.config.printSize = this.cartItem.printSize;
    this.config.frameStyle = this.cartItem.frameStyle;
    this.config.matColor = this.cartItem.matColor;
   // console.log(this.config);
    // console.log(this.cartItem.artworkId);
    },

  computed: {    
    configRoute() {
      return {
        path: "/config/" + this.cartItem.artworkId,
        query: {
          printSize: this.cartItem.printSize,
          frameWidth: this.cartItem.frameWidth,
          frameStyle: this.cartItem.frameStyle,
          matWidth: this.cartItem.matWidth,
          matColor: this.cartItem.matColor
        }
      };
    },

    frameDescription: function () {
        //Small print in a 3.6 cm jogrivik frame with a 0.5 cm rap mat.
        var returnString = "";

        switch(this.cartItem.printSize) {
            case 'S':
                returnString = 'Small';
                break;
            case 'M':
                returnString = 'Medium';
                break;
            case 'L': returnString = 'Large';
        }

        returnString += ' print in a ' + this.cartItem.frameWidth/10 + ' cm ' + this.cartItem.frameStyle +
                        ' frame with a ' + this.cartItem.matWidth/10 + ' cm ' + this.cartItem.matColor + ' mat.';

        return returnString;
    }
  },

  methods: {
      getArtwork(){
          if (this.cartItem.artworkId) {
              ArtmartService.getArtwork(this.cartItem.artworkId).then(artwork => {
                  this.artwork = artwork;
              });
          }
      },

      removeItem(){
          this.$store.dispatch("removeFromCart", this.cartItem.cartItemId);
      }
  }
};
</script>

<style scoped>
.cart {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}

.cart-item {
  margin: 1rem;
  margin-bottom: 2rem;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.cart-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 250px;
  height: 250px;
  justify-content: center;
  flex-shrink: 0;
}

.cart-preview img {
  box-shadow: 0 7px 15px 0 rgba(0, 0, 0, 0.5);
}

.cart-item .museum-label {
  font-size: 1rem;
  margin-left: 2rem;
  padding: 1em;
  position: relative;
  flex-grow: 1;
  max-width: 500px;
}

.cart-frame-description {
  margin-top: 1em;
}

.cart-price {
  font-weight: bold;
  text-align: right;
  margin-top: 1rem;
}

.cart-remove {
  width: 1.5em;
  height: 1.5em;
  padding: 0;
  margin: 0;
  border-radius: 50%;

  position: absolute;
  top: -0.75em;
  right: -0.75em;

  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-remove::before {
  content: "✕";
  font-family: sans-serif;
}

@media (max-width: 600px) {
  .cart-item {
    flex-direction: column;
  }

  .cart-item .museum-label {
    margin: 0;
    margin-top: 1rem;
  }
}
</style>
