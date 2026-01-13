<template>
    <div class="lessons-screen">
        <div>
            <button hidden data-bs-toggle="modal" data-bs-target="#lessonTypeModal" ref="OpenLessonTypeModal"></button>
            <lesson-type-modal ref="LessonTypeModal" @hidden="onLessonTypeCreated"/> 

            <h4 class="pageTitle">Gerenciar Tipos</h4>
            <div class="tableDiv">
                <table-component onlyEdit :structure="lessonTypeTableStructure" :content="lessonTypes" @edit="editLesson"/>
            </div>

            <button class="btn btn-primary addUserBtn" @click="newLessonType" >Adicionar Tipo</button>
        </div>
        <div>
            <button hidden data-bs-toggle="modal" data-bs-target="#collegeModal" ref="OpenCollegeTypeModal"></button>
            <college-modal ref="CollegeModal" @hidden="onCollegeCreated" @updateColleges="updateCollegesIntern"/> 

            <h4 class="pageTitle">Faculdades</h4>
            <div class="tableDiv">
                <table-component onlyEdit :structure="collegeTableStructure" :content="collegesList" @edit="editCollege"/>
            </div>

            <button class="btn btn-primary addUserBtn" @click="newCollege" >Adicionar Faculdade</button>
        </div>
        
    </div>
    </template>
    
    <script>
    import { mapActions, mapGetters } from 'vuex'
    import LessonTypeModal from '../components/Modal/LessonTypeModal.vue'
    import CollegeModal from '../components/Modal/CollegeModal.vue'
    import Table from '../components/Table.vue'
    export default {
        name: 'CreateLessonTypes',
        components: { LessonTypeModal, TableComponent: Table, CollegeModal },
        data(){
            return{
                lessonTypeTableStructure: [
                    {title: 'Tipo', key: 'type'},
                    {title: 'Preço', key: 'price'},
                ],
                collegeTableStructure: [
                    {title: 'Faculdade', key: 'name'},
                ],
            }
        },
        methods: {
            ...mapActions(['getLessonTypes', 'getColleges', 'updateColleges']),
            onLessonTypeCreated: function(){
                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Tipo criado com sucesso!',
                    timerProgressBar: true,
                });
                this.getLessonTypes();
            },
            onCollegeCreated: function(){
                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Operação realizada com sucesso!',
                    timerProgressBar: true,
                });
                this.getColleges();
            },
            newCollege: function(){
                this.$refs.OpenCollegeTypeModal.click();
            },
            editCollege: function(college){
                this.$refs.CollegeModal.setCollegeOnModal(college)
                this.$refs.OpenCollegeTypeModal.click();
            },
            newLessonType: function(){
                this.$refs.OpenLessonTypeModal.click();
            },
            editLesson: function(lesson){
                let lessonData = this.lessonTypes.find(l => l.id == lesson.id);
    
                this.$refs.LessonTypeModal.setLessonTypeOnModal({...lessonData});
                this.$refs.OpenLessonTypeModal.click();
            },

            updateCollegesIntern: function(college){
                let colleges = this.collegesList.map(c => c.name)

                if(college.index != -1){
                    colleges[college.index] = college.name
                }
                else{
                    colleges.push(college.name)
                }

                this.updateColleges(colleges).then(()=> this.onCollegeCreated())
            }
        }, 
        computed: {
            ...mapGetters(['lessonTypes','colleges']),
            collegesList: function(){
                return this.colleges.map((college, index) => {return {index, name: college}})
            }
        },  
        beforeMount(){
            this.getLessonTypes();
            this.getColleges();
        }
    }
    </script>

<style>
    .tableDiv table tbody{
        display: block;
        max-height: 300px;
        overflow-y: scroll;
    }

    .tableDiv table thead, .tableDiv table tbody tr {
        display: table;
        width: 100%;
        table-layout: fixed;
    }
</style>

<style scoped>
    .lessons-screen{
        height: calc(100vh - 110px - 1rem);
        padding-top: 85px;
    }

    .tableDiv{
        padding: 32px 32px;
    }


</style>
    
    