<template>
    <div class="message-box">
        <div class="title">{{ title }}</div>
        <ul class="messages">
            <li v-for="item in items" :key="item" >{{ item }}</li>
        </ul>
    </div>

</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: ""
        },
        items: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<style scoped>
.message-box{
    border-radius: 20px;
    background-color: white;
    margin-left: 60px;
    text-align: start;
    border: 1px;
    border-color: #040472;
    padding: 20px;
    max-width: 800px;
}
.messages{
    color: #040472;
    font-size: 22px;
    max-width: 690px;
    line-height: 1.3;
    max-width: 690px;
    overflow: auto;
}
.messages li{
    margin-bottom: 15px;
}
.title{
    font-size: 40px;
    font-weight: 500;
    color: #040472;
    text-align: start;
    margin-left: 25px;
    border-bottom: solid;
    border-bottom-width: 0.5px;
    border-color: #88b7e8;
    line-height: 1;
    margin-bottom: 15px;
}

@media (max-width: 800px) {
    .message-box{
        border-radius: 20px;
        background-color: white;
        margin-left: 60px;
        text-align: start;
        border: 1px;
        border-color: #040472;
        padding: 20px;
        max-width: 800px;
    }
    .messages{
        font-size: 15px;
    }
    .title{
        font-size: 20px;
    }
}
</style>