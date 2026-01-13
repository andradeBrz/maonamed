<template>
    <table class="table">
        <thead class="table-head">
            <tr>
            <th v-for="col in structure"  :key="col.id" scope="col"> {{ col.title }}</th>
            <th> </th>
            </tr>
        </thead>
        <tbody class="table-body">
            <tr v-for="obj in content" :key="obj.key">
                <td v-for="col in structure"  :key="col.id" >{{ obj[col.key] }} </td>
                <td v-if="actions">
                    <div class="linkBtnDiv custom_tooltip" @click="$emit('link', obj)">
                        <i class="fa-solid fa-link linkBtn"></i>
                        <span class="tooltiptext">Link
                            
                        </span>
                    </div>
                    <div class="editBtnDiv custom_tooltip" @click="$emit('edit', obj)">
                        <i class="fa-solid fa-pen editBtn"></i>
                        <span class="tooltiptext">Editar</span>
                    </div>
                    <div class="deleteBtnDiv custom_tooltip" @click="$emit('delete', obj)">
                        <i class="fa-solid fa-trash-can deleteBtn"></i>
                        <span class="tooltiptext">Excluir
                            
                        </span>
                    </div>
                    
                </td>
                <td v-if="onlyEdit">
                    <div class="editBtnDiv custom_tooltip" @click="$emit('edit', obj)">
                        <i class="fa-solid fa-pen editBtn"></i>
                        <span class="tooltiptext">Editar</span>
                    </div>
                </td>
                <td v-if="onlyConfirm">
                    <div class="confirmBtnDiv custom_tooltip" @click="$emit('confirm', obj)">
                        <i class="fa-solid fa-check confirmBtn"></i>
                        <span class="tooltiptext">Visto
                            
                        </span>
                    </div>
                </td>
                <td v-if="check">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" @change="$emit('checkChange', obj)" :checked="checkedLessons.indexOf(obj.id) != -1" id="defaultCheck1">
                    </div>
                </td>
                
            </tr>
        </tbody>
    </table>
</template>

<script>
export default {
    props:{
        content: {
            type: Array
        },
        structure: {
            type: Array
        },
        actions: {
            type: Boolean,
            default: false
        },
        onlyEdit: {
            type: Boolean,
            default: false
        },
        onlyConfirm: {
            type: Boolean,
            default: false
        },
        check: {
            type: Boolean,
            default: false
        },
        checked: {
            type: Boolean,
            default: false
        },
        checkedLessons: {
            type: Array,
            default: () => []
        }
    },
}
</script>

<style  scoped>
.tableIconBtn{
    margin-inline: 5px;
}

tr{
    text-align: start;
    vertical-align: middle;
}

.editBtn{
    width: 40px;
    height: 40px;
    text-align: center;
    vertical-align: middle;
    margin-right: 15px;
    color: #6a6aff;
}

.editBtn:hover{
    cursor: pointer;
    color: #4b4bff;
}

.deleteBtn{
    width: 40px;
    height: 40px;
    text-align: center;
    vertical-align: middle;
    margin-right: 30px;
    color: #ff6a6a;
}

.deleteBtn:hover{
    cursor: pointer;
    color: #ff4b4b;
}

.confirmBtn{
    width: 40px;
    height: 40px;
    text-align: center;
    vertical-align: middle;
    margin-right: 30px;
    color: #69de0e;
    display: flex;
    align-items: center;
}


.confirmBtn:hover{
    cursor: pointer;
    color: #2c9b00;
}


.editBtnDiv{
    cursor: pointer;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    
    width: 40px;
    height: 40px;
}
.editBtnDiv:hover{
    border-color: #4b4bff;
}
.editBtnDiv i{
    height: 30px;
    width: 30px;
    
    margin-top: 13px;
}

.deleteBtnDiv{
    cursor: pointer;
    display: inline-block;
    vertical-align: middle;
    text-align: center;

    width: 40px;
    height: 40px;

    margin-inline: 5px;
}

.deleteBtnDiv:hover{
    border-color: #ff4b4b;
}

.deleteBtnDiv i{
    height: 30px;
    width: 30px;
    margin-top: 13px;
}

.confirmBtnDiv{
    cursor: pointer;
    display: inline-block;
    vertical-align: middle;
    text-align: center;

    width: 40px;
    height: 40px;

    margin-inline: 5px;
}

.confirmtnDiv:hover{
    border-color: #4bff7b;
}

.confirmtnDiv i{
    height: 30px;
    width: 30px;
    margin-top: 13px;
}

.linkBtn{
    width: 40px;
    height: 40px;
    text-align: center;
    vertical-align: middle;
    margin-right: 15px;
    color: black;
}

.linkBtn:hover{
    cursor: pointer;
    color: black;
}


.linkBtnDiv{
    cursor: pointer;
    display: inline-block;
    vertical-align: middle;
    text-align: center;

    width: 40px;
    height: 40px;

    margin-inline: 5px;
}

.linkBtnDiv:hover{
    border-color: #ff4b4b;
}

.linkBtnDiv i{
    height: 30px;
    width: 30px;
    margin-top: 13px;
}


/* custom_tooltip container */
.custom_tooltip {
  position: relative;
  display: inline-block;
}

/* custom_tooltip text */
.custom_tooltip .tooltiptext {
  visibility: hidden;
  background-color: rgb(0 0 0 / 67%);
  color: #fff;
  text-align: center;
  padding: 3px 0;
  border-radius: 6px;
  width: 100px;

  /* Position the custom_tooltip text - see examples below! */
  position: absolute;
  z-index: 99;
  top: -30px;
  left: -35px;
}

/* Show the custom_tooltip text when you mouse over the custom_tooltip container */
.custom_tooltip:hover .tooltiptext {
  visibility: visible;
}

.custom_tooltip .tooltiptext::after {
  content: " ";
  position: absolute;
  top: 100%; /* At the bottom of the custom_tooltip */
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgb(69, 69, 69) transparent transparent transparent;
}
</style>