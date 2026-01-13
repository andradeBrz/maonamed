<template>
    <div class="lesson-details-screen">
      <div class="actions-row">
          <div class="lesson-title">
            <button @click="routerBack" class="back-button"><i class="fas fa-arrow-left"></i></button>
            {{ actualLesson.title }} > {{ folder.name }}
          </div>
  
          <input @change="uploadVideo" multiple accept=".mp4" type="file" hidden ref="videoInput">
          <button class="add-button" v-if="currentTab != 'form'" @click="clickInputFileVideo">Adicionar vídeo</button>
  
          <input @change="uploadPdf" multiple accept=".pdf" type="file" hidden ref="pdfInput"/>
          <button class="add-button" v-if="currentTab != 'form'" @click="clickInputFilePdf" >Adicionar PDF</button>
  
          <button class="add-button" v-else @click="updateFolderIntern">Salvar</button>
  
      </div>
  
      <div class="tabs-row">
        <button :class="{'active': currentTab == 'form'}" @click="changeTab('form')">Dados</button>
        <button :class="{'active': currentTab == 'documents'}" @click="changeTab('documents')">Documentos</button>
      </div>
      <hr/>
      <div class="form-row" v-if="currentTab == 'form'">
        <form class="lesson-form">
          <div class="form-group">
              <label for="name" class="col-form-label">Nome:</label>
              <input type="text" class="form-control" id="name" v-model="folder.name">
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
            @editClick="handleDocumentClick"
            @closeClick="handleCloseClick"
          />
          <document-item 
            v-for="video in videos" 
            :key="video.name" 
            :id="video.id" 
            :name="video.name" 
            type="video" 
            @editClick="handleDocumentClick"
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
  
      <button hidden data-bs-toggle="modal" data-bs-target="#editDocumentModal" ref="openDeleteModalBtn"></button>

      <button hidden data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" ref="openDeleteModalBtn"></button>
      <confirm-delete-modal-vue ref="ConfirmDeleteLessonModal" title="Atenção" message="Tem certeza que deseja excluir esse item? Essa operação não poderá ser desfeita." @ok="deleteItem"/>
    </div>
  </template>
<script>
import { mapActions, mapGetters } from 'vuex';
import DocumentItem from '../components/Lessons/DocumentItem.vue';
import EditDocumentModal from '../components/Modal/EditDocumentModal.vue';
import ConfirmDeleteModalVue from '../components/Modal/ConfirmDeleteModal.vue'
import { getFunctions, httpsCallable } from "firebase/functions";

export default {
    components: {DocumentItem, EditDocumentModal, ConfirmDeleteModalVue},
    data(){
        return {
            pdfs: [],
            videos: [],
            loadingFiles: [],
            folder: {
                id: '',
                name: '',
            },
            currentTab: "form"
        }
    },  
    computed:{
        ...mapGetters(
            [
                'actualLesson',
                'actualFolder',
            ]
        ),
        lessonId: function(){
            return this.$route.params.lessonId;
        },
        folderId: function(){
            return this.$route.params.folderId;
        }
    },
    methods: {
    ...mapActions(
      [
        'getDocument',
        'changeLoadingState',
        'addFolderVideo',
        'addFolderPdf',
        'addPandaVideo',
        'addDocument',
        'getFolderDetails',
        'updateFolder',
        'deleteDocumentFromFolder'
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
      this.$refs.openDeleteModalBtn.click();
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
    handleCloseClick(document){
      this.currentDeleteDocument = document;
      this.$refs.openDeleteModalBtn.click();
    },
    async deleteItem(){
      try{
        await this.deleteDocumentFromFolder(
          {
            lessonId: this.lessonId,
            folderId: this.folderId,
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
      let path = `aulas/${this.actualLesson.type}/${this.actualLesson.period}-periodo/${this.actualLesson.title}`;
      let internPath = `${path}/pdfs/${file.name}`;
      let document = {
          content: file,
          path: internPath,
          type: 'pdf'
      }

      this.addDocument(document).then(async documentId => {
        await _this.addFolderPdf({documentId, lessonId: this.actualLesson.id, id: this.actualFolder.id})
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
            await _this.addFolderVideo({lessonId: _this.actualLesson.id, id: _this.actualFolder.id, documentId })
            _this.removeFromLoadingFiles(loadingId)
          })
      }
      reader.readAsArrayBuffer(file);
    },
    getDocumentsList(){
      this.pdfs = [];
      this.videos = [];

      this.getFolderDetails({lessonId: this.lessonId, id: this.folderId}).then(() => {
      this.actualFolder.pdfsIds?.forEach(id => {
        this.getDocument(id).then(documentData => {
          this.pdfs.push(documentData)
        })
      })

      this.actualFolder.videosIds?.forEach(id => {
        this.getDocument(id).then(documentData => {
          this.videos.push(documentData)
        });
      })
    })
    },
    updateFolderIntern(){
        this.updateFolder({lessonId: this.lessonId, id: this.folderId, name: this.folder.name}).then(() => { 
            this.$swal({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Pasta atualizada com sucesso!',
                    timerProgressBar: true,
                });
        })
    }
  },
  beforeMount(){ 

    this.getFolderDetails({lessonId: this.lessonId, id: this.folderId}).then(() => {

        this.folder.name = this.actualFolder.name; 
        this.folder.id = this.actualFolder.id; 

      this.actualFolder.pdfsIds?.forEach(id => {
        this.getDocument(id).then(documentData => {
          this.pdfs.push(documentData)
        })
      })

      this.actualFolder.videosIds?.forEach(id => {
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
  user-select: none;
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