<template>
    <div ref="internLessonTypeModal" class="modal fade" id="collegeModal" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header teste">
                    <h5 class="modal-title" id="modalTitle">{{ modalTitle }}</h5>
                    <button type="button" class="close" @click="closeModal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="type" class="col-form-label">Nome:</label>
                            <input type="text" id="type" class="form-control" v-model="collegeName">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="okClick">{{ btnText }}</button>
                    <button type="button" ref="closeModalBtn" hidden data-bs-dismiss="modal" class="btn btn-primary">{{ btnText }}</button>
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
            index: -1,
            collegeName: '',
            modalType: 'new'
        }
    },
    methods:{
        ...mapActions(['changeLoadingState']),
        closeModal: function(){
            this.clearModal();
            this.$refs.closeModalBtn.click();
        },
        okClick: function(){
            this.$refs.closeModalBtn.click();
            this.$emit('updateColleges', {index: this.index, name: this.collegeName})
            this.clearModal();
        },
        setCollegeOnModal: function(college){
            this.index = college.index;
            this.collegeName = college.name;
            this.modalType = 'edit'
        },
        clearModal: function(){
            this.index = -1;
            this.collegeName = '';
            this.modalType = 'add'
        },

    },
    computed:{
        btnText: function(){
            return this.modalType == 'add' ? "Adicionar" : "Salvar";
        },
        modalTitle: function(){
            return this.modalType == 'add' ? "Adicionar Faculdade" : "Editar Faculdade";
        }
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
    background-color: rgb(159 109 119);
    border-color: rgb(159 109 119);
}

.btn-primary:hover{
    background-color: rgb(159 109 119);
    border-color: rgb(159 109 119);
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