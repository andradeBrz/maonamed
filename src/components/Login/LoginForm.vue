<template>
    <section class="majorSection">
        <section class="centerSection">
            <div class="logo"></div>
            <div class="loginForm"> 
                <form v-if="currentTab == tabs.login">
                    <div class="mb-3">
                        <input class="form-control form-input" :class="{'is-invalid': emailErrorMessage}" @keydown="verifyEmail" v-model="email" type="email" placeholder="e-mail">
                        <div class="invalid-feedback">
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="form-input password-div" >
                            <input class="form-control password-input" :class="{'is-invalid': passwordErrorMessage}"  v-model="password" :type="passwordType" id="password" placeholder="senha">
                            <div v-if="passwordType == 'password'"  @click="showPassword">
                                <i class="fa-solid fa-eye-slash" ></i>
                            </div>
                            <div v-else  @click="hidePassword">
                                <i  class="fa-solid fa-eye"></i>
                            </div>   
                            <div class="invalid-feedback">
                            </div>
                        </div>
                    </div>
                    <a class="small text-muted forgotPassword" @click="clickForgotPass">Esqueceu sua senha?</a>

                    <div class="pt-1 mb-4 mt-2">
                        <button class="btn btn-lg btn-block loginBtn" @click="login" type="button">
                            <Spinner v-if="singningIn" />
                            <div>
                                {{ loginBtnText }}
                            </div>
                        </button>
                    </div>
                     
                </form>
                
                <form v-if="currentTab == tabs.forgotPassword">
                    <div class="mb-3">
                        <input class="form-control form-input" v-model="email" type="email" placeholder="e-mail">
                    </div>
                    <div class="pt-1 mb-4 mt-2 form-actions">
                        <button class="btn btn-lg btn-block loginBtn" @click="sendResetPasswordEmail" type="button">
                                Enviar email
                        </button>
                        <button class="btn btn-lg btn-block backBtn" @click="back" type="button">
                                Voltar
                        </button>
                    </div>
                     
                </form>

                <form v-if="currentTab == tabs.signup">
                    <div class="form-group sign-up-form">
                        <input type="text" placeholder="CPF" v-mask="'###.###.###-##'" class="form-input form-control" id="cpf" v-model="signUpStudent.cpf">
                        <input type="text" placeholder="Nome" class="form-input form-control" id="name" v-model="signUpStudent.name">
                        <input type="text" placeholder="E-mail" class="form-input form-control" id="email" v-model="signUpStudent.email">
                        <input type="text" placeholder="Celular" v-mask="'(##) #####-####'" class="form-input form-control" id="phone" v-model="signUpStudent.phone">
                        <div class="form-input password-div">
                            <input class="form-control password-input" :class="{'is-invalid': passwordErrorMessage}"  v-model="signUpStudent.password" :type="signUpPasswordType" id="password" placeholder="Senha">
                            <div v-if="signUpPasswordType == 'password'"  @click="showSignUnPassword">
                                <i class="fa-solid fa-eye-slash" ></i>
                            </div>
                            <div v-else  @click="hideSignUpPassword">
                                <i  class="fa-solid fa-eye"></i>
                            </div>   
                            <div class="invalid-feedback">
                            </div>
                        </div>
                        <select class="form-select form-input"  v-model="signUpStudent.period">
                            <option selected value="">Selecione o período</option>
                            <option v-for="period in periods" :key="period" :value="period">{{ period }}</option>
                        </select>
                        
                        <select class="form-select form-input" v-model="signUpStudent.college">
                            <option selected value="">Selecione a unidade</option>
                            <option v-for="college in colleges" :key="college" :value="college">{{ college }}</option>
                        </select>
                    </div>

                    <div class="pt-1 mb-4 mt-2 form-actions">
                        <button class="btn btn-lg btn-block loginBtn signUpBtn" @click="signUp" type="button">
                            <Spinner v-if="singningUp" />
                            <div>
                                {{ signUpBtnText }}
                            </div>
                        </button>
                        <button class="btn btn-lg btn-block backBtn" @click="back" type="button">
                                Voltar
                        </button>
                    </div>
                </form>

                <section v-else>
                    <div class="orText">
                        ou
                    </div>
                    <div>
                        <div class="notSignedMessage">
                            Ainda não possui cadastro?
                        </div>
                        <div class="pt-1 mb-4 mt-2 actions">
                            <button class="btn btn-lg btn-block signUpBtn" @click="clickSignUp" type="button">
                                Clique aqui para criar o seu!
                            </button>
                         
                        </div>
                        <div class="notSignedMessage2">
                            Possui dúvidas?
                        </div>
                        <div class="pt-1  actions">
                           
                            <button class="btn btn-lg btn-block contactBtn" @click="gotoWpp" type="button">
                                <div>
                                    Entre em contato conosco
                                </div>
                                <i class="fa-brands fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>  
                </section>
            </div>
        </section>
       
    </section>
</template>



<script>
import {getAuth, sendPasswordResetEmail, signInWithEmailAndPassword} from "firebase/auth";
import { mapActions, mapGetters } from "vuex";
import Spinner from "../Base/Spinner.vue";

export default ({
    components: {Spinner},
    data(){
        return{
            singningUp: false,
            singningIn: false,
            logging: false,
            email: "",
            password: "",
            emailErrorMessage: "",
            passwordErrorMessage: "",
            forgotPassword: false,
            passwordType: "password",
            signUpPasswordType: "password",
            currentTab: "login",
            tabs: {
                forgotPassword: 'forgotPassword',
                login: 'login',
                signup: 'signup',
            },
            signUpStudent: {
                name: '',
                email: '',
                period: '',
                college: '',
                password: '',
                cpf: '',
                phone: '',
                newUser: true
            },
        }
    },
    computed: {
        ...mapGetters(['colleges', 'periods']),
        signUpBtnText: function(){
            return this.singningUp ? "Cadastrando" : "Cadastrar"
        },
        loginBtnText: function(){
            return this.singningIn ? "Entrando" : "Entrar"
        }
    },  
    methods: {
        ...mapActions(['setUser', 'getUserByEmail', 'getColleges', 'addUser']),
        showPassword: function(){
            this.passwordType = 'text'
        },
        hidePassword: function(){
            this.passwordType = 'password'
        },
        showSignUnPassword: function(){
            this.signUpPasswordType = 'text'
        },
        hideSignUpPassword: function(){
            this.signUpPasswordType = 'password'
        },
        gotoWpp: function(){
            window.location = "https://wa.me/message/2BDKZIFAIZQNH1"
        },
        validateFields: function(){
            let allOk = true;
            Object.keys(this.signUpStudent).forEach(key => {
                if(!this.signUpStudent[key]){
                    this.$swal({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        icon: 'warning',
                        title: 'Preencha todos os campos!',
                        timerProgressBar: true,
                    });

                    allOk = false;
                }
                
            })

            return allOk;
        },
        signUp: async function(){
            this.singningUp = true;

            let allOk = this.validateFields();

            if(!allOk){
                this.singningUp = false;
                return;
            }

            this.signUpStudent.email = this.signUpStudent.email.toLowerCase(); 
            try{
                await this.addUser(this.signUpStudent);

                let clearStudent = {
                    name: '',
                    email: '',
                    period: '',
                    college: '',
                    password: '',
                    cpf: ''
                }
                this.signUpStudent = {
                    ...clearStudent
                }

                this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Cadastro realizado com sucesso!',
                    timerProgressBar: true,
                });
                this.currentTab = "login"
                this.singningUp = false;
            }
            catch(error){
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

                this.singningUp = false;
            }
        },
        login: async function(){
            this.singningIn = true;
            const auth = getAuth();
            
            try {
                await signInWithEmailAndPassword(auth, this.email.toLowerCase(), this.password);
                const user = await this.getUserByEmail(this.email);
                
                if (!user) {
                    throw new Error("Usuário não encontrado no banco de dados.");
                }

                localStorage.setItem("userId", user.id);
                localStorage.setItem("user", JSON.stringify({uid: user.id, ...user}));
                this.$router.push({ name: "Home" });
                this.singningIn = false;
            } catch (error) {
                this.singningIn = false;
                switch(error.code){
                    case 'auth/invalid-email': 
                        this.emailErrorMessage = "Email inválido."
                    break; 
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        this.passwordErrorMessage = "Senha incorreta."    
                    break; 
                    case 'auth/user-not-found':
                        this.emailErrorMessage = "Usuário não encontrado."
                    break;
                    default:
                        if (!error.code && error.message) {
                            this.$swal({
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 3000,
                                icon: 'error',
                                title: error.message,
                                timerProgressBar: true,
                            });
                        } else {
                            this.passwordErrorMessage = "Erro ao fazer login."
                        }
                    break;
                }
            }
        },
        verifyEmail: function() {
            let isValidEmail = this.email.toLowerCase()
                .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
            
            isValidEmail ? this.emailErrorMessage = '' :  this.emailErrorMessage = 'Email inválido.';
        },
        clickForgotPass: function(){
            this.currentTab = this.tabs.forgotPassword;
            this.forgotPassword = true;
        },
        clickSignUp: function(){
            this.currentTab = this.tabs.signup
        },
        sendResetPasswordEmail: function(){
            sendPasswordResetEmail(getAuth(), this.email);
        },
        back(){
            this.currentTab = this.tabs.login;
            this.forgotPassword = false;
        },
       
    },
    beforeMount(){
        this.getColleges();
    }

})
</script>


<style scoped>
.majorSection{
    height: 600px;
    width: 100%;
}

.centerSection{
    height: 100%;
    margin: 0 auto;
}
.logo{
    margin:0 auto;
    width: 80%;
    height: 20%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 45rem;
    background-image: url('../../../public/white-long-logo.svg');
}
.loginForm{
    margin:0 auto;
    width: 80%;
}
.form-control{
    width: 50%;
    margin: 0 auto;
}

.forgotPassword{
    color: #88b7e9 !important;
    font-weight: 600;
    font-size: larger;
}

.password-div{
    width: 50%;
    margin: 0 auto;
}

.loginBtn{
    line-height: 1;
    width: 100%;
    max-width: 375px;
    border: solid;
    border-radius: 40px;
    border-color: #040472;
    color: white;
    background-color: #040472;
    font-weight: 500;
    font-size: 30px;
    height: 50px;
    vertical-align: middle;
    display: inline-flex;
    justify-content: center;
}
.orText{
    color: #88b7e9 !important;
    font-weight: 500;
    font-size: larger;
    border-bottom: solid 0.8px;
    width: 50%;
    margin: 0 auto;
    margin-top: 45px;
}

.notSignedMessage{
    margin-top: 25px;
    font-size: 23px;
    color: #040472;
    font-weight: 500;
}
.notSignedMessage2{
    font-size: 23px;
    color: #040472;
    font-weight: 500;
}

.description{
    margin: 0 auto;
    max-width: 315px;
    line-height: 1;
    font-size: 18px;
}

.signUpBtn{
    line-height: 1;
    min-width: 375px;
    width: 50%;
    border: solid;
    border-radius: 40px;
    border-color: #040472;
    color: white;
    background-color: #040472;
    font-weight: 500;
    font-size: 20px;
    min-height: 45px;
    text-decoration: underline;
}
.contactBtn{
    line-height: 1;
    min-width: 375px;
    width: 50%;
    border: solid;
    border-radius: 40px;
    border-color: #040472;
    color: white;
    background-color: #040472;
    font-weight: 500;
    font-size: 20px;
    min-height: 45px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
}

.contactBtn > div {
    text-decoration: underline;
}

.contactBtn > i {
    font-size: xx-large;
}

.backBtn{
    color: #040472;
    background-color: white;

    border-color: #040472;
    border: solid;
    border-radius: 40px;

    font-weight: 500;
    font-size: 30px;

    line-height: 1;
    width: 50%;
    height: 50px;
    vertical-align: middle;
    display: table-cell;
}

.form-actions{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.form-input{
    width: 100%;
    max-width: 370px;
    border-style: solid;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}

.form-select{
    width: 50%;
    margin: 0 auto;
}

.password-input{
    margin: 0;
    width: calc(100% - 50px);
    border: none;
    font-weight: 300 !important;
    font-size: large !important;
    padding-left: 0;
}


.password-input:focus{
    box-shadow: none;
}

.sign-up-form{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
  
.signUpBtn {
    display: inline-flex;
    justify-content: center;
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

@media (max-width: 560px) {
    .logo{
        background-size: 30rem;
    }
}
</style>