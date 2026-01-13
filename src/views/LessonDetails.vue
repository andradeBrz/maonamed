<template>
  <div class="lesson-details-screen">
    <div class="actions-row">
        <div class="lesson-title">
          <button @click="routerBack" class="back-button"><i class="fas fa-arrow-left"></i></button>
          {{ actualLesson.title }}
        </div>

        <input @change="uploadVideo" multiple accept=".mp4" type="file" hidden ref="videoInput">
        <button class="add-button" v-if="currentTab != 'form'" @click="clickInputFileVideo">Adicionar vídeo</button>

        <input @change="uploadPdf" multiple accept=".pdf" type="file" hidden ref="pdfInput"/>
        <button class="add-button" v-if="currentTab != 'form'" @click="clickInputFilePdf" >Adicionar PDF</button>

        <button class="add-button" v-if="currentTab != 'form'" data-bs-toggle="modal" data-bs-target="#createFolderModal">Adicionar pasta</button>

        <button class="add-button" v-else @click="updateLessonIntern">Salvar</button>

    </div>

    <div class="tabs-row">
      <button :class="{'active': currentTab == 'form'}" @click="changeTab('form')">Dados</button>
      <button :class="{'active': currentTab == 'documents'}" @click="changeTab('documents')">Documentos</button>
    </div>
    <hr/>
    <div class="form-row" v-if="currentTab == 'form'">
      <form class="lesson-form">
        <div class="form-group">
            <label for="order" class="col-form-label">Ordem:</label>
            <input type="number" id="order" class="form-control" v-model="lesson.order" @keydown="onChangeField('order')">
        </div>
        <div class="form-group">
            <label for="title" class="col-form-label">Título:</label>
            <input type="text" :class="{'form-control': true, 'is-invalid': validity.title.state}" id="title" v-model="lesson.title" @keydown="onChangeField('title')">
            <div class="invalid-feedback">
                {{ validity.title.message }}
            </div>
        </div>
        <div class="form-group">
            <label for="description" class="col-form-label">Descrição:</label>
            <textarea type="textArea" :class="{'form-control': true, 'is-invalid': validity.description.state}" id="description" v-model="lesson.description" rows="2" @keydown="onChangeField('description')"></textarea>
            <div class="invalid-feedback">
                {{ validity.description.message }}
            </div>
        </div>
        <div class="form-group form-switch">
            <label class="col-form-label" for="visible">Visibilidade:</label>
            <input class="form-check-input" v-model="lesson.visible" type="checkbox" role="switch" id="visible">
        </div>
        <div class="form-group">
            <label for="type" class="col-form-label">Tipo:</label>
            <select :class="{'form-select': true, 'is-invalid': validity.type.state}" v-model="lesson.type" @change="onChangeField('type')">
                <option value="" disabled>Selecione o tipo</option>
                <option v-for="lessonType in lessonTypes" :key="lessonType.id" :value="lessonType.id">{{ lessonType.type }}</option>
            </select>
            <div class="invalid-feedback">
                {{ validity.type.message }}
            </div>
        </div>
        <div class="form-group">
            <label for="period" class="col-form-label">Período</label>
            <select :class="{'form-select': true, 'is-invalid': validity.period.state}" aria-label="Default select example" v-model="lesson.period" @change="onChangeField('period')">
                <option value="" disabled>Selecione o período</option>
                <option v-for="period in periods" :key="period" :value="period">{{ period }}</option>
            </select>
            <div class="invalid-feedback">
                {{ validity.period.message }}
            </div>
        </div>
        
    </form>
    </div>
    <div class="documents-row" v-else>
        <document-item
          v-for="pdf in pdfs" 
          :key="pdf.name" 
          :id="pdf.id" 
          :name="pdf.name" 
          type="pdf" 
          showMoveAction
          @editClick="handleDocumentClick"
          @closeClick="handleCloseClick"
          @moveClick="handleMoveClick"

        />
        <document-item 
          v-for="video in videos" 
          :key="video.name" 
          :id="video.id" 
          :name="video.name" 
          type="video" 
          showMoveAction
          @editClick="handleDocumentClick"
          @closeClick="handleCloseClick"
          @moveClick="handleMoveClick"
        />
        <document-item 
          v-for="folder in actualLesson.folders" 
          :key="folder.name" 
          :id="folder.id" 
          :name="folder.name" 
          type="folder" 
          @editClick="handleFolderClick"
          @closeClick="handleCloseClick"
        />
        <document-item 
          v-for="file in loadingFiles" 
          :key="file.name" 
          :name="file.name" 
          :type="file.type" 
          loading
        />
    </div>
  

    <edit-document-modal ref="EditDocumentModal"/>
    <create-folder-modal :lessonId="lessonId" ref="CreateFolderModal" @close="updateItemList"/>
    <button hidden data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" ref="openDeleteModalBtn"></button>
    <move-to-folder-modal ref="MoveToFolderModal" @ok="moveToFolder"/>
    <button hidden data-bs-toggle="modal" data-bs-target="#moveToFolderModal" ref="openMoveToFolderModalBtn"></button>
    <confirm-delete-modal-vue ref="ConfirmDeleteLessonModal" title="Atenção" message="Tem certeza que deseja excluir esse item? Essa operação não poderá ser desfeita." @ok="deleteItem"/>
    <button hidden data-bs-toggle="modal" data-bs-target="#editDocumentModal" ref="openEditDocumentModalBtn"></button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import DocumentItem from '../components/Lessons/DocumentItem.vue';
import EditDocumentModal from '../components/Modal/EditDocumentModal.vue';
import CreateFolderModal from '../components/Modal/CreateFolderModal.vue';
import ConfirmDeleteModalVue from '../components/Modal/ConfirmDeleteModal.vue'
import MoveToFolderModal from '../components/Modal/MoveToFolderModal.vue'
import { getFunctions, httpsCallable } from "firebase/functions";

export default {
  components: {DocumentItem, EditDocumentModal, CreateFolderModal, ConfirmDeleteModalVue, MoveToFolderModal},
  data(){
    return {
      pdfs: [],
      videos: [],
      folders: [],
      loadingFiles: [],
      lesson: {
          order: 0,
          id: '',
          title: '',
          description: '',
          period: '',
          type: '',
          visible: true
      },
      validity: {
        title: {state: null, message: 'Este campo é obrigatório'},
        description: {state: null, message: 'Este campo é obrigatório'},
        period: {state: null, message: 'Este campo é obrigatório'},
        type: {state: null, message: 'Este campo é obrigatório'},
      },
      currentTab: "form",
      currentDeleteDocument: {}
    }
  },  
  computed: {
    ...mapGetters(
      [
        'actualLesson',
        'periods', 
        'lessonTypes'
      ]
    ),
    lessonId: function(){
      return this.$route.params.lessonId;
    }
  },
  methods: {
    ...mapActions(
      [
        'getLessonById', 
        'getDocument',
        'changeLoadingState',
        'getColleges',
        'getLessonTypes',
        'updateLesson',
        'addLessonVideo',
        'addLessonPdf',
        'addPandaVideo',
        'addDocument',
        'deleteDocumentFromLesson',
        'moveDocumentToFolder'
      ]
    ),
    getRandomInt(max) {
      return Math.floor(Math.random() * max);
    },
    onChangeField: function(name){
        this.validity[name].state = false;
    },
    changeTab(name){
      this.currentTab = name;
    },
    routerBack(){
      this.$router.back()
    },
    handleDocumentClick(document){
      this.$refs.EditDocumentModal.setDocumentOnModal(document.name, document.id)
      this.$refs.openEditDocumentModalBtn.click();
    },
    handleCloseClick(document){
      this.currentDeleteDocument = document;
      this.$refs.openDeleteModalBtn.click();
    },
    handleMoveClick(document){
      this.$refs.MoveToFolderModal.setDataOnModal({folders: this.actualLesson.folders, documentId: document.id, documentType: document.type})

      this.$refs.openMoveToFolderModalBtn.click();
    },
    async moveToFolder(data){
      const actionData = {
        documentId: data.documentId,
        folderId: data.folderId,
        documentType: data.documentType,
        lessonId: this.lessonId
      }

      await this.moveDocumentToFolder(actionData);

      this.getDocumentsList();

    },
    async deleteItem(){
      try{
        await this.deleteDocumentFromLesson(
          {
            lessonId: this.lessonId,
            documentId:this.currentDeleteDocument.id,
            ...this.currentDeleteDocument
          }
        );
        this.getDocumentsList();
      }
      catch(error){
        console.error("Error: ", error);
      }
  
    },
    handleFolderClick(folder){
      this.$router.push({
        name: 'FolderDetails',
        params: {
          lessonId: this.lessonId,
          folderId: folder.id
        }
      })
    },
    updateItemList(document){
      let index =  this.pdfs.findIndex(pdf => pdf.id == document.id);
      
      if(index != -1){
        this.pdfs[index].name = document.name;
      }
      else{
        index = this.videos.findIndex(video => video.id == document.id);   
        this.videos[index] = document; 
      }
      
    },
   
    clickInputFilePdf: function(e){
        e.preventDefault();
        this.$refs.pdfInput.click()
    },
    clickInputFileVideo: function(e){
        e.preventDefault();
        this.$refs.videoInput.click()
    },
    addToLoadingFiles(file, type){
      let id = this.getRandomInt()
      this.loadingFiles.push({id, name: file.name, type})
      return id;
    },
    removeFromLoadingFiles(id){
      let index = this.loadingFiles.indexOf(this.loadingFiles.find(elem => elem.id == id))
      this.loadingFiles.splice(index, 1)
      this.getDocumentsList();
    },
    uploadPdf(e){
      let file = Array.from(e.target.files)[0];
      const _this = this;
      const loadingId = this.addToLoadingFiles(file, 'pdf')
      let path = `aulas/${this.lesson.type}/${this.lesson.period}-periodo/${this.lesson.title}`;
      let internPath = `${path}/pdfs/${file.name}`;
      let document = {
          content: file,
          path: internPath,
          type: 'pdf'
      }

      this.addDocument(document).then(async documentId => {
        await _this.addLessonPdf({documentId, id: this.lesson.id})
        _this.removeFromLoadingFiles(loadingId)
      })
    },
    async callPandaAPI(filename, buffer){
      const functions = getFunctions();
      const uploadPandaVideo = httpsCallable(functions, "uploadPandaVideo");
      
      try {
        const result = await uploadPandaVideo({
          filename: filename,
          fileBuffer: buffer
        });
        return result.data.pandaId;
      } catch (error) {
        this.changeLoadingState();
        this.errorSwal(error);
        throw error;
      }
    },
    uploadVideo(e){
      let file = Array.from(e.target.files)[0];
      const loadingId = this.addToLoadingFiles(file, 'video')
      
      const reader = new FileReader();
      const _this = this;

      reader.onload = async function() {
          const arrayBuffer = this.result;
          const pandaId = await _this.callPandaAPI(file.name, arrayBuffer)
          let document = {
            name: file.name,
            pandaId: pandaId,
            type: 'video'
          }

          _this.addPandaVideo(document).then(async documentId  => {
            await _this.addLessonVideo({id: _this.lesson.id, documentId })
            _this.removeFromLoadingFiles(loadingId)
          })
      }
      reader.readAsArrayBuffer(file);
    },
    
    updateLessonIntern(){
      this.changeLoadingState();
      
      this.updateLesson(this.lesson).then(() => {
          this.changeLoadingState();
          this.getLessonById(this.lessonId).then(() => {
            this.setLessonOnForm();
          })
      })
    },
    setLessonOnForm(){
      Object.keys(this.actualLesson).forEach(key => {
        this.lesson[key] = this.actualLesson[key]
      })
    },
    getDocumentsList(){
      this.pdfs = [];
      this.videos = [];

      this.getLessonById(this.lessonId).then(() => {
      this.actualLesson.pdfsIds.forEach(id => {
        this.getDocument(id).then(documentData => {
          this.pdfs.push(documentData)
        })
      })

      this.actualLesson.videosIds.forEach(id => {
        this.getDocument(id).then(documentData => {
          this.videos.push(documentData)
        });
      })
    })
    },
   
  },
  beforeMount(){ 
    this.getColleges();
    this.getLessonTypes();

    this.getLessonById(this.lessonId).then(() => {
      this.setLessonOnForm()
      this.actualLesson.pdfsIds.forEach(id => {
        this.getDocument(id).then(documentData => {
          this.pdfs.push(documentData)
        })
      })

      this.actualLesson.videosIds.forEach(id => {
        this.getDocument(id).then(documentData => {
          this.videos.push(documentData)
        });
      })

    })
  }

}
</script>

<style scoped lang="scss">
.lesson-details-screen{
  width: 100%;
  padding-top: 100px;
  padding-inline: 50px;

  hr{
    margin-top: 0;
  }

  .actions-row{
    display: inline-flex;
    width: 100%;

    .lesson-title{
      margin-right: auto;
      font-weight: 600;
      font-size: 24px;
      user-select: none;

      .back-button{
        border-color: #040472;
        border-radius: 56px;
        background-color: #040472;
        color: white;
        height: 42px;
        width: 42px;
        margin-right: 16px;
        user-select: none
      }
    }
    .add-button{
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
      height: 32px;
    }
  }

  .tabs-row{
    display: inline-flex;
    justify-content: start;
    width: 100%;
    margin-top: 24px;
    gap: 8px;

    button {
      border-bottom: none;
      border-width: 1px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      user-select: none;
    }

    button.active {
      background-color: #040472;
      color: white;
      border-color: #040472;
    }
  }

  .documents-row{
    width: 100%;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
    justify-content: start;
    margin-top: 36px;
    height: 650px;
  }

  .form-row {
    user-select: none;
    .lesson-form{
      display: flex;
      flex-direction: column;
      text-align: start;
      gap: 16px;

      .form-switch{
        padding-left: 0;
        display: flex;
        flex-direction: column;
        input {
          margin-left: 0;
        }
      }
    }
  }

 
}
</style>