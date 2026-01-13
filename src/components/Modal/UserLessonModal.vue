<template>
    <div ref="internUserLessonModal" class="modal fade" id="userLessonModal" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header teste">
                    <h5 class="modal-title" id="modalTitle">Vincular aulas - {{ student.name }}</h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="lessonsTable">
                        <TableComponent check :structure="tableStructure" :content="mappedLessons" @checkChange="onCheckChange" :checkedLessons="lessonsIds" :key="resetList"/>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" data-bs-dismiss="modal" class="btn btn-primary" @click="okClick">Vincular</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex"
import Table from "../Table.vue"
export default {
    data(){
        return {
            student: {
                id: '',
                name: '',
            },
            tableStructure: [
                {title: 'Título', key: 'title'},
                {title: 'Período', key: 'period'},
                {title: 'Tipo', key: 'type'},
            ],
            lessonsIds: [],
            resetList: 0,
            lessonTypesById: {}
        }
    },
    components: {TableComponent: Table},
    methods:{
        ...mapActions(['getLessons', 'addUser', 'updateUser', 'linkLessons', 'getUserLessons', 'getLessonsById', 'getLessonTypes']),
        okClick: async function(){
            try {
                const allLessons = await this.getUserLessons({userId: this.student.id, lessons: this.lessonsIds});
                await this.linkLessons({userId: this.student.id, lessons: allLessons});
                
                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Aulas vinculadas com sucesso!',
                    timerProgressBar: true,
                });
                
                this.clearModal();
            } catch (error) {
                console.error('Erro ao vincular aulas:', error);
                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'error',
                    title: 'Erro ao vincular aulas!',
                    timerProgressBar: true,
                });
            }
        },
        setUserOnModal: async function(user){
            this.student.id = user.id;
            this.student.name = user.name;
            try {
                const lessons = await this.getLessonsById({userId: user.id});
                let filteredLessons = lessons.filter(lesson => !lesson.videos.find(video => video.views != '0'));
                this.lessonsIds = filteredLessons.map(lesson => lesson.lessonId);
            } catch (error) {
                console.error('Erro ao buscar aulas do usuário:', error);
            }
        },
        onCheckChange: function(lesson){
            let index = this.lessonsIds.indexOf(lesson.id) 
            if(index == -1){
                this.lessonsIds.push(lesson.id)
            }
            else{
                this.lessonsIds.splice(index, 1)
            }
        },
        clearModal: function(){
            this.student.id = '';
            this.student.name = '';
            this.lessonsIds = [];
            this.resetList++
        }
    },
    computed:{
        ...mapGetters(['lessons', 'lessonTypes']),
        mappedLessons(){
            return this.lessons.map((lesson) => { return {...lesson, type: this.lessonTypesById[lesson.type]?.type }})
        }
    },      
    async beforeMount(){
        this.getLessons();
        this.getLessonTypes();

        this.lessonTypes.forEach(lesson => {
            this.lessonTypesById[lesson.id] = lesson;
        })
    },
}
</script>

<style scoped>
label{
    float: left;
}

input,textarea, select{
    border-color: #b5b5b5;
}

.lessonsTable{
    max-height: 100%;
    overflow: auto;
}

.modal-body{
    height: 500px;
}
</style>

<style >
.modal-header button{
    border: none;
    background-color: white;
}
</style>