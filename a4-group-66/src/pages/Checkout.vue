<template>
  <main>
    <div class="error-message" v-if="error">An error occurred during payment. Please try again.</div>

    <form v-if="success == false && waiting == false" class="checkout-form" id="checkout-form" @submit="paymentProcess()">
      <fieldset>
        <legend>Contact information</legend>
        <div class="grid">
          <label for="email">Email</label>
          <input type="email" name="email" id="email" v-model="customer.email" required />
        </div>
      </fieldset>

      <fieldset>
        <legend>Shipping address</legend>
        <div class="grid">
          <label for="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            v-model="customer.shipping_address.name"
            required
          />

          <label for="address">Address</label>
          <input
            type="text"
            name="address"
            id="address"
            v-model="customer.shipping_address.address"
            required
          />

          <label for="city">City</label>
          <input
            type="text"
            name="city"
            id="city"
            v-model="customer.shipping_address.city"
            required
          />

          <label for="country">Country</label>
          <select name="country" id="country" v-model="customer.shipping_address.country" @change="getShippingCosts($event)">
            <option v-for="dest in this.$store.getters.sortedDestinations" :value="dest.country" :key="dest.country">{{dest.displayName}}</option>
          </select>

          <label for="postalcode">Postal code</label>
          <input
            type="text"
            name="postalcode"
            id="postalcode"
            v-model="customer.shipping_address.postal_code"
            required
          />

          <label for="phone">Phone (optional)</label>
          <input type="tel" name="phone" id="phone" v-model="customer.shipping_address.phone"/>
        </div>
      </fieldset>

      <fieldset>
        <legend>Card details</legend>
        <div class="grid">
          <label for="cardholder">Name on card</label>
          <input type="text" name="cardholder" id="cardholder" v-model="confirm.cardholder" required />

          <label for="cardnumber">Card number</label>
          <input type="text" name="cardnumber" id="cardnumber" v-model="confirm.cardnumber" required />

          <label for="cardexpiry">Expiration</label>
          <input
            type="text"
            name="cardexpiry"
            id="cardexpiry"
            pattern="\d{2}/\d{4}"
            placeholder="MM/YYYY"
            v-model="exp_date"
            required
          />

          <label for="cardcvc">CVC</label>
          <input
            name="cardcvc"
            id="cardcvc"
            type="text"
            pattern="\d{3}"
            v-model="confirm.cvc"
            required
          />
        </div>
      </fieldset>

      <div>
        <div>
          Subtotal: €
          <span id="price-subtotal">{{(parseFloat(this.$store.getters.cartTotal)/100).toFixed(2)}}</span>
        </div>
        <div>
          Shipping Costs: €
          <span id="price-shipping">{{shippingCosts}}</span>
        </div>
      </div>

      <div>
        <div class="price">
          Total: €
          <span id="price-total">{{totalCosts}}</span>
        </div>
      </div>

      <div class="button-row">
        <router-link to="/cart">&larr; Back to Cart</router-link>
        <button type="submit" id="pay-button">Pay</button>
      </div>
    </form>
        <div v-if="waiting">
            <h2>Processing payment...</h2>
            <img src="@/assets/images/spinner.gif" width="50" height="50"/>
        </div>

        <div v-if="success">
        <div>Your payment was completed successfully.</div>
        <h2>Thank you for your purchase!</h2>
        <div>
          <router-link to="/search">&larr; Back to Search</router-link>
        </div>
        </div>
  </main>
</template>

<script>
import * as ArtmartService from "@/services/ArtmartService";
import * as BlingService from "@/services/BlingService";

export default {
  name: "Checkout",
  components: {
  },
  data() {
    return {
        error: false,
        success: false,
        waiting: false,
        shippingCosts: 0,
        totalCosts: 0,
        customer: {
            "email": "",
            "shipping_address":{
                "name": "",
                "address": "",
                "city": "",
                "country": "",
                "postal_code": "",
                "phone": ""
            }
        },
        confirm: {
            "client_secret": "",
            "cardholder": "",
            "cardnumber": "",
            "exp_month": 0,
            "exp_year": 0,
            "cvc": 0
        },
        exp_date: ""
    };
  },
  watch: {
    shippingCosts: function(val) {
        this.totalCosts = (parseFloat(this.$store.getters.cartTotal)/100 + parseFloat(val)).toFixed(2);
    }
  },
  computed: {

  },
  mounted: function() {
    if(this.$store.getters.cartIsEmpty){
      this.$router.push("/cart");
    }
  },
  methods: {
    getShippingCosts: function(event) {
        this.shippingCosts = this.$store.getters.sortedDestinations.find(x => x.country === event.target.value).cost/100;
    },
    paymentProcess: function(){
        this.waiting = true;
        ArtmartService.checkout(this.customer).then(resp => {
          if (resp == null) {
            this.waiting = false;
            this.error = true;
          }else{
            this.confirm.client_secret = resp.client_secret;
            var expArr = this.exp_date.split("/");
            this.confirm.exp_month = parseInt(expArr[0]);
            this.confirm.exp_year = parseInt(expArr[1]);
            this.confirm.cvc = parseInt(this.confirm.cvc);
            BlingService.confirmPaymentIntent(resp.payment_intent_id, resp.client_secret, this.confirm).then(blingResp => {
                this.waiting = false;
                if (blingResp.status != 'succeeded') {
                    this.error = true;
                }else{
                    //SUCCESS
                    this.success = true;
                }
            });
          }
        });

    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
}

.checkout-form > div {
  margin: 1rem 0;
  text-align: right;
}

/* this is a workaround for a Chrome bug that disallows display:grid on fieldset elements */
.checkout-form div.grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: 0.5em 1em;
  align-items: center;
}

.checkout-form fieldset {
  border: none;
  margin: 2rem 0;
  padding: 0;
}

.checkout-form fieldset legend {
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 0.5rem;
}

.checkout-form input {
  -moz-appearance: textfield;
  font-family: inherit;
  font-size: 1em;
  height: 1.25rem;
  line-height: 1.25rem;
  padding: 3px;
  text-indent: 1.25px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: bold;
  font-size: 1.5rem;
}

@media (max-width: 600px) {
  .checkout-form {
    width: 100%;
  }
  .checkout-form div.grid {
    grid-template-columns: 1fr;
  }

  .button-row {
    flex-direction: column-reverse;
    align-items: flex-start;
  }

  .button-row button {
    width: 100%;
    margin-bottom: 1em;
  }
}
</style>
