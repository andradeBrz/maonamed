<template>
        <div class="box-button" :class="{'dark': darkTheme}" @click="$router.push({name: route})"> 
            <h1>
                {{ title }}
            </h1>
            <p>
                {{ description }}
            </p>
        </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        },
        theme: {
            type: String,
            default: "light"
        },
        route: {
            type: String,
            default: ""
        }
    },
    computed: {
        darkTheme(){
            return this.theme != "light"
        }
    }
}
</script>

<style scoped>
.box-button{
    border: solid;
    padding: 35px;
    min-width: 365px;
    border-radius: 40px;
    background-color: #88b7e8;
    border-color: #88b7e8;
    cursor: pointer;
    user-select: none;
    
}
.box-button:hover{
    background-color: #88afda;
    border-color: #88afda;
}
.box-button h1{
    color: white;
    font-size: 45px;
}
.box-button p{
    color: #040472;
    font-size: 25px;
    width: 365px;
    margin: 0 auto;
    line-height: 1.3;
    text-align: start;
}
.dark{
    background-color: #040472;
    border-color: #040472;
}
.dark:hover{
    background-color: #040468;
    border-color: #040468;
}
.dark p{
    color: white;
}

@media (max-width: 500px) {
  .box-button{
    padding: 12px;
    border-radius: 20px;
  }

  .box-button h1{
    font-size: 30px;
  }

  .box-button p{
    font-size: 20px;
  }
}
</style>