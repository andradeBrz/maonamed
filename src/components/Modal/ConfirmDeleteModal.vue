<template>
    <div ref="internConfirmDeleteModal" class="modal fade" id="confirmDeleteModal" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header teste">
                    <h5 class="modal-title" id="modalTitle">{{ title }} </h5>
                </div>
                <div class="modal-body">
                    <span class="modalMessage">{{ message }}</span>
                </div>
                <div class="modal-footer">
                    <button type="button" data-bs-dismiss="modal" class="btn btn-light" > Cancelar </button>
                    <button type="button" data-bs-dismiss="modal" class="btn btn-primary" @click="$emit('ok', id)"> Excluir </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        title: {
            type: String
        },
        message: {
            type: String
        },
    },
    data(){
        return{
            id: ''
        }
    },
    methods: {
        setIdOnModal: function(id){
            this.id = id;
        }
    }
}
</script>

<style scoped>
.modalMessage{
    text-align: start;
    float: left;
}
</style>