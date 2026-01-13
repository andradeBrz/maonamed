<template>
    <div ref="internQrCodeModal" class="modal fade" id="qrCodeModal" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header teste">
                    <h5 class="modal-title" id="modalTitle">Pagamento </h5>
                </div>
                <div class="modal-body">
                    <p>
                        Leia o QrCode para completar o pagamento da aula.
                    </p>
                    <img :src="qrCode.imagemQrcode"/>
                    <div class="copyDiv">
                        <div class="input-group mb-3 qrcodeCopy">
                            <input type="text" ref="qrCodeInput" @focus="onFocus" readonly class="form-control" placeholder="Recipient's username" aria-describedby="basic-addon2" v-model="qrCode.qrcode">
                            <div class="input-group-append">
                                <button class="btn btn-outline-secondary" type="button" @click="copyText"><i class="fa fa-clone"></i></button>
                            </div>
                        </div>
                    </div>
                    <div class="qrCodeMessage">
                        Assim que o sistema identificar o pagamento, em até 5 minutos, a aula será disponibilizada no menu "Minhas Aulas". Caso sua conexão esteja lenta ou instável, esse limite pode variar.

                        </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    data(){
        return{
            id: '',
            teste: "dsadsad"
        }
    },
    methods: {
        copyText: function(){
            this.$refs.qrCodeInput.focus();
            document.execCommand('copy');
        },
        onFocus: function(e){
            e.target.select()
        }
    },
    computed:{
        ...mapGetters(['qrCode'])
    }
}
</script>

<style scoped>
.qrCodeMessage{
    color: black;
    display: flex;
    width: 100%;
    text-align: center;
    justify-content: center;
    padding-inline: 5%;
}
.modalMessage{
    text-align: start;
    width: 100%;
    justify-content: center;
    display: flex;
}

.copyDiv{
    display: flex;
    justify-content: center;
    width: 100%;
}
.qrcodeCopy{
    width: 80%;
}
</style>