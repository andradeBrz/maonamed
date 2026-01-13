<template>
    <div class="lessons-screen">
        <div class="lessons-filter  mb-5">
            <div class="input-group">
                <div class="filter-icon"><i class="fas fa-search"></i></div>
                <input v-model="lessonFilter" type="text" class="form-control filter-input" placeholder="Nome da aula">
            </div>
            <div>
               <button class="new-lesson" @click="openAddLessonModal">
                <i class="fas fa-plus"></i>
                 Nova Aula
               </button>
            </div>
        </div>

        <div class="lessons-list">
            <lesson v-for="lesson in filteredLessons" :key="lesson.id" :lesson="lesson" @delete="clickDeleteLesson"/>
        </div>
        <button hidden data-bs-toggle="modal" data-bs-target="#addLessonModal" ref="openAddLessonModalBtn"></button>
        <AddLessonModal />
        <button hidden data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" ref="openDeleteModalBtn"></button>
        <confirm-delete-modal-vue ref="ConfirmDeleteLessonModal" title="Atenção" message="Tem certeza que deseja excluir essa aula? Essa operação não poderá ser desfeita." @ok="internDeleteLesson"/>

    </div>

</template>

<script>
import Lesson from "./Lesson.vue"
import AddLessonModal from "../components/Modal/AddLessonModal.vue"
import ConfirmDeleteModalVue from '../components/Modal/ConfirmDeleteModal.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
    components: {Lesson, AddLessonModal, ConfirmDeleteModalVue},
    data(){
        return {
            lessonFilter: ""
        }
    },
    methods: {
        ...mapActions(["getLessons", 'changeLoadingMessage', 'changeLoadingState', 'deleteLesson']),
        openAddLessonModal(){
            this.$refs.openAddLessonModalBtn.click()
        },
        clickDeleteLesson: function(lessonId){
            this.$refs.ConfirmDeleteLessonModal.setIdOnModal(lessonId);
            this.$refs.openDeleteModalBtn.click();
        },
        internDeleteLesson: function(lessonId){
            this.changeLoadingMessage('Excluindo aula')
            this.changeLoadingState();
            this.deleteLesson(lessonId).then(() => {
                this.getLessons();
                this.changeLoadingState();
            })
        }
    
    },
    computed: {
        ...mapGetters(['lessons']),
        filteredLessons: function(){
            return this.lessons.filter(lesson => lesson.title.toLowerCase().indexOf(this.lessonFilter.toLowerCase()) != -1)
        }
    },  
    beforeMount(){
        this.getLessons();
    }
}
</script>

<style lang="scss" scoped>
.lessons-screen{
    width: 100%;
    padding-top: 100px;
    padding-inline: 50px;

    .lessons-filter{
        display: flex;
        justify-content: space-between;

        .input-group{
            width: 350px;

            .filter-icon{
                border: 1px solid #dee2e6;
                background-color: white;
                border-right: none;
                border-top-left-radius: 0.375rem;
                border-bottom-left-radius: 0.375rem;
                display: flex;
                align-items: center;
                padding-right: 8px;
                padding-left: 16px;
            }
            .filter-input{
                border-left: none;
            }
            .filter-input:focus{
                border-left: none;
                border-color: #dee2e6;
                box-shadow: none;
            }
        }

        .new-lesson{
            border: 0px solid;
            border-radius: 8px;
            background-color: #040472;
            color: white;
            padding: 4px 12px;
            margin-right: 8px;
            min-width: 150px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
        }
    }

    .lessons-list{
        width: 100%;
        height: 650px;
        overflow: auto;
        display: flex;
        flex-wrap: wrap;
        
        gap: 32px 80px;
        justify-content: center;
    }

}


@media (max-width: 650px) {
    .lessons-screen .lessons-filter{
        flex-direction: column;
        align-items: end;
        gap: 12px;

        .input-group{
            width: 100%;
        }
    }
}
</style>