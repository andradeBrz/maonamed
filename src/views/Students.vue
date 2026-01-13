<template>
  <div class="users-screen">
    <div>
      <h4 class="pageTitle">Gerenciar Alunos</h4>
      <label class="filter-input">
        Filtro
        <input type="text" class="form-control" v-model="filter"/>
        
      </label>
      <div class="tableDiv">
        
        <table-component actions :structure="tableStructure" :content="filteredStudents" @edit="editUser" @delete="openModalDeleteUser" @link="linkLessons"/>

      </div>
      <div class="paddingDiv">
    
        <button class="btn btn-primary addUserBtn" data-bs-toggle="modal" @click="addUser" >Adicionar aluno</button>
        <button hidden data-bs-toggle="modal" data-bs-target="#userModal" ref="openUserModalBtn"></button>
        <button hidden data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" ref="openDeleteModalBtn"></button>
        <button hidden data-bs-toggle="modal" data-bs-target="#userLessonModal" ref="openUserLessonModalBtn"></button>
      </div>
    </div>
    <div>
      <h4 class="pageTitle">Novos Alunos</h4>
      <div class="tableDiv">
        <table-component onlyConfirm :structure="newUserTableStructure" :content="newStudents" @confirm="updateNewUser"/>
      </div>
    </div>
    <user-modal ref="UserModalRef" @hideModal="getStudents"/>
    <confirm-delete-modal ref="ConfirmDeleteModal" @ok="deleteUser" title="Atenção" message="Tem certeza que deseja excluir esse aluno? Essa operação não poderá ser desfeita."/>
    <user-lesson-modal  ref="UserLessonModal"  />
    
  </div>
</template> 

<script>
import Table from '@/components/Table.vue'
import UserModal from '../components/Modal/UserModal.vue'
import ConfirmDeleteModal from '../components/Modal/ConfirmDeleteModal.vue'
import UserLessonModal from '../components/Modal/UserLessonModal.vue'
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from '../firebase/index.js'
import {collection, getDocs, getDoc, doc, deleteDoc, orderBy, query} from 'firebase/firestore'
import { mapActions } from 'vuex';
export default {
    components: {
        TableComponent: Table,
        UserModal,
        ConfirmDeleteModal,
        UserLessonModal
    },
    data(){
        return{
            tableStructure: [
                {title: 'Nome', key: 'name'},
                {title: 'E-mail', key: 'email'},
                // {title: 'Período', key: 'period'},
                // {title: 'Faculdade', key: 'college'},
              ],
            newUserTableStructure: [
                {title: 'Nome', key: 'name'},
                {title: 'E-mail', key: 'email'},
                {title: 'Período', key: 'period'},
                {title: 'Faculdade', key: 'college'},
                {title: 'Telefone', key: 'phone'},
              ],
            tableStudents: [],
            students: [],
            filter: ""
            
        }
    },
    computed: {
      filteredStudents: function(){
        return this.students.filter(student => student.name.toLowerCase().indexOf(this.filter.toLowerCase()) != -1)
      },
      newStudents: function(){
        return this.students.filter(student => student.newUser)
      }
    },  
    methods: {
      ...mapActions(['updateUserFirestore']),
      addUser: function(){
          this.$refs.UserModalRef.clearModal()
          this.openUserModal();
      },
      editUser: async function(user){
          let docRef = doc(db, 'Users', user.id);
          let userRef = await getDoc(docRef);
          this.$refs.UserModalRef.setUserOnModal({id: user.id, ...userRef.data()})
          this.openUserModal();
      },
      deleteUser: async function(userId){
          const functions = getFunctions();
          const deleteUserCF = httpsCallable(functions, 'deleteUser');          
          deleteUserCF({userId: userId}).then(() => {
              let docRef = doc(db, 'Users', userId);
              deleteDoc(docRef).then(() => {
                  this.getStudents();
              })
          })
      },
      updateNewUser: async function(user){
        user.newUser = false;
        this.updateUserFirestore(user).then(()=> {
          this.getStudents();

          this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Usuário excluído da lista de novos usuários!',
                    timerProgressBar: true,
                });
        })
      },
      linkLessons: async function(user){
          let docRef = doc(db, 'Users', user.id);
          let userRef = await getDoc(docRef);
          this.$refs.UserLessonModal.setUserOnModal({id: user.id, ...userRef.data()})
          this.openUserLessonModal();
      },
      getStudents: function(){
        let localQuery = query(collection(db, "Users"), orderBy("name"))
        getDocs(localQuery).then(students => {
          students.forEach(student => {
              this.students.push( {id: student.id, ...student.data()});
          })
        });

      },
      openModalDeleteUser: function(user){
        this.$refs.ConfirmDeleteModal.setIdOnModal(user.id);
        this.openDeleteModal();
      },

      openDeleteModal: function(){
          this.$refs.openDeleteModalBtn.click();
      },  
      openUserModal: function(){
          this.$refs.openUserModalBtn.click();
      },
      openUserLessonModal: function(){
          this.$refs.openUserLessonModalBtn.click();
      },
    },  
    beforeMount(){
      this.getStudents();
    }
}
</script>

<style scoped>

.users-screen{
  width: 100%;
  padding-top: 100px;
}

.tableDiv{
  padding: 50px;
  padding-bottom: 0;
  max-height: 60vh;
  overflow: auto;
}

.paddingDiv{
  padding-block: 20px;
  padding-inline: 50px;
}
.addUserBtn{
  float: right;
  margin-top: 10px;
}

.filter-input{
  width: 400px;
    display: flex;
    flex-direction: column;
    justify-content: start;
    text-align: start;
    padding-left: 60px;
}

</style>