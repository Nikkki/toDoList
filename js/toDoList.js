'use strict'

	var ToDo = ToDo || {};
	ToDo.tasks = [];

	var Task = function (options) {
		this.id = options.id || 0;
		this.title = options.title || 'No title';
		this.priority = options.priority || 'high';
	};

	var tdList = $('#toDoList--tasks'),
		// checkbox1 = $('.toDoList--checkbox'),
		button = $('#toDoList--add'),
		tdMask = 'tdl_';

	var valueInput = function() {
		var val = document.getElementById('toDoList--task').value;
		return val;
	}

	var priorityVal = function () {
		var val = $('.toDoList--prioritySelection--option:selected').attr('value');
		return val;
	}

	var renderTask = function(data){
		var render = _.template($('#taskListItem').html());
		clearInputText();
		var taskItem = render(data);
		$(taskItem).appendTo(tdList);
	};

	// var renderTaskEditInput = function (data) {
	// 	render = _.template($('#taskEditInput').html());
		
	// 	var inputEdit = render(data);
	// 	$(inputEdit).appendTo($('li [data-itemid = data]'));
	// }


	var addTask = function () {
		if(valueInput().length > 0){
			var val = valueInput();
			var id = identifier();					//	Id = n + 1
			ToDo.tasks.push(new Task({				//	создание объекта
				id: id,
				title: val,
				priority: priorityVal()
			}));

			var jsonstr = JSON.stringify(ToDo.tasks);
			lclStorageSet( jsonstr );			//	вносим нашу строку в storage
			
			renderTask({							//	создание html разметки
				title: val,
				id: id,
				priority: priorityVal()
			});
		}
	}

	$('#toDoList--add').on('click', function(){
		addTask();
	});

	$('#toDoList--task').on('keydown', function(e){
		if(e.keyCode != 17)
			return;
		addTask();
	});


	var clearInputText = function(){	//удаление текста из input text
			$('#toDoList--task').val('');
		};

	var clearTasks = (function(){		//снос заданий
		$('#toDoList--clear').on('click', function(){
			$('#toDoList--tasks li').remove();
			localStorage.removeItem('toDoList');
			ToDo.tasks = [];
		});
	}());	


	var lclStorageSet = function(valJsonStr){
		localStorage.setItem ('toDoList', valJsonStr);
	}

	var identifier = function(){
		var nId = 1;
		tdList.children().each(function(index, el){
			var jelId = $(el).attr('data-itemId').slice(4);
			if(jelId > nId){
				nId = jelId;
			}
			return nId++;
		});
		return tdMask + nId;
	};
	 
	var showTasks = (function(){
		var key = localStorage.key('toDoList');
		var jsonP = JSON.parse ( localStorage.getItem(key) ) ;

		if (jsonP != 0 && jsonP.length != null){   // QUESTION???
		    var	lsLength = jsonP.length;
		
			for( var i = 0; i < lsLength; i++){
				ToDo.tasks.push(new Task({	//	создание объекта
					id: jsonP[i].id,
					title: jsonP[i].title,
					priority: jsonP[i].priority
				}));	
				renderTask({		//	запись в html
					id: jsonP[i].id,
					title: jsonP[i].title,
					priority: jsonP[i].priority
				});
			}
		}
	}());


	$(document).on('click','.toDoList--checkbox', function (e) {	// checkbox
		$(e.target).closest('.toDoList--tasks--item').toggleClass('is-done');
	});


	$(document).on('click','.btnClose', function (e){
		var removeItem = $(e.target).closest('.toDoList--tasks--item');
		removeItem.hide(500);
		setTimeout(function () {  //убираеться блок из DOM 
			removeItem.remove();
		}, 500);
		//------------
		var id = removeItem.attr('data-itemId');
		var key = localStorage.key('toDoList');
		var jsonP = JSON.parse ( localStorage.getItem(key));
		if (jsonP != 0){
		    var	lsLength = jsonP.length;
		}

		for(var i = 0; i < lsLength; i++){
			if (id == jsonP[i].id){		
				delete ToDo.tasks[i];
				ToDo.tasks.splice(i,1);
			}
		lclStorageSet( JSON.stringify(ToDo.tasks) );
		}
	});


	//----------------- SORTING------------------
	var sortTasks = (function(){	// добавление сортировки
		$(document).on('click', '#toDoList--sort', function(){
			var	val = $('.toDoList--prioritySelection--option:selected').attr('value');

			tdList.children().each(function(index, el){	
				var valTask = $(el).attr('data-priority');
				$(el).removeClass('hidden').show(0);
				if (valTask != val) {
					$(el).addClass('hidden').hide(500);
				 }
				else {
					$(el).removeClass('hidden');
				}
			});
		});
	}());

		var removeSortTasks =  (function () {		//уборка сортировки
			$('#toDoList--removeSort').on('click', function(){
				tdList.children().each(function(index, el){	
					$(el).show(500).removeClass('hidden');			
				});
			});
		}());

	//--------------- END SORTING -----------------------
	//---------------------------------------------------

	// ------------TASK---EDITING------------------------
	

	$('.toDoList--btnEdit').on('click', function (e) {	
		var btnEdit = $(e.target).closest('.toDoList--btnEdit');
		var btnApply = $(e.target).siblings('.toDoList--btnEdit--apply'),
			label = $(e.target).siblings('label');
		btnEdit.hide(500);      
		btnApply.show(500).removeClass('hidden');
		label.attr('contenteditable','true');
	});

	$('.toDoList--btnEdit--apply').on('click', function (e) {	
		var btnEdit = $(e.target).siblings('.toDoList--btnEdit'),
			btnApply = $(e.target).closest('.toDoList--btnEdit--apply'),
			label = $(e.target).siblings('label'),
			li = $(e.target).closest('li'),
			val = label.text(),
			key = localStorage.key('toDoList'),
			jsonP = JSON.parse ( localStorage.getItem(key)),
			id = li.attr('data-itemid');

		btnApply.hide(500);
		btnEdit.show(500);      
		label.attr('contenteditable','false');

	//----------
		if (jsonP != 0){
		    var	lsLength = jsonP.length;
		}
		for(var i = 0; i < lsLength; i++){
			if (id == jsonP[i].id){		
				ToDo.tasks[i].title = val;
			}
		lclStorageSet( JSON.stringify(ToDo.tasks) );
		};
	});

	// $('.toDoList--btnEdit').on('click', function (e) {	
	// 	$(e.target).closest('.toDoList--btnEdit').addClass('hidden');

	// 	var label = $(e.target).siblings('label'),
	// 		li = $(e.target).closest('li'),
	// 		str = label.text();
	// 	console.log(str);
	// 	addInputText(str, li);
	// 	str = '';
	// 	label.text('');
	// });


	// var addInputText = function (val, place) {
	// 	$('<input type="text" class="toDoList--tasks--item--inputText">').val(val).appendTo(place);
	// 	$('<input type="button" value="Ok" class="toDoList--btnAddEdit">').appendTo(place);
	// }
	// addInputText();

	// $(document).on('click','.toDoList--btnAddEdit', function (e) {	
	// 	var	inputText = $(e.target).siblings('.toDoList--tasks--item--inputText'),
	// 		val = inputText.val(),
	// 		li = $(e.target).closest('li'),
	// 		label = $(e.target).siblings('label'),
	// 		editBtn = $(e.target).siblings	('.toDoList--btnEdit');
	// 	label.text(val).appendTo(li);
	// 	editBtn.removeClass('hidden');
	// 	$('.toDoList--tasks--item--inputText').remove();
	// 	$('.toDoList--btnAddEdit').remove();
		
	// 	var key = localStorage.key('toDoList');
	// 	var jsonP = JSON.parse ( localStorage.getItem(key));
	// 	var id = li.attr('data-itemid');
	// 	console.log('id = ' + id);
	// 	if (jsonP != 0){
	// 	    var	lsLength = jsonP.length;
	// 	}

	// 	for(var i = 0; i < lsLength; i++){
	// 		if (id == jsonP[i].id){		
	// 			ToDo.tasks[i].title = val;
	// 		}
	// 	lclStorageSet( JSON.stringify(ToDo.tasks) );
	// 	};

	// });

	// -----------END EDITING TASK-----------------------

