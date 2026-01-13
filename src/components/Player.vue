<template>
    <div class="video-player">
        <iframe 
            v-show="url" 
            style="border:none;height:100%;width:100%" 
            id="panda-player" 
            :src="url" 
            :key="videoKey" 
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
        </iframe>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import Swal from 'sweetalert2'

export default {
    props:{
        url: {
            type: String
        }
    },
    data(){
        return{
            videoKey: 0,
            viewCounted: false, // Evitar contagem duplicada
            checkInterval: null // Referência para o intervalo
        }
    },
    methods:{
        ...mapActions(['countView']),
        
        toggleFS(){
            const iframe = document.getElementById('panda-player').contentWindow;
            iframe.postMessage({type: 'fullscreen.toggle'})
        },

        setupViewTracking(player) {
            // Evitar múltiplas configurações
            if (this.viewCounted) return;

            const countPercentage = 0.8;
            let durationBreak = null;

            // Configurar intervalo otimizado
            this.checkInterval = setInterval(() => {
                try {
                    // Verificar se player ainda está válido
                    if (!player || typeof player.getCurrentTime !== 'function') {
                        clearInterval(this.checkInterval);
                        return;
                    }

                    // Obter duração apenas uma vez
                    if (!durationBreak && player.duration) {
                        durationBreak = player.duration * countPercentage;
                    }

                    // Verificar se atingiu o ponto de contagem
                    if (durationBreak && player.getCurrentTime() > durationBreak) {
                        if (!this.viewCounted) {
                            this.viewCounted = true;
                            this.countView();
                            clearInterval(this.checkInterval);
                        }
                    }
                } catch (error) {
                    console.error('Erro no tracking de views:', error);
                    clearInterval(this.checkInterval);
                }
            }, 2000); // Reduzir frequência de 1s para 2s
        }
    },
    mounted(){
        const _this = this;
        
        // Mostrar aviso após delay
        setTimeout(() => {
            Swal.fire({
                title: "Atenção",
                text: "Informo que essa aula é um conteúdo PRIVADO, PESSOAL E INTRANSFERÍVEL, e que o aluno será responsabilizado caso a compartilhe por qualquer maneira (download, gravação de tela e logins simultâneos) através das devidas punições jurídicas para o crime de VIOLAÇÃO DE DIREITO AUTORAL (art. 184 Código Penal).",
                icon: "warning",
                width: "90%",
                confirmButtonText: "Estou ciente",
                customClass: "warningMessage"
            });
        }, 1000);
        
        window.pandascripttag = window.pandascripttag || [];
        window.pandascripttag.push(function (){
            /* eslint-disable-next-line */
            const player = new PandaPlayer('panda-player', {
                onReady: () => {
                    _this.setupViewTracking(player);
                }
            });

            _this.videoKey++;
        });
    },

    beforeUnmount() {
        // Limpar intervalo quando componente for destruído
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    },
  
}
</script>

<style >
.video-player{
    position: relative;
    height: 600px;
}
.warningMessage{
    max-width: 1000px !important;
}
video{
    width: 100%;
}
</style>