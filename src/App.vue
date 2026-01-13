<template>
  <div class="div_app">
    <loading/>
    <router-view/>
  </div>
</template>

<script>
import Loading from './views/Loading.vue'
export default {
  components: {Loading}
}
</script>

<style>


@import url('https://fonts.cdnfonts.com/css/chillax');
html, body, #app, .div_app, .screen-content{
  height: 100%;
  width: 100vw;
}
.screen-content{
  height: 100%
}
#app {
  font-family: 'Chillax', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100%;
}

.form-input{
  border-color: #88b7e8 !important;
    border-width: 4px !important;
    border-radius: 25px !important;
    height: 46px !important;
    font-weight: 300 !important;
    font-size: large !important;
}

::-webkit-scrollbar {
  width: 10px;
}
</style>
