<template>
  <main>
    <section class="cart">

      <li v-for="cartItem	in	this.cart"
          :key="cartItem.cartItemId">
        <CartItem v-bind:cartItem="cartItem"/>
      </li>


      <div class="cart-total">
        <p v-if="empty">There are no items in your shopping cart.</p>
        <div v-if="!empty" class="price">
          Total: €
          <span id="price-total">{{cartTotal}}</span>
        </div>
        <!-- TODO: insert checkout button here -->
        <router-link to='/checkout'>
          <button v-if="empty=!empty">Checkout</button>
        </router-link>

      </div>
    </section>
  </main>
</template>

<script>

  import CartItem from "@/components/CartItem";


export default {
  name: "Cart",
  components: {
    CartItem
  },

  data() {
    return {
    };
  },

  mounted() {
    this.$store.dispatch("loadCart");
  },


  computed: {

    cartTotal: function () {
      return this.$store.getters.cartTotal/100;
    },

    cart: function () {
     return this.$store.state.cart;
    },

    empty: function () {
     return this.$store.getters.cartIsEmpty;
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

.cart-total {
  margin-right: 1rem;
  align-self: flex-end;

  display: flex;
  flex-direction: column;
}

.cart-total .price {
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: right;
}

@media (max-width: 600px) {
  .cart-total {
    margin: 0;
    align-self: stretch;
  }

  .cart-total .price {
    text-align: center;
  }
}
</style>
