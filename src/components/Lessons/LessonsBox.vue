<template>
    <div class="lessons-box">
        <LessonFilter class="filter" :type="lessonsType" @applyFilters="applyFilters" @cleanFilters="cleanFilters"/>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Carregando aulas...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <h3>Erro ao carregar aulas</h3>
            <p>{{ error }}</p>
            <button @click="retryLoad" class="retry-btn">Tentar novamente</button>
        </div>
        
        <!-- Lessons List -->
        <div v-else class="lessons">
			<Lesson v-for="lesson in internLessons"
			:videosIds="lesson.videosIds" 
			:pdfsIds="lesson.pdfsIds" 
			:folders="lesson.folders"
			:id="lesson.id" 
			:description="lesson.description" 
			:title="lesson.title" 
			:key="lesson.id" 
			:type="lesson.type"
			:myLessonsScreen="lessonsType == 'My'"
			:canBuy="lessonsType == 'Other'"
			@videoClick="(params) => $emit('videoClick', params)"
			@buyLesson="(params) => $emit('buyLesson', params)"
			:showViews="showViews"
			/>
		</div>
       
    </div>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    import LessonFilter from './LessonFilter.vue';
    import Lesson from './Lesson.vue';
export default {
	props: {
		lessonsType: {
			type: String,
			default: "All"
		},
		showViews: {
			type: Boolean,
			default: false
		}
	},
    components: {LessonFilter, Lesson},
    data(){
		return {
			loading: true,
			error: null,
			filter: {
				type: '',
				period: ''
			}
		}
	},	

	methods: {
		...mapActions([
			'getOtherLessons', 
			'getLessonType', 
			'buyLesson', 
			'gerenciaAuth', 
			'generateCob', 
			'getQrCode', 
			'changeLoadingState', 
			'changeLoadingMessage',
			'getLessons',
			'getMyLessons'
		]),
		buyLessonIntern: async function(lesson){
			try {
				const response = await this.getLessonType(lesson.type);
				this.changeLoadingMessage('Gerando QRCode');
				this.changeLoadingState();
				
				await this.gerenciaAuth();
				const cob = await this.generateCob({id: lesson.id, price: response.price});
				const locId = cob.loc.id;
				
				await this.getQrCode(locId);
				this.changeLoadingState();
				this.$refs.OpenQRCodeModal.click();
			} catch (error) {
				console.error('Erro ao comprar aula:', error);
				this.changeLoadingState();
				this.$swal({
					toast: true,
					position: 'top-end',
					showConfirmButton: false,
					timer: 3000,
					icon: 'error',
					title: 'Erro ao processar compra!',
					timerProgressBar: true,
				});
			}
		},
		async getLessonsIntern(){
			try {
				this.loading = true;
				this.error = null;
				
				const distinct = (value, index, self) => { return self.indexOf(value) === index;}
				let lessons = []

				switch(this.lessonsType){
					case "All": 
						lessons = await this.getLessons();
						break;

					case "My": 
						lessons = await this.getMyLessons();
						break;
						
					case "Other": 
						lessons = await this.getOtherLessons();
						break;
				}
				
				return lessons.filter(distinct);
			} catch (error) {
				console.error('Erro ao carregar aulas:', error);
				this.error = 'Falha ao carregar as aulas. Tente novamente.';
				return [];
			} finally {
				this.loading = false;
			}
		},

		retryLoad() {
			this.getLessonsIntern();
		},
		applyFilters(lessonFilter){
			this.filter.type = lessonFilter.type;
			this.filter.period = lessonFilter.period;
		},
		cleanFilters(){
			this.filter.type = "";
			this.filter.period = "";
		}
		
	},
	computed: {
		...mapGetters(['otherLessons', 'qrCode', 'lessons','myLessons', 'lessonsTitleFilter']),
		internLessons(){
			switch(this.lessonsType){
				case "All": return this.lessons;
				case "My": return this.myLessons.filter(lesson => 
					(lesson.title.toLowerCase().indexOf(this.lessonsTitleFilter.toLowerCase()) != -1) &&
						(this.filter.type == "" || lesson.type == this.filter.type) &&
						(this.filter.period == "" || lesson.period == this.filter.period) 
					);
				case "Other": return this.otherLessons.filter(lesson => 
					(lesson.title.toLowerCase().indexOf(this.lessonsTitleFilter.toLowerCase()) != -1) &&
						(this.filter.type == "" || lesson.type == this.filter.type) &&
						(this.filter.period == "" || lesson.period == this.filter.period) 
					);
				default: return this.otherLessons
			}
		},
	
	},
	beforeMount(){
		this.getLessonsIntern()
	}
}
</script>

<style scoped>
.lessons-box{
    max-width: 1000px;
	min-width: 300px;
    border: 1px;
    border-color: #88b7e8;
    background-color: #88b7e8;
    border-radius: 20px;
    padding-top: 40px;
    padding-bottom: 40px;
	margin-left: auto;
	margin-right: 35px;
	margin-top: 150px;
	
}

.lessons{
	height: 600px;
	overflow: auto;
}

.loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 40px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #88b7e8;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-container h3 {
    color: #e74c3c;
    margin-bottom: 10px;
}

.error-container p {
    color: #666;
    margin-bottom: 20px;
    text-align: center;
}

.retry-btn {
    background-color: #88b7e8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

.retry-btn:hover {
    background-color: #6ba3d6;
}



@media (max-width: 800px) {
    .lessons-box{
        margin: 0 auto;
        margin-top: 100px;
    }

	.filter{
		height: 220px;
		margin-bottom: 30px;
	}

  }
</style>