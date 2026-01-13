<template>
    <header-component/>
    <div class="screen-content">
        <router-view/>
    </div>
</template>
<script>
import Header from '../components/Base/Header.vue'
export default {
    components: {HeaderComponent: Header}
}
</script>

<style scoped>
</style>