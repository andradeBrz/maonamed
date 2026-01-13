<template>
	<div class="filter">
		<div class="row filters-row">
			<div class="col-md-6 filterOption">
			<form>
				<div class="form-group">
					<input type="text" class="form-control" id="title" placeholder="Nome da aula..." v-model="titleModel">
				</div>
			</form>
			</div>
			
			<div class="col-md-3 filterOption">
				<div class="form-group">
					<select class="form-select" aria-label="Default select example" v-model="lesson.period" >
						<option value="" disabled>Período</option>
						<option v-for="period in periods" :key="period" :value="period">{{ period }}</option>
					</select>
				</div>
			</div>
			<div class="col-md-3 filterOption">
				<div class="form-group">
					<select class="form-select" v-model="lesson.type" >
						<option value="" disabled>Tipo</option>
						<option v-for="lessonType in lessonTypes" :key="lessonType.id" :value="lessonType.id">{{ lessonType.type }}</option>
					</select>
				</div>
			</div>
			
			</div>
			<div class="row actions-row">
				<div class="col-md-12 filterOption filterAction">
				<button class="action-button"  @click="applyFilters"><i class="fas fa-search"></i></button>
				<button class="action-button" @click="cleanFilters"><i class="fa-solid fa-broom"></i></button>
			</div>
			

		</div>
		
	</div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
export default {
	props: {
		type: {
			type: String,
			default: "Other"
		}
	},	
	data(){
		return{
			lesson: {
				title: '',
				type: '',
				period: ''
			}
		}
	},
	computed:{
		...mapGetters(['periods', 'lessonTypes']),
		titleModel:{
			get(){
				return this.lesson.title
			},
			set(newValue){
				this.lesson.title = newValue;
				this.setLessonsTitleFilterOnState(newValue)
			}
		}
	},
	methods: {
		...mapMutations(['setLessonsTitleFilterOnState']),
		...mapActions(['getColleges', 'getOtherLessons', 'getMyLessons', 'setLessonFilter', 'cleanLessonFilter', 'getLessonTypes']),
		applyFilters: function(){
			this.$emit('applyFilters', this.lesson)
		},
		cleanFilters: function(){
			this.cleanLessonFilter();
			this.lesson.type = "";
			this.lesson.period = "";
			this.$emit('cleanFilters')
		}
	},
	beforeMount(){
		this.getColleges()
		this.getLessonTypes()
	}
}
</script>

<style scoped>
.actions-row{
	justify-content: end;
}
.filters-row{
	height: 55px;
	align-items: center;
}
.filter{
	margin-inline: 30px;
}
.filterOption input, select{
	border-color: #040472;
	border-width: 0.5px;
	border-radius: 15px;
	background-color: #88b7e8;
	font-size: 20px;
}

.filterBtn{
	max-width: 150px;
}
.filterBtn:first-of-type{
	margin-left: auto;
	margin-right: 20px;
}
.btnLine{
	width: 100%;
	display: flex;
	margin-top: 20px;
}

label{
    float: left;
}

.action-button{
	font-size: x-large;
    border-radius: 50px;
    width: 50px;
    height: 50px;
    background-color: #040472;
    color: #88b7e8;
}

.filterAction{
	gap: 10px;
    flex-direction: row;
    display: flex;
	justify-content: end;
}

@media (max-width: 800px) {
	.filterAction{
		justify-content: end;
		margin-top: 10px;
	}

	.filters-row{
		gap: 15px;
	}

	.actions-row{
		padding-top: 115px;
	}
  }


</style>