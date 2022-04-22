import Search from "@/pages/Search";
import Cart from "@/pages/Cart";
import Config from "@/pages/Config";
import Checkout from "@/pages/Checkout";

const routes = [
  { path: '/', redirect: '/search' },
  { path: '/search', component: Search },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout },
  { path: '/config/:artworkId', component: Config, props: (route) => ({ artworkId: +route.params.artworkId }) },
  { path: '*', redirect: '/' },
]

export default routes
