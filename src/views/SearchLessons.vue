<template>
    <div class="search-lessons">
        <div class="top-side">
            <div class="left-side">
                <div class="title">
                    Buscar aulas 
                </div>
                <MessageBox :title="messageBox.title" :items="messageBox.messages"/>
            </div>
            <div class="right-side">
                <div class="handsImg"> </div>
            </div>
        </div>
        <div class="bottom-side">
            <div class="left-side">
                <div class="phoneImg"> </div>
            </div>
            <div class="right-side">
                <LessonsBox lessons-type="Other" @buyLesson="buyLessonIntern"/>
            </div>
        </div>
        <button hidden data-bs-toggle="modal" data-bs-target="#qrCodeModal" ref="OpenQRCodeModal"></button>
        <QrCodeModal/>
    </div>
</template>
<style lang="scss" scoped>
.search-lessons{
    width: 100%;
    background-color: #040472;
    padding-bottom: 50px;
    padding-top: 100px;
    display: flex;
    flex-direction: column;
    .top-side{
        width: 100%;
        display: flex;
        .left-side{
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            width: 100%;
            .title{
                font-size: 60px;
                text-align: start;
                padding: 0px 60px 20px 60px;
                font-weight: 500;
                color: white;
                margin-top: 0;
            }
        }
        .right-side{
            width: 100%;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            position: relative;
            .handsImg{
                background-size: 600px;
                background-repeat: no-repeat;
                background-image: url('../../public/esteto.png');
                background-position: center;
                height: 600px;
                transform: rotateY(180deg);
                position: relative;
            }
        }
    }
    .bottom-side{
        width: 100%;
        display: flex;
        .left-side{
            width: 100%;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            position: relative;
            .phoneImg{
                background-position: center;
                background-repeat: no-repeat;
                background-size: 700px;
                background-image: url('../../public/livro.png');
                position: relative;
                height: 700px;
            }
        }
        .right-side{
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            width: 100%;
        }
    }
}


@media (max-width: 900px) {
    .top-side .right-side{
          display: none !important;
    }

    .bottom-side .left-side{
          display: none !important;
    }
    .message-box{
        margin-inline: 15px;
    }
  }

@media (max-width: 800px) {
  .left-side .title{
      font-size: 40px  !important;
  }
}
</style>


<script>
import LessonsBox from '../components/Lessons/LessonsBox.vue';
import MessageBox from '../components/MessageBox.vue';
import QrCodeModal from '../components/Modal/QrCodeModal.vue';

import {mapActions} from 'vuex'
export default {
    components: {LessonsBox, MessageBox, QrCodeModal},
    data(){
        return {
            messageBox: {
                messages: [
                    "Após o pagamento da aula, ela estará disponível na aba “Minhas aulas”. Esse processo pode demorar alguns minutos, até que o pagamento seja processado.",
                    "As aulas são liberadas no site aos poucos, na medida em que os APGs são abertos. Se você não encontrou a aula que procura, entre em contato através do WhatsApp para que ela seja liberada.",
                    "Após adquirir a aula, você terá o direito de reproduzi-la por até 4 vezes. Evite compartilhar o seu login, pois, quando ultrapassado o limite de reproduções, a aula deverá ser comprada novamente."
                ],
                title: "INFORMAÇÕES IMPORTANTES:"
            },
            pageColor: "#040472"
          
        }
    },
    methods: {
		...mapActions(['getOtherLessons', 'getLessonType', 'gerenciaAuth', 'generateCob', 'getQrCode', 'changeLoadingState', 'changeLoadingMessage']),
		buyLessonIntern: async function(lesson){
			try {
				const response = await this.getLessonType(lesson.type);
				this.changeLoadingMessage('Gerando QRCode');
				this.changeLoadingState();
				
				await this.gerenciaAuth();
				const cob = await this.generateCob({id: lesson.id, price: response.price});
				const locId = cob.loc.id;
				
				await this.getQrCode(locId);
				this.changeLoadingState();
				this.$refs.OpenQRCodeModal.click();
			} catch (error) {
				console.error('Erro ao comprar aula:', error);
				this.changeLoadingState();
				this.$swal({
					toast: true,
					position: 'top-end',
					showConfirmButton: false,
					timer: 3000,
					icon: 'error',
					title: 'Erro ao processar compra!',
					timerProgressBar: true,
				});
			}
		},
	},

}
</script>
