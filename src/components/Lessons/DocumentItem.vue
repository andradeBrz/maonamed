<template>
    <div class="document" :class="{'loading': loading}" @click="handleDocumentClick">

        <div class="close-document">
            
            <div v-if="type != 'folder' && showMoveAction" class="close-button" @click.prevent="emitMove">
                <i class="fa fa-share" aria-hidden="true"></i>
            </div>
            <div class="close-button" @click.prevent="emitClose">
                <i class="fa fa-times" aria-hidden="true"></i>
            </div>


        </div>
        <div class="document-item">
            <i class="fas fa-video" v-if="type == 'video'"></i>
            <i class="fas fa-file-alt"  v-if="type == 'pdf'"></i>
            <i class="fa-solid fa-folder"  v-if="type == 'folder'"></i>
        </div>
        
        <div class="document-name">
            <span>
               {{ name }}
            </span>
            <Spinner class="document-spinner" v-if="loading"/>
        </div>
    </div>
 
</template>

<script>
import Spinner from '../Base/Spinner.vue'
export default {
    props: {
        id: {
            type: String,
            default: "0"
        },
        name: {
            type: String,
            default: 'Sem nome'
        },
        type: {
            type: String,
            default: 'video'
        },
        showMoveAction: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    components: {Spinner},
    methods:{
        handleDocumentClick(){
            if(this.loading) return
            this.$emit('editClick', {id: this.id, name: this.name})
        },
        emitClose(e){
            e.stopPropagation();
            this.$emit('closeClick', {id: this.id, name: this.name, type: this.type})
        },
        emitMove(e){
            e.stopPropagation();
            this.$emit('moveClick', {id: this.id, type: this.type})
        }
    },
  
}
</script>

<style lang="scss" scoped>
.document{
    width: 150px;
    height: 185px;
    border: 1px solid;
    border-radius: 8px;
    background-color: #040472;
    cursor: pointer;
    user-select: none;

    .close-document{
        width: 100%;
        height: 10px;
        border-radius: 20px;
        display: flex;
        justify-content: end;
        align-items: center;
        margin-top: 10px;

        .close-button{
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px white;
            margin-right: 10px;
            height: 22px;
            width: 22px;
            border: solid white 1px;
            border-radius: 23px;
            text-align: center;
            font-size: x-small;
            margin-top: 10px;

            i{
                height: 10px;
            }
        }
        .close-button:hover{
            background-color: #18188cd6;
        }
        
    }
    .document-item{
        height: 85px;
        display: flex;
        justify-content: center;
        align-items: center;
        i{
            color: white;
            font-size: 56px;
        }
    }

    .document-name {
        color: white;
        padding: 12px;
        margin: 4px;
        overflow: hidden;
        overflow-wrap:break-word;
        font-size: 14px;
        height: 80px;

        user-select: none;

       
    }
}

.document:hover{
    background-color: #040472d6;
}
  
.document.loading{
    background-color: gray;
    cursor: not-allowed;

    .document-name{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        span {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            width: 120px;
        }
    }

    .document-spinner{
        margin-left: 20px;
    }
}
</style>