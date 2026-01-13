<template>
    <div class="lesson">
        <div class="lesson-title">
            {{ lesson.title }}

        </div>
        <hr/>
        <div class="lesson-description">
            {{ lesson.description }}
        </div>
        <div class="lesson-actions">
            <div class="count">
                <div class="title">
                    VIDEOS
                </div>
                <div>
                    {{ lesson.videosIds.length }}
                </div>
            </div>
            <div class="count">
                <div class="title">
                    PDFS
                </div>
                <div>
                    {{ lesson.pdfsIds.length }}
                </div>

            </div>
            <button class="icon-button edit-button" @click="handleEdit"><i class="fas fa-pencil-alt"></i></button>
            <button class="icon-button exclude-button" @click="handleDelete"><i class="fas fa-trash-alt"></i></button>
        </div>

    </div>
</template>

<script>
export default {
    props:{
        lesson: {
            type: Object,
            default: () => {}
        } 
    },
    methods: {
        handleEdit: function(){
            this.$router.push({
                name: "LessonDetails",
                params: {lessonId: this.lesson.id}
            })
        },
        handleDelete: function(){
            this.$emit('delete', this.lesson.id)
        }
    }
}
</script>

<style lang="scss" scoped>
 .lesson {
    min-width: 450px;
    height: 300px;
    border: 1px solid;
    border-radius: 12px;
    background-color: #88b7e8;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    user-select: none;

    .lesson-title{
        user-select: none;
        font-weight: 600;
        padding-bottom: 1rem;
        padding: 12px;

    }

    .lesson-description{
        user-select: none;
        text-align: start;
        padding: 4px;
        overflow: hidden; 
        padding-inline: 12px;

    }

    .lesson-actions{
        user-select: none;
        width: 100%;
        margin-top: auto;
        padding-top: 12px;
        justify-content: end;
        display: flex;
        padding: 12px;
        padding-top:  20px;
        gap: 16px;

        .count{
            margin-left: 16px;
            .title{
                font-weight: 500;
            }
        }

        .icon-button{ 
            height: 50px;
            width: 50px;
            border-radius: 100px;
            display: flex;
            justify-content: center;
            align-items: center;

            i{
                font-size: 20px;
            }
        }

        .edit-button{
            background-color: #040472;
            border-width: 0px;

            margin-left: auto;

            i{
                color: white;
            }
        }
        .edit-button:hover{
            background-color: #151597;
        }

        .exclude-button{
            background-color: #9d0000;
            border-width: 0px;
            i{
                color: white;
            }
        }
        .exclude-button:hover{
            background-color: #be0000;
        }
    }

    hr{
        margin-top: 0;
    }
 }
</style>

<style>
.screen-content{
    background-color: #88b7e84a;
}
</style>