<template>
    <div ref="internUserModal" class="modal fade" id="userModal" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header teste">
                    <h5 class="modal-title" id="modalTitle">{{ modalTitle }}</h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="cpf" class="col-form-label">CPF:</label>
                            <input type="text" v-mask="'###.###.###-##'" class="form-control" id="cpf" v-model="student.cpf">
                        </div>
                        <div class="form-group">
                            <label for="name" class="col-form-label">Nome:</label>
                            <input type="text" class="form-control" id="name" v-model="student.name">
                        </div>
                        <div class="form-group">
                            <label for="email" class="col-form-label">Email:</label>
                            <input type="text" class="form-control" id="email" v-model="student.email">
                        </div>
                        <div class="form-group" v-if="modalType == 'add'">
                            <label for="email" class="col-form-label">Senha:</label>
                            <input type="password" class="form-control" id="password" v-model="student.password">
                        </div>
                        <div class="form-group">
                            <label for="period" class="col-form-label">Período</label>
                            <select class="form-select" aria-label="Default select example" v-model="student.period">
                                <option selected>Selecione o período</option>
                                <option v-for="period in periods" :key="period" :value="period">{{ period }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="period" class="col-form-label">Faculdade</label>
                            <select class="form-select" aria-label="Default select example" v-model="student.college">
                                <option selected>Selecione a unidade</option>
                                <option v-for="college in colleges" :key="college" :value="college">{{ college }}</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" data-bs-dismiss="modal" class="btn btn-primary" @click="okClick">{{ btnText }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex"
import {mask} from 'vue-the-mask'

export default {
    directives: {mask},
    data(){
        return {
            student: {
                id: '',
                name: '',
                email: '',
                period: '',
                college: '',
                password: '',
                cpf: ''
            },
            modalType: 'add'
        }
    },
    methods:{
        ...mapActions(['getColleges', 'addUser', 'updateUser']),
        okClick: function(){
            this.modalType == 'add' ? this.internAddUser() : this.internUpdateUser()
        },
        internAddUser: async function(){
            this.addUser(this.student).then(() => {
                this.$emit('hideModal');
                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Aluno adicionado com sucesso!',
                    timerProgressBar: true,
                });
            }).catch(error => {
                let errorMessage = error.message;
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Este e-mail já está em uso.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'E-mail inválido.';
                }

                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'error',
                    title: errorMessage,
                    timerProgressBar: true,
                });
            })
        },
        internUpdateUser: function(){
            delete this.student.password;
            this.updateUser(this.student).then(() => {
                this.$emit('hideModal');
                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Aluno atualizado com sucesso!',
                    timerProgressBar: true,
                });
            }).catch(error => {
                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'error',
                    title: error.message,
                    timerProgressBar: true,
                });
            })
        },
        setUserOnModal: function(user){
            this.student.id = user.id;
            this.student.college = user.college;
            this.student.email = user.email;
            this.student.period = user.period;
            this.student.name = user.name;
            this.student.cpf = user.cpf;
            this.modalType = 'edit'
        },
        clearModal: function(){
            this.student.college = '';
            this.student.email = '';
            this.student.period = '';
            this.student.name = '';
            this.student.cpf = '';
            this.modalType = 'add'
        }
    },
    computed:{
        ...mapGetters(['colleges', 'periods']),
        btnText: function(){
            return this.modalType == 'add' ? "Adicionar" : "Salvar";
        },
        modalTitle: function(){
            return this.modalType == 'add' ? "Adicionar Aluno" : "Editar Aluno";

        }
    },      
    async beforeMount(){
        this.getColleges();
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

</style>

<style >
.modal-header button{
    border: none;
    background-color: white;
}
</style>