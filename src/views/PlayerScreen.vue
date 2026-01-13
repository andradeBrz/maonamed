<template>
  <div class="player-screen"> 
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando vídeo...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h3>Erro ao carregar vídeo</h3>
      <p>{{ error }}</p>
      <button @click="retryLoad" class="retry-btn">Tentar novamente</button>
    </div>

    <!-- Video Player -->
    <player v-else-if="videoUrl" :url="videoUrl" class="videoScreen"/>

    <div class="information-box">
        <h1>
            {{  actualLesson.title  }}
        </h1>
        <p>{{ actualLesson.description }}</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Player from '../components/Player.vue'
export default {
    props: {
        id: {
            type: [Number || String ]
        }
    },
    components: {Player},
    data(){return{
        videoUrl: '',
        loading: true,
        error: null
    }},
    computed:{
        ...mapGetters(['myLessons', 'actualLesson']),
        // Processamento de vídeos para verificação de acesso
        allVideosIds() {
            return this.myLessons.map(l => {
                if(l.folders){
                    let folderVideos = l.videosIds || [];
                    l.folders.forEach(folder => {
                        if(folder.videosIds) {
                            folderVideos = [...folderVideos, ...folder.videosIds];
                        }
                    });
                    return folderVideos;
                } else {   
                    return l.videosIds || [];
                }
            }).reduce((concatenated, actualArray) => {
                return concatenated.concat(actualArray);
            }, []);
        }
    },
    methods: {
        ...mapActions(['getDocumentBytes', 'getDocument', 'getPandaVideoById', 'generatePandaJwt']),
        
        async loadVideo() {
            try {
                this.loading = true;
                this.error = null;

                // Verificar acesso usando computed property (já processado)
                if(!this.allVideosIds.find(id => id == this.id)) {
                    this.$router.push({name: 'Lessons'});
                    return;
                }

                // Carregar dados em paralelo para melhor performance
                // const [watermarkJWT, doc] = await Promise.all([
                //     this.generatePandaJwt(),
                //     this.getDocument(this.id)
                // ]);

                const doc = await this.getDocument(this.id);

                const {data} = await this.getPandaVideoById(doc.pandaId);
                // const watermakedVideoUrl = `${data.video_player}&watermark=${watermarkJWT.data}`;
                
                this.videoUrl = data.video_player;
                this.loading = false;
            } catch (error) {
                console.error('Erro ao carregar vídeo:', error);
                this.error = 'Falha ao carregar o vídeo. Tente novamente.';
                this.loading = false;
            }
        },

        retryLoad() {
            this.loadVideo();
        }
    },
    
    async beforeMount() {
        await this.loadVideo();
    }
}


</script>

<style scoped>
.player-screen{
    display: flex;
}
.information-box{
    border: solid;
    padding: 35px;
    min-width: 365px;
    border-radius: 40px;
    background-color: #88b7e8;
    border-color: #88b7e8;
    cursor: pointer;
    max-width: 40%;
    margin-left: auto;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin-top: 80px;
    margin-inline: 80px;
}
.information-box h1{
    color: white;
    font-size: 45px;
}
.information-box p{
    color: #040472;
    font-size: 20px;
    line-height: 1.3;
    text-align: start;
    justify-content: center;
    display: flex;
}
.videoScreen{
    width: 60%;
    padding-top: 100px;
    margin-left: 25px;
}

.loading-container, .error-container {
    width: 60%;
    padding-top: 100px;
    margin-left: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #88b7e8;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-container h3 {
    color: #e74c3c;
    margin-bottom: 10px;
}

.error-container p {
    color: #666;
    margin-bottom: 20px;
    text-align: center;
}

.retry-btn {
    background-color: #88b7e8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

.retry-btn:hover {
    background-color: #6ba3d6;
}

@media (max-width: 1200px) {
.player-screen{
    flex-direction: column-reverse;
}

.videoScreen{
    height: 60vh;
    width: 100%;
    padding-top: 100px;  
}

.information-box{
    border-radius: 40px;
    background-color: #88b7e8;
    border-color: #88b7e8;
    cursor: pointer;
    max-width: 90%;
    margin: 35px auto;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin-top: 80px;
}
}


@media (max-width: 800px) {
.player-screen{
    flex-direction: column-reverse;
}

.videoScreen{
    height: 40vh;
    width: 100%;
    padding: 60px;   
}

}

@media (max-width: 600px) {
.player-screen{
    flex-direction: column-reverse;
}

.videoScreen{
    height: 40vh;
    width: 100%;
    padding: 60px;   
}

.information-box{
    border-radius: 40px;
}

.information-box h1{
    font-size: 30px;
}
.information-box p{
    font-size: 20px;
}
}
</style>