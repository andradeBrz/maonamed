<template>
  <div class="myLessons">
      <div class="left-side">
        <div class="title">
          Minhas aulas
        </div>
        <div class="my-lessons-container">
          <LessonsBox class="my-lessons" lessonsType="My" @videoClick="videoClick" showViews/>
        </div>
        
      </div>
      <div class="right-side">
        <div class="personImgContainer">
            <div class="personImg"></div>

        </div>
        <div class="logoImgContainer">
        </div>
        <div class="observation">
          <div class="warn-message">
            <div class="warn-title">
              INFORMAÇÕES IMPORTANTES: 
            </div>
            <div class="warn-body">
              Cada aula poderá ser reproduzida por, no máximo, 4 vezes. <br/>
              Quando clicar na aula, espere alguns minutos para que o vídeo seja processado.
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import LessonsBox from '../components/Lessons/LessonsBox.vue';
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'MyLessons',
  components: {
    LessonsBox
  },
  data() {
    return {
      viewsCache: new Map(), // Cache para evitar consultas repetidas
      loading: false
    }
  },
  methods: {
    ...mapActions(['getMyLessons', 'getLessonById', 'getViews', 'getDocument', 'getDocumentUrl', 'setActualVideoId']),
    async videoClick(data) {
      // Evitar múltiplos cliques
      if (this.loading) return;
      
      this.loading = true;
      
      try {
        // Cache key para o vídeo específico
        const cacheKey = `${data.lessonId}-${data.video.id}`;
        
        // Verificar cache primeiro
        if (this.viewsCache.has(cacheKey)) {
          const views = this.viewsCache.get(cacheKey);
          this.handleVideoAccess(views, data);
          return;
        }

        // Carregar dados em paralelo
        await Promise.all([
          this.getLessonById(data.lessonId),
          this.setActualVideoId(data.video.id)
        ]);

        // Buscar views apenas se não estiver em cache
        const views = await this.getViews();
        this.viewsCache.set(cacheKey, views);
        
        this.handleVideoAccess(views, data);
      } catch (error) {
        console.error('Erro ao carregar vídeo:', error);
        this.$swal({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'error',
          title: 'Erro ao carregar vídeo!',
          timerProgressBar: true,
        });
      } finally {
        this.loading = false;
      }
    },

    handleVideoAccess(views, data) {
      if (views >= 4) {
        this.$swal({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'error',
          title: 'Limite de visualizações excedido!',
          timerProgressBar: true,
        });
      } else {
        this.$router.push({
          name: 'PlayerScreen',
          params: {id: data.video.id}
        });
      }
    },
  },
  computed:{ 
    ...mapGetters(['myLessons'])
  },  
  mounted(){
    this.getMyLessons();
  }
}
</script>
<style lang="scss" scoped>


.myLessons{
  width: 100%;
  background-color: #040472;
  padding-bottom: 50px;
  display: flex;
  flex-direction: row;
  padding-top: 100px;

  .left-side{
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    .title{
        font-size: 60px;
        text-align: start;
        padding: 0px 60px 20px 60px;
        font-weight: 500;
        color: white;
        margin-top: 0;
    }

    .my-lessons-container{
      padding-inline: 30px;
      .my-lessons{
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-top: 0 !important;
        min-height: 700px;
      }
    }
  

    
    

  }
  .right-side{
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    .personImgContainer{
        position: relative;
        display: flex;
        min-height: 650px;
        .personImg{
          background-image: url('../../public/pessoa-sentada.svg');
          background-position: center;
          background-repeat: no-repeat;
          background-size: 85%;
          position: relative;
          width: 100%;
        }
    }

    .logoImgContainer{
        position: relative;
        display: flex;
        .logo{
            background-image: url('../../public/logo-quebrado.svg');
            background-position: center;
            background-repeat: no-repeat;
            background-size: 800px;
            position: relative;
        }
    }
    
    .observation{
      width: 100%;
      margin-top: auto;
      .warn-message{
        color: white;
          text-align: start;
          margin-left: 70px;
          margin-top: 30px;
          border-left-color: rgb(52, 34, 34) white;
          border-left-width: 1px;
          border-left-style: solid;

          .warn-title{
            padding-left: 10px;
            font-size: 30px;
          }
          .warn-body{
            padding-left: 10px;
            font-size: 20px;
            line-height: 1;
          }
      }

    }
    

    
  }

}




.lessons{
	height: 600px;
	overflow: auto;
}

.lesson{
	margin-block: 30px;
}
@media (max-width: 1200px) {
  .my-lessons{
    width: 100%;
    margin: 0 !important;
    
  }

}

@media (max-width: 1000px) {
     
    .right-side{
      display: none !important;
    }
  }

@media (max-width: 800px) {
  .left-side .title{
      font-size: 40px  !important;
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