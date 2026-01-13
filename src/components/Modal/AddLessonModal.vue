<template>
    <div class="modal fade" id="addLessonModal" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">Criar aula</h5>
                    <button type="button" class="close" @click="closeModal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="type" class="col-form-label">Nome:</label>
                            <input type="text" id="type" class="form-control" v-model="lesson.title">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="okClick">Criar</button>
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
            lesson: {
                title: '',
                order: 0,
                videosIds: [],
                pdfsIds: [],
                visible: false
            }
        }
    },
    methods:{
        ...mapActions(['changeLoadingState', 'addLesson']),
        closeModal: function(){
            this.$refs.closeModalBtn.click();
        },
        okClick: function(){
            let _this = this;
            this.addLesson(this.lesson).then((lessonId) =>{
                _this.closeModal()
                this.$router.push({
                    name: "LessonDetails",
                    params: {lessonId}
                })
            } );
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