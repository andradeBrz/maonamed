<template>
  <div class="accordion lesson" :id="id">
    <div class="accordion-item">
        <h2 class="accordion-header" :id="'title-' + id">
            <button hidden data-bs-toggle="collapse" :data-bs-target="'#content-' + id"  :aria-controls="'content-' + id" :ref="'ref_' + id"></button>
            <button :class="{'accordion-button': true, 'btnRight': !canEdit}" type="button"  @click="toggleLesson">
                <div class="lessonTitle">
                    {{ title }} 
                </div>
                <div class="actions" v-show="canEdit">
                    <i class="fa-solid fa-pen editBtn"  @click="editLesson"></i>
                    <i class="fa-solid fa-trash-can deleteBtn" @click="deleteLesson"></i>
                </div>
            </button>
           
        </h2>
        <div :id="'content-' + id" class="accordion-collapse collapse" :aria-labelledby="'title-' + id" :data-bs-parent="'#' + id">
            <div class="accordion-body" v-show="loaded">
                <div class="description">
                    <p>
                            {{ description }}
                    </p>
                </div>
                <hr/>
                <div v-if="!canBuy">
                    <div  v-for="folder in mappedFolders" :key="folder.id">

                        <div class="folder" v-if="folder.videos.length || folder.pdfs.length">
                            <div class="folder__name">
                                <h5>
                                    {{ folder.name }}
                                </h5>
                            </div>
                            <div class="folder__section" v-if="folder.videos.length">
                                <h5>AULAS</h5>
                                <div v-for="video in folder.videos" :key="video.id" class="clickableLink">
                                    <div @click="$emit('videoClick', {video: video, lessonId: id})">
                                        {{ video.name }}
                                    </div>
                                </div>
                            </div>
                            <div class="folder__section" v-if="folder.pdfs.length">
                                <h5>MATERIAIS</h5>
                                <div v-for="pdf in folder.pdfs" :key="pdf.id" class="clickableLink">
                                    <div>
                                        <a class="normalText" :href="pdf.url">{{ pdf.name }}.pdf </a> 
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div class="clickableLink" v-for="video in videos" :key="video.id">
                        <div @click="$emit('videoClick', {video: video, lessonId: id})">
                            - <i class="fa-regular fa-file-video"></i> {{ video.name }}.mp4
                                <span v-if="showViews">
                                    - {{ 4 - video.views }} {{(4 - video.views) > 1 ? 'visualizações restantes.' : 'visualização restante.' }} 
                                </span>                          
                        </div>
                    </div>
                    <hr/>
                    <div class="clickableLink" v-for="pdf in pdfs" :key="pdf.id">
                        <div @click="$emit('pdfClick', {pdf: pdf, lessonId: id})"  v-if="canEdit || !canBuy" >
                            - <i class="fa-regular fa-file-pdf"></i> <a class="normalText" :href="pdf.url" target="_blank">{{ pdf.name }}.pdf </a> 
                        </div>
                        <div @click="$emit('pdfClick', {pdf: pdf, lessonId: id})"  v-else >
                            - <i class="fa-regular fa-file-pdf"></i> <a class="normalText">{{ pdf.name }}.pdf </a> 
                        </div>
                    </div>
                </div>
                <div class="btnDiv ">
                    <button class="buyLessonBtn" @click="$emit('buyLesson', {id: id, type: type})" v-if="canBuy"> Adquirir aula </button>
                </div>
            </div>

            <div class="card" aria-hidden="true" v-show="!loaded">
                <div class="card-body">
                    <p class="card-text placeholder-glow">
                        <span class="placeholder col-8"></span>
                        <span class="placeholder col-7"></span>
                        <span class="placeholder col-8"></span>
                    </p>
                </div>
            </div>
        </div>
    </div>
  </div>

</template>

<script>

import { mapActions } from 'vuex'
export default {
    props:{
        id: {
            type:String
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        videosIds: {
            type: Array
        },
        pdfsIds: {
            type: Array
        },
        folders: {
            type: Array,
            default: () => []
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        canBuy: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: ""
        },
        showViews:{ 
            type: Boolean,
            default: false
        },
        views: {
            type: String,
            default: "0"
        },
        myLessonsScreen: {
            type: Boolean,
            default: false
        }
    },
    data(){
        return{
            loaded: false,
            videos: [],
            pdfs: [],
            mappedFolders: []
        }
    },  
    methods:{
        ...mapActions(['getDocument', 'getDocumentUrl', 'getViewsByLessonId', 'verifyLessonUpdates']),
        toggleLesson: function(){
            this.$refs[`ref_${this.id}`].click();
            if(!this.loaded)
                this.getLessonDetails();
        },
        editLesson: async function(e){
            e.stopPropagation();
            await this.getLessonDetails();
            this.$emit('editLesson', {id: this.id, title: this.title, description: this.description, videos: this.videos, pdfs: this.pdfs})
        },
        deleteLesson: function(e){
            e.stopPropagation();
            this.$emit('deleteLesson', this.id)
        },
        getLessonDetails: async function(){
            if(this.myLessonsScreen){
                this.verifyLessonUpdates(this.id)
            }
            await Promise.all(this.videosIds.map(async videoId => {
                let document = await this.getDocument(videoId);

                if(this.showViews){
                    const views = await this.getViewsByLessonId({lessonId: this.id, videoId: videoId})
                    document.views = views;
                }

                if(!this.videos.find(v => v.id == document.id))
                    this.videos.push(document)
            }))

            this.videos?.sort((a, b) => a.name.localeCompare(b.name));

            await Promise.all(this.pdfsIds.map( async id => {
                let document = await this.getDocument(id);

                const url = await this.getDocumentUrl(document.path)

                document.url = url;

                if(!this.pdfs.find(p => p.id == document.id))
                    this.pdfs.push(document)
            }))

            this.pdfs?.sort((a, b) => a.name.localeCompare(b.name));

            await Promise.all(this.folders.map( async folder => {
                let mappedFolder = {...folder, videos: [], pdfs: []}
                if(folder.videosIds)
                    await Promise.all(folder.videosIds.map(async videoId => {
                        let document = await this.getDocument(videoId);
                        mappedFolder.videos.push(document)
                    }))

                mappedFolder.videos?.sort((a, b) => a.name.localeCompare(b.name));

                if(folder.pdfsIds)
                    await Promise.all(folder.pdfsIds.map( async pdfId => {
                        let document = await this.getDocument(pdfId);

                        const url = await this.getDocumentUrl(document.path)
                        document.url = url;
                        mappedFolder.pdfs.push(document)
                    }))


                mappedFolder.pdfs?.sort((a, b) => a.name.localeCompare(b.name));
                if(!this.mappedFolders.find(folder => folder.id == mappedFolder.id)){

                    this.mappedFolders.push(mappedFolder);
                }
            }))

            this.loaded = true;
        }
    },
}
</script>

<style scoped lang="scss">
.lesson{
    padding-inline: 20px;
    padding-block: 5px;
}
    .normalText{
       color: black; 
    }
    .accordion-item{
       border-color: rgb(177 177 177) !important;
       border-radius: 20px !important;
    }
    .accordion-button{
        background-color: white !important;
        color: #040472 !important;
        border-radius: 20px !important;
       font-weight: 500 !important;
        font-size: 20px;
    }
    .accordion-button.collapsed{
        background-color: white !important;
    }
    .accordion-button::after{
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAuUlEQVR4nO3XTQrCMBCG4bmExdz/KkJBXdlFj/NKoSgWhWr+ZvB7VyEhkIesxkwppZRSSilVIGAATsBlWVvEgANw49kMJAv4E9MKmDbrIeJPzMDxzV4Kh7DPZykcIgyGHQj3GL5AuMXwA8IdhgyEGwwFEN0xFER0w1AB0RxDRUQzDA0Q1TE0RFTD9EAUx/REFMN4QGRjPCGyMOt87W6a43XqPO+5MAJXT4gNZnnb+NhUSimllFLq77oDYPHP2YLmYzwAAAAASUVORK5CYII=") !important;
    }

    .accordion-body{
        text-align: left !important;
    }
    .clickableLink{
        margin-block: 15px;
    }
    .clickableLink:hover{
        text-decoration: underline;
        font-weight: bold;
        cursor: pointer;
    }

    .description p {
        word-wrap: break-word;
        color: #040472;
    }

    .card-body span{
        float: left;
        height: 25px;
        margin-block: 7px;
    }

    .placeholder{
        border-radius: 5px;
    }

    .actions{
        margin-left: auto;
        margin-right: 30px;
        z-index: 999;
        cursor: pointer;
        color: #ffe2e2;
    }

    .editBtn{
        margin-right: 20px;
    }
    .editBtn:hover{
        color: white;
    }
    .deleteBtn:hover{
        color: white;
    }

    .accordion-button::after {
        margin-left: 0 ;
    }

    .btnRight::after{
        margin-left: auto !important;
    }

    .btnDiv{
        display: flex;
        justify-content: end;
    }

    .buyLessonBtn{
        margin-left: auto;
        display: flex;
    line-height: 1;
    min-width: 250px;
    text-align: center;
    border: solid;
    border-radius: 40px;
    border-color: #040472;
    color: white;
    background-color: #040472;
    font-weight: 500;
    font-size: 30px;
    height: 50px;
    vertical-align: middle;
    display: table-cell;
}

.folder{
    background-color: #daecff;
    padding: 8px;
    border-radius: 16px;
    margin-bottom: 16px;

    &__name{
        width: 100%;
        border: 1px solid;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 24px;
        background-color: #88b7e8;
        border-color: #88b7e8;
        color: white;
        padding: 6px;

        h5{
            margin: 0;
            font-size: 20px;
        }
    }

    &__section{
        h5{
            margin-top: 16px;
            margin-bottom: 6px;

            font-size: 16px;
            font-weight: 800;
        }
    }
}

</style>
