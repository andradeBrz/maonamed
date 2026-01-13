<template>
  <div>
    <div class="options">
      <BoxButton 
      v-for="option in options" 
      :key="option.route" 
      :description="option.description"
      :title="option.title"
      :route="option.route"
      :theme="option.theme"
      />
    </div>

    <div class="pt-1 actions">
        <button class="btn btn-lg btn-block contactBtn" @click="gotoWpp" type="button">
            <div>
                Em caso de possíveis dúvidas entre em contato conosco
            </div>
            <i class="fa-brands fa-whatsapp"></i>
        </button>
    </div>
  </div>
</template>

<script>

import BoxButton from '../components/Buttons/BoxButton.vue';

export default {
  name: 'Home',
  components: {
    BoxButton
  },
  data(){
    return {
      options: [{
        title: "Minhas aulas",
        description: "Aqui se encontram as aulas que você já adquiriu e estão disponíveis para visualização.",
        route: "MyLessons",
        theme: "light"
      },
      {
        title: "Buscar aulas",
        description: "Aqui você pode procurar pelas aulas (APG e/ou revisões) que tem interesse em adquirir.",
        route: "Lessons",
        theme: "dark"
      }]
    }
  },
  methods:{
    gotoWpp: function(){
            window.location = "https://wa.me/message/2BDKZIFAIZQNH1"
        },
  }

}
</script>
<style scoped>
.options{
  padding-top: 100px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10%;
}

.actions{
  display: flex;
  justify-content: center;
  margin-top: 100px;
}

.contactBtn{
    line-height: 1;
    width: 375px;
    border: solid;
    border-radius: 40px;
    border-color: #040472;
    color: white;
    background-color: #040472;
    font-weight: 500;
    font-size: 20px;
    min-height: 45px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
}

.contactBtn > div {
    text-decoration: underline;
}

.contactBtn > i {
    font-size: xx-large;
}

@media (max-width: 1000px) {
  .options{
    flex-direction: column;
    width: 100%;
    align-items: center;
    gap: 50px;
  }

  .options .box-button{
    min-width: 90%;

  }
}


@media (max-width: 500px) {
  .options{
    gap: 20px;
  }

  .actions {
    margin-top: 50px;
  }
}

</style>


<style>
.pageTitle{
  text-align: start;

  margin-left: 60px;
  margin-top: 0;
}

</style>