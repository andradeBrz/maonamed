<template>
    <div id="loading" v-if="loading.state">
      <Spinner/>
      <h5 class="message">{{ loading.message }}</h5>
    </div>
  </template>
  
<script>
import {mapGetters} from 'vuex'
import Spinner from '../components/Base/Spinner.vue';

export default {
  name: "Loading",
  components: {Spinner},
  computed:{
    ...mapGetters(['loading'])
  }
};
</script>

<style>
#loading {
  position: fixed;
  z-index: 1000;
  background-color: #0e0c0c9c;
  height: 100vh;
  width: 100vw;
  text-align: center;
  line-height: 100vh;
}


.message{
  position: absolute;
    color: white;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    top: 55%;
}
</style>
