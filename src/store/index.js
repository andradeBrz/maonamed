import { createStore } from 'vuex'
import { db, storage, app, functions } from '../firebase/index.js'
import { uploadBytes, ref as stRef, getBytes, getDownloadURL } from 'firebase/storage'
import { 
	collection,
	getDocs, 
	doc, 
	setDoc, 
	deleteDoc,
	getDoc, 
	addDoc , 
	query, 
	where, 
	orderBy,
 } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'

export default createStore({
	state: {
		loading: {
			state: false,
			message: 'Carregando'
		},
		lessonFilter: {
			text: '',
			wheres: []
		},
		lessonsTitleFilter: '',
		lessons: [],
		lessonTypes: [],
		myLessons: [],
		otherLessons: [],
		actualLesson: {},
		actualFolder: {},
		actualVideoId: "",
		colleges: [],
		periods: [],
		actualUser: {},
		lessonViews: 0,
		gerenciaNet: {
			authToken: '',
			cob: {
			},
			qrCode: ''
		},
		// Cache para consultas frequentes
		cache: {
			documents: new Map(),
			lessonTypes: new Map(),
			users: new Map(),
			lastUpdated: new Map()
		},
	},
	mutations: {
		//Loading
		setLoadingMessageOnState: function(state, message){
			state.loading.message = message;
		},
		setLoadingOnState: function(state){
			state.loading.state = !state.loading.state;
		},

		//Colleges
		setCollegesOnState: function(state, colleges){
			colleges.forEach(college => {
				state.colleges.splice(0)
				state.colleges.push(...college.data().name)
				state.periods.splice(0)
				state.periods.push(...college.data().period)
			})
		},
		
		//Lessons
		setLessonsOnState: function(state, lessons){
			state.lessons.splice(0);
			lessons.forEach(lesson => {
				let lessonData = {id: lesson.id, ...lesson.data()}
				state.lessons.push(lessonData)
			})
		},
		setLessonOnState: function(state, lesson){
			state.actualLesson = lesson;
		},
		setFolderOnState: function(state, folder){
			state.actualFolder = folder;
		},
		setMyLessonsOnState: function(state, myLessons){
			state.myLessons = myLessons;
		},
		setOtherLessonsOnState: function(state, otherLessons){
				state.otherLessons = otherLessons;
		},
		setLessonFilterOnState: function(state, lessonFilter){
			state.lessonFilter = lessonFilter;	
		},
		setLessonViewsOnState: function(state, lessonViews){
			state.lessonViews = lessonViews;
		},
		setActualVideoIdOnState: function(state, actualVideoId){
			state.actualVideoId = actualVideoId;
		},
		setLessonsTitleFilterOnState: function(state, title){
			state.lessonsTitleFilter = title
		},	

		//LessonTypes
		setLessonTypesOnState: function(state, lessonTypes){
			state.lessonTypes = lessonTypes;
		},
		setActualUserOnState: function(state, actualUser){
			state.actualUser = actualUser;
		},


		//GerenciaNet
		setAuthTokenOnState: function(state, authToken){
			state.gerenciaNet.authToken = authToken;
		},
		setCobOnState: function(state, cob){
			state.gerenciaNet.cob = cob;
		},
		setQrCodeOnState: function(state, qrCode){
			state.gerenciaNet.qrCode = qrCode;
		},
		// Cache mutations
		setCacheItem: function(state, { key, data, type }) {
			// Garantir que o cache seja um Map
			if (!(state.cache[type] instanceof Map)) {
				state.cache[type] = new Map();
			}
			if (!(state.cache.lastUpdated instanceof Map)) {
				state.cache.lastUpdated = new Map();
			}
			
			state.cache[type].set(key, data);
			state.cache.lastUpdated.set(key, Date.now());
		},
		// Helper para garantir que o cache seja um Map
		ensureCacheMaps: function(state) {
			if (!(state.cache.documents instanceof Map)) {
				state.cache.documents = new Map();
			}
			if (!(state.cache.lessonTypes instanceof Map)) {
				state.cache.lessonTypes = new Map();
			}
			if (!(state.cache.users instanceof Map)) {
				state.cache.users = new Map();
			}
			if (!(state.cache.lastUpdated instanceof Map)) {
				state.cache.lastUpdated = new Map();
			}
		},
		clearCache: function(state, type) {
			if (type) {
				state.cache[type].clear();
			} else {
				Object.keys(state.cache).forEach(key => {
					if (state.cache[key].clear) {
						state.cache[key].clear();
					}
				});
			}
		},
	},
	actions: {
		//Panda-api Calls
		uploadVideoPandaAPI: async function(_, { filename, arrayBuffer }){
			const uploadPandaVideo = httpsCallable(functions, "uploadPandaVideo");

			const result = await uploadPandaVideo({ 
				filename, 
				fileBuffer: arrayBuffer 
			});

			return result;
		},

		//Loading
		changeLoadingMessage: function({commit}, message){
			commit('setLoadingMessageOnState', message);
		},
		changeLoadingState: function({commit}){
			commit('setLoadingOnState');
		},

		//Users
		getUser: async function(_, id){
			try {
				const docRef = doc(db, 'Users', id);
				const userRef = await getDoc(docRef);
				
				if (!userRef.exists()) {
					throw new Error('Usuário não encontrado');
				}
				
				return userRef.data().admin;
			} catch (error) {
				console.error('Erro ao buscar usuário:', error);
				throw error;
			}
		},
		getUserObject: async function(_, id){
			try {
				const docRef = doc(db, 'Users', id);
				const userRef = await getDoc(docRef);
				
				if (!userRef.exists()) {
					throw new Error('Usuário não encontrado');
				}
				
				return userRef.data();
			} catch (error) {
				console.error('Erro ao buscar objeto do usuário:', error);
				throw error;
			}
		},
		getUserByEmail: async function(_, email){
			try {
				// Tentar primeiro com email em lowercase (mais comum)
				const userQuery = query(
					collection(db, "Users"), 
					where("email", "==", email.toLowerCase())
				);
				const userRefs = await getDocs(userQuery);
				
				if (!userRefs.empty) {
					const userRef = userRefs.docs[0];
					return {id: userRef.id, ...userRef.data()};
				}
				
				// Fallback para email original (caso não esteja em lowercase)
				const fallbackQuery = query(
					collection(db, "Users"), 
					where("email", "==", email)
				);
				const fallbackRefs = await getDocs(fallbackQuery);
				
				if (!fallbackRefs.empty) {
					const userRef = fallbackRefs.docs[0];
					return {id: userRef.id, ...userRef.data()};
				}
				
				return null;
			} catch (error) {
				console.error('Erro ao buscar usuário por email:', error);
				throw error;
			}
		},
		
		addUser: async function(_, user){

			// functions já importado

			const checkCpf = httpsCallable(functions, 'checkCpfExists');
			
			const result = await checkCpf({ cpf: user.cpf });
			const cpfExists = result.data.exists;
			
			if(cpfExists){
				throw new Error("Já existe um usuário com este CPF.");
			}
			const auth = getAuth(app);

			user.email = user.email.toLowerCase(); 

			createUserWithEmailAndPassword(auth, user.email, user.password).then( async credential => {
				const docRef = doc(db, 'Users', credential.user.uid)
				const studentToSet = {...user};
				delete studentToSet.id;
				delete studentToSet.password;

				await setDoc(docRef, { ...studentToSet }, { merge: true })
			})
			
		},
		updateUser: async function(_, user){
			try {
				const docRef = doc(db, 'Users', user.id);
				// functions já importado
				
				const studentToSet = {...user};

				// Update user on auth firebase service
				const updateUserCF = httpsCallable(functions, 'updateUser');
				await updateUserCF({user: user});

				// Update user on database
				delete studentToSet.id;
				delete studentToSet.password;
				await setDoc(docRef, { ...studentToSet }, { merge: true });
			} catch (error) {
				console.error('Erro ao atualizar usuário:', error);
				throw error;
			}
		},
		updateUserFirestore: async function(_, user){
			try {
				const docRef = doc(db, 'Users', user.id);
				const studentToSet = {...user};
				
				delete studentToSet.id;
				delete studentToSet.password;
				await setDoc(docRef, { ...studentToSet }, { merge: true });
			} catch (error) {
				console.error('Erro ao atualizar usuário no Firestore:', error);
				throw error;
			}
		},

		//Lessons
		setLessonFilter: function({commit}, filter){
			commit('setLessonFilterOnState', filter);
		},
		cleanLessonFilter: function({commit}){
			commit('setLessonFilterOnState', {text: '', wheres: []});
		},
		getLessonById: async function({commit}, id){
			try {
				const docRef = doc(db, 'Lessons', id);
				const snapshot = await getDoc(docRef);
				
				if (!snapshot.exists()) {
					throw new Error('Aula não encontrada');
				}
				
				const lessonData = snapshot.data();
				commit('setLessonOnState', lessonData);
				return lessonData;
			} catch (error) {
				console.error('Erro ao buscar aula por ID:', error);
				throw error;
			}
		},
		addLesson: async function(_, lesson){
			try {
				// Salvar no banco
				const lessonRef = await addDoc(collection(db, 'Lessons'), lesson);
				await setDoc(lessonRef, {id: lessonRef.id}, {merge: true});
				return lessonRef.id;
			} catch (error) {
				console.error('Erro ao adicionar aula:', error);
				throw error;
			}
		},
		getFolderDetails: async function({commit}, folder){
			const docRef = doc(db, 'Lessons', folder.lessonId)
			const lessonData = (await getDoc(docRef)).data();

			const actualFolder = lessonData.folders.find(f => f.id == folder.id);
			commit('setFolderOnState', actualFolder);

		},
		addFolder: async function(_, folder){
			const docRef = doc(db, 'Lessons', folder.lessonId)
			const lessonData = (await getDoc(docRef)).data();
			if(lessonData.folders)
				lessonData.folders.push({id: folder.id, name: folder.name})
			else	
				lessonData.folders = [{id: folder.id, name: folder.name}]
				setDoc(docRef, lessonData, {merge: true})

		},
		updateFolder: async function(_, folder){
			const docRef = doc(db, 'Lessons', folder.lessonId)
			const lessonData = (await getDoc(docRef)).data();

			if(lessonData.folders.length){
				let index = lessonData.folders.findIndex(f => f.id == folder.id);
				lessonData.folders[index].name = folder.name;

				setDoc(docRef, lessonData, {merge: true})
			}

		},
		addLessonVideo: async function(_, lesson){
			const docRef = doc(db, 'Lessons', lesson.id)
			const lessonData = (await getDoc(docRef)).data();
			if(lessonData.videosIds.length)
				lessonData.videosIds.push(lesson.documentId)
			else	
			lessonData.videosIds = [lesson.documentId]
			setDoc(docRef, lessonData, {merge: true})
		},
		addLessonPdf: async function(_, lesson){
			const docRef = doc(db, 'Lessons', lesson.id)
			const lessonData = (await getDoc(docRef)).data();
			if(lessonData.pdfsIds.length)
				lessonData.pdfsIds.push(lesson.documentId)
			else	
			lessonData.pdfsIds = [lesson.documentId]
			setDoc(docRef, lessonData, {merge: true})
		},
		addFolderVideo: async function(_, folder){
			const docRef = doc(db, 'Lessons', folder.lessonId)
			const lessonData = (await getDoc(docRef)).data();
			const folderIndex = lessonData.folders.findIndex(f => f.id == folder.id)
			let folderData = lessonData.folders[folderIndex];

			if(folderData.videosIds?.length)
				folderData.videosIds.push(folder.documentId)
			else	
				folderData.videosIds = [folder.documentId]

			setDoc(docRef, lessonData, {merge: true})
		},
		addFolderPdf: async function(_, folder){
			const docRef = doc(db, 'Lessons', folder.lessonId)
			const lessonData = (await getDoc(docRef)).data();
			const folderIndex = lessonData.folders.findIndex(f => f.id == folder.id)
			let folderData = lessonData.folders[folderIndex];

			if(folderData.pdfsIds?.length)
				folderData.pdfsIds.push(folder.documentId)
			else	
				folderData.pdfsIds = [folder.documentId]
			setDoc(docRef, lessonData, {merge: true})
		},
		moveDocumentToFolder: async function(_, {documentId, folderId, lessonId, documentType}){

			const docRef = doc(db, 'Lessons', lessonId)
			const lessonData = (await getDoc(docRef)).data();
			
			if(lessonData.folders && lessonData.folders.length){

				const folderIndex = lessonData.folders.findIndex(folder => folder.id == folderId);
				let folder = lessonData.folders[folderIndex];

				if(documentType == 'video'){

					//Delete video from lesson
					const videos = lessonData.videosIds;
					const deleteVideoIndex = videos.findIndex(videoId => videoId == documentId)
					videos.splice(deleteVideoIndex, 1);
					lessonData.videosIds = videos;


					//Add video to folder
					if(folder.videosIds){
						folder.videosIds.push(documentId)
					}
					else{ 
						folder.videosIds = [documentId]
					}

				}

				if(documentType == 'pdf'){
					//Delete pdf from lesson
					const pdfs = lessonData.pdfsIds;
					const deletePdfIndex = pdfs.findIndex(pdfId => pdfId == documentId)
					pdfs.splice(deletePdfIndex, 1);
					lessonData.pdfsIds = pdfs;


					//Add pdf to folder
					if(folder.pdfsIds){
						folder.pdfsIds.push(documentId)
					}
					else{ 
						folder.pdfsIds = [documentId]
					}


				}
			}

			//Atualizar a lesson
			await setDoc(docRef, lessonData, {merge: true})
		},
		updateLesson: async function(_, lesson){
			try {
				delete lesson.videosIds;
				delete lesson.pdfsIds;

				const docRef = doc(db, 'Lessons', lesson.id);
				await setDoc(docRef, lesson, {merge: true});
			} catch (error) {
				console.error('Erro ao atualizar aula:', error);
				throw error;
			}
		},
		verifyLessonUpdates: async function({getters, dispatch}, lesson_id){
			
			//Get lesson informations
			const lesson = (await getDoc( doc(db, 'Lessons', lesson_id))).data();
			const user = await dispatch('getUserObject', getters.actualUser.uid);

			const lessonVideos = lesson.videosIds;

			if(lesson.folders){
				lesson.folders.forEach(folder => {
					if(folder.videosIds)
						lessonVideos.push(...folder.videosIds)
				})
			}


			let userLessons = user.lessonList;
			const userVideos = userLessons.find(l => l.lessonId == lesson.id).videos.map(video => video.videoId);

			const difference = lessonVideos.filter(x => !userVideos.includes(x))

			//Caso tenha algum vídeo para atualizar
			if(difference.length){
				let mappedDifference = difference.map(videoId => ({views: "0", videoId}))
				let lessonIndex = userLessons.map(l => l.lessonId).indexOf(lesson.id)
				userLessons[lessonIndex].videos.push(...mappedDifference)

				await setDoc(doc(db, 'Users', getters.actualUser.uid), {
					lessonList: userLessons
				}, {merge: true})
			}

		},
		deleteDocumentFromLesson: async function(_, {lessonId, type, documentId}){
			const docRef = doc(db, 'Lessons', lessonId)
			let lessonData = (await getDoc(docRef)).data();

			if(type === 'video'){
				const videos = lessonData.videosIds;
				const deleteVideoIndex = videos.findIndex(videoId => videoId == documentId)
				videos.splice(deleteVideoIndex, 1);
				lessonData.videosIds = videos;
			}
			if(type === 'pdf'){
				const pdfs = lessonData.pdfsIds;
				const deletePdfIndex = pdfs.findIndex(videoId => videoId == documentId)
				pdfs.splice(deletePdfIndex, 1);
				lessonData.pdfsIds = pdfs;
			}
			if(type === 'folder'){
				const folders = lessonData.folders;
				const deleteFolderIndex = folders.findIndex(folder => folder.id == documentId)
				folders.splice(deleteFolderIndex, 1);
				lessonData.folders = folders;
			}
		
			await setDoc(docRef, lessonData, {merge: true});
		},
		deleteDocumentFromFolder: async function(_, {lessonId, folderId, type, documentId}){
			const docRef = doc(db, 'Lessons', lessonId)
			let lessonData = (await getDoc(docRef)).data();
			const folderIndex = lessonData.folders.findIndex(folder => folder.id == folderId);
			let folder = lessonData.folders[folderIndex];
			

			if(type === 'video'){
				const videos = folder.videosIds;
				const deleteVideoIndex = videos.findIndex(videoId => videoId == documentId)
				videos.splice(deleteVideoIndex, 1);
				folder.videosIds = videos;
			}
			if(type === 'pdf'){
				const pdfs = folder.pdfsIds;
				const deletePdfIndex = pdfs.findIndex(videoId => videoId == documentId)
				pdfs.splice(deletePdfIndex, 1);
				folder.pdfsIds = pdfs;
			}

			await setDoc(docRef, lessonData, {merge: true});
		},
		deleteLesson: async function(_, id){
			const deletePandaVideo = httpsCallable(functions, "deletePandaVideo");
			
			try {
				let lessonRef = doc(db, 'Lessons', id)
				let lessonDoc = await getDoc(lessonRef);
				let videosIds = lessonDoc.data().videosIds;

				// Deletar vídeos da PandaAPI
				for (const videoId of videosIds) {
					let documentRef = doc(db, 'Documents', videoId)
					let documentDoc = await getDoc(documentRef);
					
					if (documentDoc.data().pandaId) {
						await deletePandaVideo({videoId: documentDoc.data().pandaId});
					}
				}

				// Deletar a lesson do Firestore
				await deleteDoc(lessonRef);
			} catch (error) {
				console.error("Erro ao deletar lesson:", error);
				throw error;
			}
		},
		getLessons: async function({commit}){
			try {
				const lessonsQuery = query(
					collection(db, "Lessons"), 
					orderBy('order')
				);
				
				const lessons = await getDocs(lessonsQuery);
				commit('setLessonsOnState', lessons);
				return lessons;
			} catch (error) {
				console.error('Erro ao buscar aulas:', error);
				throw error;
			}
		},
		getLessonsById: async function(_, {userId}){
			try {
				const userDoc = doc(db, "Users", userId);
				const user = await getDoc(userDoc);
				
				if (!user.exists()) {
					throw new Error('Usuário não encontrado');
				}
				
				return user.data().lessonList || [];
			} catch (error) {
				console.error('Erro ao buscar aulas por ID do usuário:', error);
				throw error;
			}
		},
		getOtherLessons: async function({commit, state, getters}){
			try {
				const id = getters.actualUser.uid;
				if (!id) {
					throw new Error('Usuário não autenticado');
				}

				const userDoc = doc(db, "Users", id);
				const user = await getDoc(userDoc);
				
				if (!user.exists()) {
					throw new Error('Usuário não encontrado');
				}

				const lessonsRef = collection(db, 'Lessons');
				
				// Construir query de forma mais eficiente
				let queryConstraints = [
					where("visible", "==", true),
					orderBy("id")
				];

				// Adicionar filtros existentes
				if (state.lessonFilter.wheres.length > 0) {
					// Filtrar wheres que não sejam de visibilidade para evitar duplicação
					const otherFilters = state.lessonFilter.wheres.filter(w => 
						!(w.type === '==' && w.field && w.field.path === 'visible')
					);
					queryConstraints = [...otherFilters, ...queryConstraints];
				}

				const myLessonsQuery = query(lessonsRef, ...queryConstraints);
				const snapshot = await getDocs(myLessonsQuery);
				
				// Processar documentos de forma mais eficiente
				const myLessons = snapshot.docs.map(doc => ({
					id: doc.id, 
					...doc.data()
				}));

				commit('setOtherLessonsOnState', myLessons);
				return myLessons;
			} catch (error) {
				console.error('Erro ao buscar outras aulas:', error);
				commit('setOtherLessonsOnState', []);
				throw error;
			}
		},
		getMyLessons: async function({commit, state, getters}){
			try {
				const id = getters.actualUser.uid;
				if (!id) {
					throw new Error('Usuário não autenticado');
				}

				const userDoc = doc(db, "Users", id);
				const user = await getDoc(userDoc);
				
				if (!user.exists()) {
					throw new Error('Usuário não encontrado');
				}

				const lessonList = user.data().lessonList || [];
				const lessonsIds = [...new Set(lessonList.map(l => l.lessonId))];
				
				if (lessonsIds.length === 0) {
					commit('setMyLessonsOnState', []);
					return [];
				}

				const lessonsRef = collection(db, 'Lessons');
				const myLessons = [];
				const batchSize = 10;

				// Processar em lotes de forma mais eficiente
				for (let i = 0; i < lessonsIds.length; i += batchSize) {
					const batch = lessonsIds.slice(i, i + batchSize);
					
					let queryConstraints = [where("id", "in", batch)];
					
					// Adicionar filtros se existirem
					if (state.lessonFilter.wheres.length > 0) {
						// Remover filtros de ID anteriores para evitar conflito
						const otherFilters = state.lessonFilter.wheres.filter(w => 
							w.type !== 'in' || !w.field || w.field.path !== 'id'
						);
						queryConstraints = [...queryConstraints, ...otherFilters];
					}

					const myLessonsQuery = query(lessonsRef, ...queryConstraints);
					
					myLessons.push(
						getDocs(myLessonsQuery).then(snapshot => 
							snapshot.docs.map(lesson => ({
								id: lesson.id, 
								...lesson.data()
							}))
						)
					);
				}

				const allLessons = await Promise.all(myLessons);
				const flattenedLessons = allLessons.flat();
				
				commit('setMyLessonsOnState', flattenedLessons);
				return flattenedLessons;
			} catch (error) {
				console.error('Erro ao buscar minhas aulas:', error);
				commit('setMyLessonsOnState', []);
				throw error;
			}
		},
		getUserLessons: async function(_, data){
			try {
				const userDoc = doc(db, "Users", data.userId); 
				const user = await getDoc(userDoc);
				
				if (!user.exists()) {
					throw new Error('Usuário não encontrado');
				}

				const oldLessons = user.data().lessonList || [];
				const oldLessonsById = oldLessons.reduce((obj, item) => {
					obj[item.lessonId] = item;
					return obj;
				}, {});
				
				// Separar aulas existentes e novas
				const existingLessons = [];
				const newLessonIds = [];
				
				data.lessons.forEach(lessonId => {
					if (oldLessonsById[lessonId]) {
						// Aula já existe - resetar views
						const index = oldLessons.findIndex(lesson => lesson.lessonId == lessonId);
						oldLessons[index].videos.forEach(video => video.views = 0);
						existingLessons.push(oldLessons[index]);
					} else {
						newLessonIds.push(lessonId);
					}
				});

				// Buscar novas aulas em lote (máximo 10 por vez)
				const mappedLessons = [];
				const batchSize = 10;
				
				for (let i = 0; i < newLessonIds.length; i += batchSize) {
					const batch = newLessonIds.slice(i, i + batchSize);
					
					const batchPromises = batch.map(async (lessonId) => {
						const lessonDoc = doc(db, "Lessons", lessonId);
						const lesson = await getDoc(lessonDoc);
						
						if (lesson.exists()) {
							return {
								lessonId: lessonId, 
								videos: lesson.data().videosIds.map(id => ({
									videoId: id, 
									views: 0
								}))
							};
						}
						return null;
					});
					
					const batchResults = await Promise.all(batchPromises);
					mappedLessons.push(...batchResults.filter(result => result !== null));
				}

				return [...existingLessons, ...mappedLessons];
			} catch (error) {
				console.error('Erro ao buscar aulas do usuário:', error);
				throw error;
			}
		},
		linkLessons: async function(_, data){
			try {
				const userDoc = doc(db, "Users", data.userId);
				await setDoc(userDoc, {lessonList: data.lessons}, {merge: true});
			} catch (error) {
				console.error('Erro ao vincular aulas:', error);
				throw error;
			}
		},
		setActualVideoId: function({commit}, videoId){
			commit('setActualVideoIdOnState', videoId);
		},	

		//LessonTypes
		getLessonTypes: async function({commit}){
			try {
				const typeDoc = await getDocs(collection(db, 'LessonTypes'));
				const lessonTypes = typeDoc.docs.map(doc => ({
					id: doc.id, 
					...doc.data()
				}));
				
				commit('setLessonTypesOnState', lessonTypes);
				return lessonTypes;
			} catch (error) {
				console.error('Erro ao buscar tipos de aula:', error);
				commit('setLessonTypesOnState', []);
				throw error;
			}
		},
		getLessonType: async function({state, commit}, id){
			try {
				// Garantir que o cache seja um Map
				commit('ensureCacheMaps');
				
				// Verificar cache primeiro (válido por 10 minutos)
				const cacheKey = `lessonType_${id}`;
				const cached = state.cache.lessonTypes.get(cacheKey);
				const lastUpdated = state.cache.lastUpdated.get(cacheKey);
				const cacheValid = lastUpdated && (Date.now() - lastUpdated) < 600000; // 10 minutos
				
				if (cached && cacheValid) {
					return cached;
				}

				const typeDoc = await getDoc(doc(db, "LessonTypes", id));
				
				if (!typeDoc.exists()) {
					throw new Error('Tipo de aula não encontrado');
				}
				
				const lessonTypeData = typeDoc.data();
				
				// Armazenar no cache
				commit('setCacheItem', { 
					key: cacheKey, 
					data: lessonTypeData, 
					type: 'lessonTypes' 
				});
				
				return lessonTypeData;
			} catch (error) {
				console.error('Erro ao buscar tipo de aula:', error);
				throw error;
			}
		},
		addLessonType: async function(_, lessonType){
			try {
				await addDoc(collection(db, 'LessonTypes'), lessonType);
			} catch (error) {
				console.error('Erro ao adicionar tipo de aula:', error);
				throw error;
			}
		},
		updateLessonType: async function(_, lessonType){
			try {
				const lessonTypeDoc = doc(db, "LessonTypes", lessonType.id);
				const updatedLesson = {
					type: lessonType.type,
					price: lessonType.price
				};
				await setDoc(lessonTypeDoc, updatedLesson);
			} catch (error) {
				console.error('Erro ao atualizar tipo de aula:', error);
				throw error;
			}
		},
		deleteLessonType: async function(_, id){
			try {
				const lessonTypeRef = doc(db, 'LessonTypes', id);
				await deleteDoc(lessonTypeRef);
			} catch (error) {
				console.error('Erro ao deletar tipo de aula:', error);
				throw error;
			}
		},
		updateColleges: async function(_, collegeList){
			try {
				const documents = await getDocs(collection(db, 'Colleges'));
				
				if (documents.empty) {
					throw new Error('Nenhum documento de faculdades encontrado');
				}

				const document = documents.docs[0].data();
				document.name = collegeList;

				await setDoc(doc(db, 'Colleges', documents.docs[0].id), document, {merge: false});
			} catch (error) {
				console.error('Erro ao atualizar faculdades:', error);
				throw error;
			}
		},

		//Documents
		addDocument: async function(_, file){
			try {
				// Caminho do documento no storage
				const storageRef = stRef(storage, file.path);
				await uploadBytes(storageRef, file.content);
				
				// Salvar no banco
				const docRef = await addDoc(collection(db, 'Documents'), {
					type: file.type, 
					path: file.path, 
					name: file.content.name
				});
				
				return docRef.id;
			} catch (error) {
				console.error('Erro ao adicionar documento:', error);
				throw error;
			}
		},
		addPandaVideo: async function(_, file){
			try {
				const docRef = await addDoc(collection(db, 'Documents'), {
					type: file.type, 
					pandaId: file.pandaId, 
					name: file.name
				});
				return docRef.id;
			} catch (error) {
				console.error('Erro ao adicionar vídeo Panda:', error);
				throw error;
			}
		},
		getPandaVideoById: async function(_, pandaId){
			const getPandaVideoInfo = httpsCallable(functions, "getPandaVideoInfo");
			
			try {
				const result = await getPandaVideoInfo({pandaId});
				return {data: result.data};
			} catch (error) {
				console.error("Erro ao buscar informações do vídeo:", error);
				throw error;
			}
		},
		getDocument: async function({state, commit}, id){
			try {
				// Garantir que o cache seja um Map
				commit('ensureCacheMaps');
				
				// Verificar cache primeiro (válido por 5 minutos)
				const cacheKey = `doc_${id}`;
				const cached = state.cache.documents.get(cacheKey);
				const lastUpdated = state.cache.lastUpdated.get(cacheKey);
				const cacheValid = lastUpdated && (Date.now() - lastUpdated) < 300000; // 5 minutos
				
				if (cached && cacheValid) {
					return cached;
				}

				const docRef = doc(db, 'Documents', id);
				const pdfRef = await getDoc(docRef);
				
				if (!pdfRef.exists()) {
					throw new Error('Documento não encontrado');
				}
				
				const documentData = {id: pdfRef.id, ...pdfRef.data()};
				
				// Armazenar no cache
				commit('setCacheItem', { 
					key: cacheKey, 
					data: documentData, 
					type: 'documents' 
				});
				
				return documentData;
			} catch (error) {
				console.error('Erro ao buscar documento:', error);
				throw error;
			}
		},
		getDocumentBytes: async function(_, path){
			try {
				const storageRef = stRef(storage, path);
				const snapshot = await getBytes(storageRef);
				return snapshot;
			} catch (error) {
				console.error('Erro ao buscar bytes do documento:', error);
				throw error;
			}
		},
		getDocumentUrl: async function(_, path){
			try {
				const storageRef = stRef(storage, path);
				const url = await getDownloadURL(storageRef);
				return url;
			} catch (error) {
				console.error('Erro ao buscar URL do documento:', error);
				throw error;
			}
		},
		updateDocument: async function(_, document){
			try {
				const docRef = doc(db, 'Documents', document.id);
				await setDoc(docRef, {name: document.name}, {merge: true});
			} catch (error) {
				console.error('Erro ao atualizar documento:', error);
				throw error;
			}
		},
		
		//Login
		setUser({commit}, actualUser){
			commit('setActualUserOnState', actualUser);
		},

		//Colleges
		getColleges: async function({commit}){
			let colleges = await getDocs(collection(db, 'Colleges'));
			commit('setCollegesOnState', colleges);
		},

		//GerenciaNet
		gerenciaAuth: async function({commit}){
			try {
				// functions já importado
				const gerenciaNetAuthFunc = httpsCallable(functions, 'gerenciaNetAuth');
				const token = await gerenciaNetAuthFunc();
				commit('setAuthTokenOnState', token.data);
			} catch (error) {
				console.error('Erro na autenticação GerenciaNet:', error);
				throw error;
			}
		},
		generatePandaJwt: async function({dispatch, getters}){
			try {
				const userId = getters.actualUser.uid;
				const user = await dispatch("getUserObject", userId);
				// functions já importado
				
				const jwtData = {
					name: user.name,
					cpf: user.cpf
				};
				
				const generateJwtPandaToken = httpsCallable(functions, 'jwtPanda');
				const watermarkJWT = await generateJwtPandaToken(jwtData);
				return watermarkJWT;
			} catch (error) {
				console.error('Erro ao gerar JWT Panda:', error);
				throw error;
			}
		},
		generateCob: async function({state, commit}, lesson){
			try {
				// functions já importado
				const currentUser = getAuth(app).currentUser;
				const formatedPrice = lesson.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2 }).replace(',', '.');
				const generateCobFunc = httpsCallable(functions, 'generateCob');
				
				const response = await generateCobFunc({accessToken: state.gerenciaNet.authToken, price: formatedPrice});
				const chargeRef = doc(db, "Charges", response.data.txid);
				
				commit('setCobOnState', response.data);
				await setDoc(chargeRef, { lessonId: lesson.id, userId: currentUser.uid}, {merge: true});
				
				return response.data;
			} catch (error) {
				console.error('Erro ao gerar cobrança:', error);
				throw error;
			}
		},
		getQrCode: async function({state, commit}){
			try {
				// functions já importado
				const generateQRCodeFunc = httpsCallable(functions, 'generateQRCode');
				
				const response = await generateQRCodeFunc({
					id: state.gerenciaNet.cob.loc.id, 
					accessToken: state.gerenciaNet.authToken
				});
				
				commit('setQrCodeOnState', response.data);
				return response.data;
			} catch (error) {
				console.error('Erro ao gerar QR Code:', error);
				throw error;
			}
		},

		//Video aulas
		countView: async function({state, getters}){
			try {
				const id = getters.actualUser.uid;
				if (!id) {
					throw new Error('Usuário não autenticado');
				}

				const userDoc = doc(db, "Users", id);
				const user = await getDoc(userDoc);
				
				if (!user.exists()) {
					throw new Error('Usuário não encontrado');
				}

				const lessonList = user.data().lessonList || [];
				const actualLesson = lessonList.find(l => l.lessonId == state.actualLesson.id);
				
				if (!actualLesson) {
					throw new Error('Aula não encontrada');
				}

				const actualVideo = actualLesson.videos.find(video => video.videoId == state.actualVideoId);
				if (!actualVideo) {
					throw new Error('Vídeo não encontrado');
				}

				const intViews = parseInt(actualVideo.views);
				const totalViews = intViews + 1;
				actualVideo.views = totalViews.toString();

				await setDoc(userDoc, {lessonList: lessonList}, {merge: true});
			} catch (error) {
				console.error('Erro ao contar visualização:', error);
				throw error;
			}
		},
		getViews: async function({commit, state, getters}){
			try {
				const id = getters.actualUser.uid;
				if (!id) {
					throw new Error('Usuário não autenticado');
				}

				const userDoc = doc(db, "Users", id);
				const user = await getDoc(userDoc);
				
				if (!user.exists()) {
					throw new Error('Usuário não encontrado');
				}

				const lessonList = user.data().lessonList || [];
				const actualLesson = lessonList.find(l => l.lessonId == state.actualLesson.id);
				
				if (!actualLesson) {
					throw new Error('Aula não encontrada');
				}

				const actualVideo = actualLesson.videos.find(video => video.videoId == state.actualVideoId);
				if (!actualVideo) {
					throw new Error('Vídeo não encontrado');
				}

				commit('setLessonViewsOnState', actualVideo.views);
				return actualVideo.views;
			} catch (error) {
				console.error('Erro ao buscar visualizações:', error);
				throw error;
			}
		},
		getViewsByLessonId: async function({getters}, {lessonId, videoId}){
			try {
				const id = getters.actualUser.uid;
				if (!id) {
					throw new Error('Usuário não autenticado');
				}

				const userDoc = doc(db, "Users", id);
				const user = await getDoc(userDoc);
				
				if (!user.exists()) {
					throw new Error('Usuário não encontrado');
				}

				const lessonList = user.data().lessonList || [];
				const actualLesson = lessonList.find(l => l.lessonId == lessonId);
				
				if (!actualLesson) {
					throw new Error('Aula não encontrada');
				}

				const actualVideo = actualLesson.videos.find(video => video.videoId == videoId);
				if (!actualVideo) {
					throw new Error('Vídeo não encontrado');
				}

				return actualVideo.views;
			} catch (error) {
				console.error('Erro ao buscar visualizações por ID da aula:', error);
				throw error;
			}
		}

	},
	getters: {

		//Loading
		loading: function({loading}){
			return loading;
		},
		colleges: function({colleges}){
			return colleges
		},
		periods: function({periods}){
			return periods
		},
		lessons: function({lessons}){
			return lessons
		},
		myLessons: function({myLessons}){
			return myLessons
		},
		otherLessons: function({otherLessons}){
			return otherLessons
		},
		actualLesson: function({actualLesson}){
			return actualLesson
		},
		actualFolder: function({actualFolder}){
			return actualFolder
		},
		qrCode: function({gerenciaNet}){
			return gerenciaNet.qrCode
		},
		actualUser: function({actualUser}){
			if(Object.keys(actualUser).length > 0)
				return actualUser

			let storageUser = {
				id: JSON.parse(localStorage.getItem("user")).uid,
				...JSON.parse(localStorage.getItem("user"))
			}
			return storageUser;
		},
		lessonViews: function({lessonViews}){
			return lessonViews;
		},
		lessonTypes: function({lessonTypes}){
			return lessonTypes;
		},
		lessonsTitleFilter: function({lessonsTitleFilter}){
			return lessonsTitleFilter;
		}
		
	},
	plugins: [
		createPersistedState({
			getState: (key) => {
				return Cookies.get(key) ? JSON.parse(Cookies.get(key)) : null
			} ,
			setState: (key, state) => {
				return Cookies.set(key, JSON.stringify(state), { expires: 3, secure: true })
			}
		})
	]
})
