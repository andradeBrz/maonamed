<template>
    <section class="majorSection">
        <div class="leftSection">
            <div class="logo">
            </div>
            <div class="phrase">
                A mãozinha que faz a diferença no seu curso de medicina.
            </div>
            <div class="phoneImg">
            </div>
        </div>
        <div class="rightSection">
            <div class="handsImg">
            </div>
        </div>

    </section>
</template>

<script>
</script>
<style scoped>

.majorSection{
    width: 100%;
    height: 600px;
    display: inline-flex;
    position: relative;
}

.leftSection{
    position: relative;
    width: 50%;
    height: 100%;
    background-color: #040472;
}
.leftSection .logo{
    width: 55%;
    height: 20%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url('../../../public/logotipo-longo.svg');

}
.leftSection .phrase{
    color: white;
    font-family: 'Chillax', sans-serif;
    font-size: xx-large;
    width: 260px;
    text-align: start;
    line-height: 30px;
    position: absolute;
    bottom:30px;
    left: 120px;
}
.leftSection .phoneImg{

    width: 103%;
    height: 88%;
    background-position: bottom 100px right -205px;
    position: absolute;
    background-repeat: no-repeat;
    background-size: contain;
    background-image: url('../../../public/only-phone.png');
}
.rightSection{
    width: 50%;
    height: 100%;
    background-color: #88b7e8;
}

.rightSection .handsImg{
    width: 80%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url('../../../public/esteto.png');
    background-position: bottom -94px right 15px
}
@media (max-width: 1800px) {
    .leftSection .phoneImg{
        background-position: bottom 100px right -129px;
    }
}
@media (max-width: 1200px) {
    .rightSection{
        display: none !important;
    }

    .rightSection .handsImg{
        background-position: bottom -10px right 15px
    }

    .leftSection{
        width: 100%;
    }

    .leftSection .phoneImg{
        width: 100%;
    }
  }

  @media (max-width: 650px) {
    .rightSection{
        display: none !important;
    }

    .leftSection{
        width: 100%;
    }

    .leftSection .phoneImg{
        width: 100%;
        background-position: bottom 200px right -80px;
    }
  }
</style>