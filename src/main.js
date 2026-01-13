import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueSweetalert2 from 'vue-sweetalert2';
import VueTheMask from 'vue-the-mask'
import 'sweetalert2/dist/sweetalert2.min.css';
import player from 'vue-hls-player'
createApp(App).use(store).use(router).use(VueSweetalert2).use(VueTheMask).use(player).mount('#app')
