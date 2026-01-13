<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand logo" href="" @click="goTo('Home')"></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="" @click="goTo('MyLessons')">Minhas Aulas</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="" @click="goTo('Lessons')">Buscar Aulas</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="" v-if="actualUser?.admin" @click="goTo('CreateLessons')">Cadastrar Aulas</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="" v-if="actualUser?.admin" @click="goTo('Students')">Gerenciar Alunos</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="" v-if="actualUser?.admin" @click="goTo('CreateLessonTypes')">Gerenciar Tipos</a>
                    </li>
                    <li class="nav-item dropdown userOption">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fa-solid fa-user" aria-hidden="true"></i> 
                            <span class="userName"> {{ actualUser?.name }} </span>
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="#">Outras opções</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li class="nav-item">
                                <a class="dropdown-item" @click="back">Sair</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { signOut } from 'firebase/auth'
import {auth} from '../../firebase/index.js'
import { mapActions, mapGetters } from 'vuex';

export default {
    data(){
        return{userName: '', isAdmin: false}
    },
    methods:{
        ...mapActions(['getUser', 'cleanLessonFilter']),
        back: function(){
            signOut(auth);
            localStorage.removeItem("user")
            localStorage.removeItem("userId")
            document.cookie = "vuex=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;" 
            this.$router.push({
                name: "Login"
            })
        },
        goTo: function(routeName){
            this.cleanLessonFilter();
            this.$router.push({
                name: routeName
            })
        }
    },
    computed:{
        ...mapGetters(['actualUser'])
    },
}
</script>
<style scoped>
.navbar{
    position: fixed;
    width: 100%;
    height: 60px;
    background-color:#040472 !important;
    box-shadow: -8px -1px 5px 0px rgb(0 0 0);
    z-index: 2;
    user-select: none;
}

.userName{
    margin-inline: 10px;
}

.userOption{
    margin-left: 5px;
}

.logo{
    width: 200px;
    height: 50px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 20rem;
    background-image: url('../../../public/logotipo-longo.svg');
}
</style>