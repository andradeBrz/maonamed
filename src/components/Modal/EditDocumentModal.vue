<template>
    <div class="modal fade" id="editDocumentModal" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">Editar documento</h5>
                    <button type="button" class="close" @click="closeModal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="type" class="col-form-label">Nome:</label>
                            <input type="text" id="type" class="form-control" v-model="document.name">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="okClick">Salvar</button>
                    <button type="button" ref="closeModalBtn" hidden data-bs-dismiss="modal" class="btn btn-primary"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    data(){
        return {
            document: {
                id: 0,
                name: ''
            }
        }
    },
    methods:{
        ...mapActions(['changeLoadingState', 'updateDocument']),
        closeModal: function(){
            this.$refs.closeModalBtn.click();
            this.$emit('close', this.document)
        },
        okClick: function(){
            let _this = this;
            this.updateDocument(this.document).then(() => _this.closeModal());
        },
        setDocumentOnModal: function(name, id){
            this.document.id = id;
            this.document.name = name;
        },
    },
}
</script>

<style scoped>
input,textarea, select{
    border-color: #b5b5b5;
}

.form-group{
    padding-left: 0;
}

label{
    float: left;
    width: 36px;
}
#visible{
    margin-top: 40px;
}
.modal-body{
    max-height: 70vh;
    overflow: auto;
}

.btn-primary{
    background-color:#040472;
    border-color:#040472;
}

.btn-primary:hover{
    background-color: #040472;
    border-color: #040472;
}

</style>

<style >
.modal-header button{
    border: none;
    background-color: white;
}

#holder{
    width: 100%; height: 50px;
    border: 1px dashed rgb(161, 161, 161);
    color: rgb(161, 161, 161);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
}

#holder:hover { 
    color:  rgb(104, 104, 104);
    border-color: rgb(104, 104, 104);
    cursor: pointer;
    user-select: none;
}
</style>