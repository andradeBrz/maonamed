<template>
    <div ref="internMoveToFolderModal" class="modal fade" id="moveToFolderModal" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header teste">
                    <h5 class="modal-title" id="modalTitle"> Para que pasta deseja mover o arquivo? </h5>
                </div>
                <div class="modal-body">
                    <ul class="folder-list">
                        <li class="folder-list__item" v-for="folder in folders" :key="folder.id">
                            <input class="form-check-input" type="checkbox" @change="selectFolder(folder)" :checked="folder.id == selectedFolderId">
                            {{ folder.name }}
                        </li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button type="button" data-bs-dismiss="modal" class="btn btn-light" @click="onCloseModal" > Cancelar </button>
                    <button type="button" data-bs-dismiss="modal" class="btn btn-primary" @click="$emit('ok', {folderId: selectedFolderId, documentId, documentType })"> Mover </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            folders: [],
            selectedFolderId: "",
            documentId: "",
            documentType: ""
        }
    },
    methods: {
        selectFolder: function(folder){
            this.selectedFolderId = folder.id;
        },  
        onCloseModal: function(){
            this.selectedFolderId = "";
        },  
        setDataOnModal: function({folders, documentId, documentType}){
            this.documentId = documentId;
            this.documentType = documentType;
            this.folders = folders;
        }
    }
}
</script>

<style lang="scss" scoped>

.folder-list{
    padding-left: 4px;
    &__item{
        display: flex;
        gap: 8px;
    }
}
</style>