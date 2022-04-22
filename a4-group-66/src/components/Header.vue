<template>
  <header>
    <router-link to="/search">
      <img src="@/assets/images/artmart_logo.png" alt="Artmart" class="logo" />
    </router-link>
    <nav v-if="!isCheckout()">
      <router-link to="/search">Search</router-link>
      <router-link to="/cart" id="cart-link">Cart{{cartSizeText}}</router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
  methods: {
    isCheckout: function() {
      return this.$route.path == "/checkout";
    }
  },
  computed: {
    cartSizeText: function() {
      const count = this.$store.state.cart.length;
      return count > 0 ? ` (${count})` : "";
    }
  }
};
</script>

<style>
header {
  align-self: stretch;
  height: 3rem;
  font-size: 2rem;
  padding: 1em 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 600px) {
  header {
    height: 2rem;
    font-size: 1rem;
  }
}

nav {
  text-align: right;
}

nav a {
  margin-left: 1em;
}

nav a:hover {
  border-bottom: 2px solid var(--primary-color);
}

.logo {
  height: 1.5em;
}

.logo img {
  height: 100%;
}
</style>