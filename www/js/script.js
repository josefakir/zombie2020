var URL_WS = "https://graphicsandcode.com/proyectos/zombieapi/";

localStorage.setItem('zoom',1);

const formatter = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	minimumFractionDigits: 2
})

function traducirTipoGasto(tipogasto){
	switch(tipogasto){
		case '1':
		return 'GF';
		break;
		case '2':
		return 'GV';
		break;
		case '3':
		return 'IF';
		break;
		case '4':
		return 'IV';
		break;
	}
}
function percentageToDegrees(percentage) {
	return percentage / 100 * 360
}
function refreshSaludFinanciera(user_id,mes,anio){
	$.ajax({
		headers: {
			'apikey': localStorage.getItem('apikey')
		},
		url : URL_WS+'movimientos/'+user_id+'/'+mes+'/'+anio,
		beforeSend : function(){
			$('#loading').show();
		},complete : function(){
			$('#loading').hide();
		},success : function(data){
			var output = '';
			var markup = 0;
			$.each( data, function( key, value ) {
				output +='<tr>';
				output +='<td>'+value.etiqueta+'</td>';
				output +='<td>'+traducirTipoGasto(value.tipo)+'</td>';
				output +='<td>'+formatter.format(value.cantidad)+'</td>';
				output +='</tr>';

				if(value.tipo==='1' || value.tipo==='2'){
					markup -= parseFloat(value.cantidad);
				}
				if(value.tipo==='3' || value.tipo==='4'){
					markup += parseFloat(value.cantidad);
				}
			});
			$('#tabla_salud_financiera tbody').html(output);
			markup = formatter.format(markup);
			$('#markup h1').html(markup);
		}
	})
}

function refreshMetas(){
	$.ajax({
		url : URL_WS+'metas/'+$('#input_categoria').val()+'/'+localStorage.getItem('user_id'),
		headers: {
			'apikey': localStorage.getItem('apikey')
		},
		beforeSend : function(){
			$('#loading').show();
		},
		complete : function(){
			$('#loading').hide();
		},
		success : function(data){
			console.log(data);
			var output = '';
			if(data.length>0){
				$.each( data, function( key, value ) {
					output+='<div class="meta">';
					output+='<div class="clear"></div>';
						output+='<div class="c100 p'+parseFloat(value.porcentaje).toFixed(2)+' ">';
	                    	output+='<span>'+parseFloat(value.porcentaje).toFixed(2)+'%</span>';
	                    	output+='<div class="slice">';
	                        	output+='<div class="bar"></div>';
	                        	output+='<div class="fill"></div>';
	                    	output+='</div>';
	                	output+='</div>';
						output+='<div class="clear"></div><br>';
						output+='<div class="titulo_meta">';
						output+='<div class="etiqueta_ver_meta">'+value.etiqueta+'<a href="'+value.id+'" class="btn_completar_meta"><i class="fas fa-check"></i></a> <a data-id_meta="'+value.id+'" href="views/editar-meta.html" class="btn_editar_meta loadview"><i class="fas fa-pencil-alt"></i></a></div>';
						output+='</div>';
						output+='<ul class="lista_ver_metas">';
						tareas = unserialize(value.tareas);
						$.each( tareas, function( key, value ) {
							output+='<li>'+value+'</li>';
						});
						output+='</ul>';
					output+='</div>';
				});
				$('#container_ver_metas').html(output);
			}else{
				$('#container_ver_metas').html('<p class="tac">Aún no tienes metas</p>');
			}
		}
	})
}


function unserialize(data){  
	var error = function (type, msg, filename, line){
		//throw new window[type](msg, filename, line);
	};  
	var read_until = function (data, offset, stopchr){  
		var buf = [];  
		var chr = data.slice(offset, offset + 1);  
		var i = 2;  
		while(chr != stopchr){  
			if((i+offset) > data.length){  
				error('Error', 'Invalid');  
			}  
			buf.push(chr);  
			chr = data.slice(offset + (i - 1),offset + i);  
			i += 1;  
		}  
		return [buf.length, buf.join('')];  
	};  
	var read_chrs = function (data, offset, length){  
		buf = [];  
		for(var i = 0;i < length;i++){  
			var chr = data.slice(offset + (i - 1),offset + i);  
			buf.push(chr);  
		}  
		return [buf.length, buf.join('')];  
	};  
	var _unserialize = function (data, offset){  
		if(!offset) offset = 0;  
		var buf = [];  
		var dtype = (data.slice(offset, offset + 1)).toLowerCase();  

		var dataoffset = offset + 2;  
		var typeconvert = new Function('x', 'return x');  
		var chrs = 0;  
		var datalength = 0;  

		switch(dtype){  
			case "i":  
			typeconvert = new Function('x', 'return parseInt(x)');  
			var readData = read_until(data, dataoffset, ';');  
			var chrs = readData[0];  
			var readdata = readData[1];  
			dataoffset += chrs + 1;  
			break;  
			case "b":  
			typeconvert = new Function('x', 'return (parseInt(x) == 1)');  
			var readData = read_until(data, dataoffset, ';');  
			var chrs = readData[0];  
			var readdata = readData[1];  
			dataoffset += chrs + 1;  
			break;  
			case "d":  
			typeconvert = new Function('x', 'return parseFloat(x)');  
			var readData = read_until(data, dataoffset, ';');  
			var chrs = readData[0];  
			var readdata = readData[1];  
			dataoffset += chrs + 1;  
			break;  
			case "n":  
			readdata = null;  
			break;  
			case "s":  
			var ccount = read_until(data, dataoffset, ':');  
			var chrs = ccount[0];  
			var stringlength = ccount[1];  
			dataoffset += chrs + 2;  

			var readData = read_chrs(data, dataoffset+1, parseInt(stringlength));  
			var chrs = readData[0];  
			var readdata = readData[1];  
			dataoffset += chrs + 2;  
			if(chrs != parseInt(stringlength) && chrs != readdata.length){  
				error('SyntaxError', 'String length mismatch');  
			}  
			break;  
			case "a":  
			var readdata = {};  

			var keyandchrs = read_until(data, dataoffset, ':');  
			var chrs = keyandchrs[0];  
			var keys = keyandchrs[1];  
			dataoffset += chrs + 2;  

			for(var i = 0;i < parseInt(keys);i++){  
				var kprops = _unserialize(data, dataoffset);  
				var kchrs = kprops[1];  
				var key = kprops[2];  
				dataoffset += kchrs;  

				var vprops = _unserialize(data, dataoffset);  
				var vchrs = vprops[1];  
				var value = vprops[2];  
				dataoffset += vchrs;  

				readdata[key] = value;  
			}  

			dataoffset += 1;  
			break;  
			default:  
			error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);  
			break;  
		}  
		return [dtype, dataoffset - offset, typeconvert(readdata)];  
	};  
	return _unserialize(data, 0)[2];  
}  
function loadView(path,callback){
	$.ajax({
		url : path,
		complete : function(){
			$('#loading').hide();
		},
		success : function(data){
			$('#appContent').html(data);
			switch(path){
				case 'views/salud-financiera.html':
					// INIT SALUD FINANCIERA
					var today = new Date();
					var anio = today.getFullYear();
					var mes = today.getMonth()+1;
					$("#input_anio_salud_financiera").val(anio);
					$("#input_mes_salud_financiera").val(mes);
					refreshSaludFinanciera( localStorage.getItem('user_id'),$("#input_mes_salud_financiera").val(),$("#input_anio_salud_financiera").val());
					break;
					case 'views/home.html':
						
						$.ajax({
							url : URL_WS+'avance_usuario/'+localStorage.getItem('user_id'),
							headers: {
								'apikey': localStorage.getItem('apikey')
							},
							beforeSend : function(){
								$('#loading').show();
							},
							complete : function(){
								$('#loading').hide();
							},
							success : function(data){
								var sexo = data.sexo;
								if(sexo==null){
									sexo = 'h';
								}
								if(data.nivel_zombie==1){
									$('#espacio_zombie').html(
										'<h1 class="tac">MUERTO VIVIENTE</h1>'+
										'<p class="tac">Muerto estás, comienza a establecer metas y dar pasos de nuevo hacia la vida. </p>'+
										'<img class="zombie" src="img/'+sexo+'/'+data.nivel_zombie+'.png" alt="Zombie">'
									);
								}
								if(data.nivel_zombie==2){
									$('#espacio_zombie').html(
										'<h1 class="tac">INFECCIÓN AVANZADA</h1>'+
										'<p class="tac">El virus aún se encuentra en tu cuerpo, tú puedes deshacerte de él, ¡ánimo!</p>'+
										'<img class="zombie" src="img/'+sexo+'/'+data.nivel_zombie+'.png" alt="Zombie">'
									);
								}
								if(data.nivel_zombie==3){
									$('#espacio_zombie').html(
										'<h1 class="tac">RECIENTEMENTE INFECTADO</h1>'+
										'<p class="tac">El virus en ti apenas es una pequeña gripa, ¡continua y logra todas tus metas!</p>'+
										'<img class="zombie" src="img/'+sexo+'/'+data.nivel_zombie+'.png" alt="Zombie">'
									);
								}
								if(data.nivel_zombie==4){
									$('#espacio_zombie').html(
										'<h1 class="tac">ESTÁS VIVO</h1>'+
										'<p class="tac">¡Felicidades! Poco a poco vas cumpliendo con tus metas, establece nuevas y mantente vivo. </p>'+
										'<img class="zombie" src="img/'+sexo+'/'+data.nivel_zombie+'.png" alt="Zombie">'
									);
								}
							}
						})


					break;
					case 'views/metas.html':
					$(".owl-carousel").owlCarousel({
						items : 1
					});
					break;
					case 'views/ver-metas.html':

					if($('#input_categoria').val()==1){
						$('#icono_ver_metas').attr('src','img/iconos/ico_espiritual_purple.png');
						$('#titulo_ver_metas').html('ESPIRITUAL');
					}
					if($('#input_categoria').val()==2){
						$('#icono_ver_metas').attr('src','img/iconos/ico_circulo_purple.png');
						$('#titulo_ver_metas').html('CÍRCULO CERCANO');
					}
					if($('#input_categoria').val()==3){
						$('#icono_ver_metas').attr('src','img/iconos/ico_fisico_purple.png');
						$('#titulo_ver_metas').html('FÍSICO');
					}
					if($('#input_categoria').val()==4){
						$('#icono_ver_metas').attr('src','img/iconos/ico_laboral_purple.png');
						$('#titulo_ver_metas').html('LABORAL');
					}
					if($('#input_categoria').val()==5){
						$('#icono_ver_metas').attr('src','img/iconos/ico_responsabilidad_purple.png');
						$('#titulo_ver_metas').html('RESPONSABILIDAD SOCIAL');
					}
					refreshMetas();
					break;
					case 'views/editar-meta.html':
					$.ajax({
						url : URL_WS+'infometa/'+$('#id_meta_editar').val(),
						headers: {
							'apikey': localStorage.getItem('apikey')
						},
						beforeSend : function(){
							$('#loading').show();
						},
						complete : function(){
							$('#loading').hide();
						},
						success : function(data){
							$('#input_nombre_meta').val(data.etiqueta);
							var tareas = unserialize(data.tareas);
							$.each( tareas, function( key, value ) {
								$('#lista_tareas').append('<li><span  class="etiqueta_tarea">'+value+'</span> <a href="#" class="btn_quitar_tarea"><i class="fas fa-times"></i></a></li>');
							});
						}
					})
					break;
					case 'views/recordatorios.html':
					$('.datepicker').datepicker({
						autoclose : true
					});
					$('.datepicker').on('focus',function(){
					$(this).trigger('blur');
					});
					break;
					case 'views/configuracion.html':


						var recordatoriomanana = localStorage.getItem('recordatoriomanana');
						var hora_manana = localStorage.getItem('hora_manana');
						var minuto_manana = localStorage.getItem('minuto_manana');
						if(recordatoriomanana===null){
							$('#hora_recordatorio_manana').hide('fast');
							$('#toggle_manana').prop('checked', false);
						}else{
							$('#hora_recordatorio_manana').show('fast');
							$('#toggle_manana').prop('checked', true);
						}

						if(hora_manana===null){
							$('#hora_manana').val('');
						}else{
							$('#hora_manana').val(hora_manana);
						}

						if(minuto_manana===null){
							$('#minuto_manana').val('');
						}else{
							$('#minuto_manana').val(minuto_manana);
						}



						var recordatoriotarde = localStorage.getItem('recordatoriotarde');
						var hora_tarde = localStorage.getItem('hora_tarde');
						var minuto_tarde = localStorage.getItem('minuto_tarde');
						if(recordatoriotarde===null){
							$('#hora_recordatorio_tarde').hide('fast');
							$('#toggle_tarde').prop('checked', false);
						}else{
							$('#hora_recordatorio_tarde').show('fast');
							$('#toggle_tarde').prop('checked', true);
						}

						if(hora_tarde===null){
							$('#hora_tarde').val('');
						}else{
							$('#hora_tarde').val(hora_tarde);
						}

						if(minuto_tarde===null){
							$('#minuto_tarde').val('');
						}else{
							$('#minuto_tarde').val(minuto_tarde);
						}

						$('.toggle').bootstrapToggle({
							on: 'Activado',
							off: 'Desactivado'
						});
						$('#avatar').attr('src',localStorage.getItem('avatar')+"?ts="+Math.floor(Math.random() * 100));
						$("#inp").change(function () {
							$('.crop').show();
							$('#rotatebuttons').css('display','block');
							if (this.files && this.files[0]) {
								var reader = new FileReader();
								reader.onload = function (e) {
									$('#image').attr('src', e.target.result);
									$('#btn_guardar_avatar').css('display','block');
									var croppie = $('#image').croppie({
										enableOrientation: true
									});
									$(document).on("click", ".rotateleft", function(e) { 
										e.preventDefault();
										croppie.croppie('rotate', parseInt(90));
									});
									$(document).on("click", ".rotateright", function(e) { 
										e.preventDefault();
										croppie.croppie('rotate', parseInt(-90));
									});


									$(document).on("click", "#btn_guardar_avatar", function(e) { 
										e.preventDefault();
										croppie.croppie('result',{type:'base64',size:{width:300,height:300},format:'png'}).then(function(r) {
											var data = 'id_usuario='+localStorage.getItem('user_id')+'&avatar='+r;
											$.ajax({
												headers: {
													'apikey': localStorage.getItem('apikey')
												},
												type : 'POST',
												data : data,
												url : URL_WS+'cambiaravatar',
												beforeSend : function(){
													$('#loading').show();
												},complete : function(){
													$('#loading').hide();
												},error : function(error){
													alert('error' + error);
												},success : function(data){
													localStorage.setItem('avatar',data.url);
													$('#avatar').attr('src',localStorage.getItem('avatar')+"?ts="+Math.floor(Math.random() * 100));
													croppie.croppie('destroy');
													$('.crop').hide();
													$('#btn_guardar_avatar').hide();
													$('#rotatebuttons').hide();
													successAlert('Éxito', 'Avatar actualizado correctamente');
													setTimeout(function(){ window.location.reload();}, 3000);
													
												}
											});
										});
									});
								}
								reader.readAsDataURL(this.files[0]);
							}


						});
					break;
					case 'views/completar-tareas.html':
					
					$.ajax({
						url : URL_WS+'avance_usuario/'+localStorage.getItem('user_id'),
						headers: {
							'apikey': localStorage.getItem('apikey')
						},
						beforeSend : function(){
							$('#loading').show();
						},
						complete : function(){
							$('#loading').hide();
						},
						success : function(data){
							var metas = data.array_no_revisadas;
							if(metas.length>0){
								var output = '';
								$.each( metas, function( key, value ) {

									output+='<li class="pane1" data-info="'+value.tarea+'|'+localStorage.getItem('user_id')+'">';
									output+='<div class="img"></div>';
									output+='<div><span class="nombre_tarea_tinder">'+value.tarea+'</span><br><span class="nombre_meta_tinder">'+value.meta+'</span><br><span class="nombre_ambito_tinder">'+value.ambito+'</span></div>';
									output+='<div class="like"></div>';
									output+='<div class="dislike"></div>';
									output+='</li>';
								})	
								$('#tinderslide ul').html(output);
								$("#tinderslide").jTinder({
									onDislike: function (item) {
										var jsonData = '{"info":"'+item.attr('data-info')+'"}';
										data = JSON.parse(jsonData);

										$.ajax({
											url : URL_WS+'nolograrmeta',
											type : 'POST',
											data : data,
											headers: {
												'apikey': localStorage.getItem('apikey')
											},
											beforeSend : function(){
												$('#loading').show();
											},
											complete : function(){
												$('#loading').hide();
											},
											success : function(data){
											}
										})
									},
									onLike: function (item) {
										var jsonData = '{"info":"'+item.attr('data-info')+'"}';
										data = JSON.parse(jsonData);

										$.ajax({
											url : URL_WS+'lograrmeta',
											type : 'POST',
											data : data,
											headers: {
												'apikey': localStorage.getItem('apikey')
											},
											beforeSend : function(){
												$('#loading').show();
											},
											complete : function(){
												$('#loading').hide();
											},
											success : function(data){
											}
										})
									}
								});
							}else{
								$('#mensaje_completar').html('Ya has revisado tus metas el día de hoy');
							}
						}
					})
					break;
				}
			}
		});
}

$(document).ready(function(){


	var auth = localStorage.getItem('auth');
	if(auth==='true'){
		loadView('views/home.html');
	}else{
		loadView('views/login.html');
		$('header').addClass('invisible');
		$('footer').addClass('invisible');
	}
})


$(document).on("click", "#btn_iniciar_sesion", function(e) { 
	e.preventDefault();
	$.ajax({
		beforeSend : function(){
			$('#loading').show();
		},
		complete : function(){
			$('#loading').hide();
		},
		headers: {
			'correo': $('#input_email').val(),
			'password': $('#input_pass').val()
		},
		type: "POST",
		url : URL_WS+"login",
		success : function(data){
			localStorage.setItem('auth',true);
			localStorage.setItem('apikey',data[0].apikey);
			localStorage.setItem('avatar',URL_WS+data[0].avatar);
			localStorage.setItem('correo',data[0].correo);
			localStorage.setItem('nombre',data[0].nombre);
			localStorage.setItem('user_id',data[0].user_id);
			$('header').removeClass('invisible');
			$('footer').removeClass('invisible');
			loadView('views/home.html');
		},
		error : function(data){
			errorAlert('Error', 'Los datos son incorrectos');
		}
	})
});


$(document).on("click", "#cerrar_menu", function(e) { 
	e.preventDefault();
	$('#menu').slideUp('fast');
});


$(document).on("click", "#trigger_menu", function(e) { 
	e.preventDefault();
	$('#menu').slideDown('fast');
});

$(document).on("click", "#btn_logout", function(e) { 
	e.preventDefault();
	$('#menu').hide();
	localStorage.clear();
	loadView('views/login.html');
	$('header').addClass('invisible');
	$('footer').addClass('invisible');
});



$(document).on("click", ".loadview", function(e) { 
	e.preventDefault();
	var path = $(this).attr('href');
	loadView(path,function(){
	});
	$('#menu').hide();
	$('#input_categoria').val($(this).attr('data-category'));

});



$(document).on("click", "#btn_agregar_ingreso", function(e) { 
	e.preventDefault();
	$('#form_salud').show('fast');
	$('#tipo_movimiento_salud').html('ingreso');
	$('#radio_fijo').val(3);
	$('#radio_variable').val(4);


});

$(document).on("click", "#btn_agregar_gasto", function(e) { 
	e.preventDefault();
	$('#form_salud').show('fast');
	$('#tipo_movimiento_salud').html('gasto');
	$('#radio_fijo').val(1);
	$('#radio_variable').val(2);
});

$(document).on("click", "#cerrar_form_salud", function(e) { 
	e.preventDefault();
	$('#form_salud').hide('fast');
});

$(document).on("click", "#guardar_gasto", function(e) { 
	e.preventDefault();

	var mes = $('#input_mes_salud_financiera').val();
	var anio = $('#input_anio_salud_financiera').val();
	var etiqueta = $('#input_etiqueta').val();
	var cantidad = $('#input_cantidad').val();
	var tipo = $('input[name=tipo_gasto]:checked').val();
	var id_usuario = localStorage.getItem('user_id');

	if(etiqueta==='' || cantidad==='' || tipo===undefined){
		alert('Todos los campos son obligatorios (concepto, tipo y cantidad)');
	}else{
		var data = 'mes='+mes+'&anio='+anio+'&etiqueta='+etiqueta+'&cantidad='+cantidad+'&tipo='+tipo+'&id_usuario='+id_usuario;
		$.ajax({
			beforeSend : function(){
				$('#loading').show();
			},
			complete : function(){
				$('#loading').hide();
			},
			headers: {
				'apikey': localStorage.getItem('apikey')
			},
			type: "POST",
			data : data,
			url : URL_WS+"movimiento",
			success : function(data){
				refreshSaludFinanciera( localStorage.getItem('user_id'),$("#input_mes_salud_financiera").val(),$("#input_anio_salud_financiera").val());
				$('#form_salud').hide('fast');
			}
		})

	}

	


});

$(document).on("change", "#input_mes_salud_financiera", function(e) {
	refreshSaludFinanciera( localStorage.getItem('user_id'),$("#input_mes_salud_financiera").val(),$("#input_anio_salud_financiera").val());
});
$(document).on("change", "#input_anio_salud_financiera", function(e) {
	refreshSaludFinanciera( localStorage.getItem('user_id'),$("#input_mes_salud_financiera").val(),$("#input_anio_salud_financiera").val());
});

$(document).on("click", "#btn_agregar_tarea", function(e) { 
	e.preventDefault();
	$('#form_tarea').show('fast');

	/*var person = prompt("Escriba el nombre de la tarea");
	if(person!=""){
		$('#lista_tareas').append('<li><span  class="etiqueta_tarea">'+person+'</span> <a href="#" class="btn_quitar_tarea"><i class="fas fa-times"></i></a></li>');
	}*/
});


$(document).on("click", "#guardar_tarea", function(e) { 
	e.preventDefault();
	var person = $('#input_tarea').val();
	if(person!="" & person !=null){
		$('#lista_tareas').append('<li><span  class="etiqueta_tarea">'+person+'</span> <a href="#" class="btn_quitar_tarea"><i class="fas fa-times"></i></a></li>');
		$('#input_tarea').val('');
		$('#form_tarea').hide('fast');
	}else{
		errorAlert('Error', 'Debe agregar el nombre de la tarea');
	}
});

$(document).on("click", "#cerrar_form_tarea", function(e) { 
	e.preventDefault();
	$('#form_tarea').hide('fast');
});



$(document).on("click", ".btn_quitar_tarea", function(e) { 
	e.preventDefault();
	$(this).parent().remove();
});

$(document).on("click", "#btn_guardar_meta", function(e) { 
	e.preventDefault();
	var counttareas = $('#lista_tareas li').length;
	var nombremeta = $('#input_nombre_meta').val();
	var tareas = '';
	if(nombremeta!='' && (counttareas >0) ){
		$("#lista_tareas li span").each(function(){
			tareas += $(this).html()+'|';
		});
		tareas = tareas.substring(0, tareas.length - 1);
		var data = 'id_usuario='+localStorage.getItem('user_id')+'&etiqueta='+nombremeta+'&tipo='+$('#input_categoria').val()+'&tareas='+tareas;
		$.ajax({
			headers: {
				'apikey': localStorage.getItem('apikey')
			},
			url : URL_WS+'meta',
			type: "POST",
			data : data,
			beforeSend : function(){
				$('#loading').show();
			},
			complete : function(){
				$('#loading').hide();
			},
			success : function(data){
				successAlert('Éxito', 'Tu meta fue guardada correctamente');
			}
		})
	}else{
		errorAlert('Error', 'Debe agregar el nombre de la meta y al menos una tarea');
	}
});


$(document).on("click", "#btn_editar_meta", function(e) { 
	e.preventDefault();
	var id_meta = $('#id_meta_editar').val();
	var counttareas = $('#lista_tareas li').length;
	var nombremeta = $('#input_nombre_meta').val();
	var tareas = '';
	if(nombremeta!='' && (counttareas >0) ){
		$("#lista_tareas li span").each(function(){
			tareas += $(this).html()+'|';
		});
		tareas = tareas.substring(0, tareas.length - 1);
		var data = 'id_meta='+id_meta+'&etiqueta='+nombremeta+'&tipo='+$('#input_categoria').val()+'&tareas='+tareas;
		$.ajax({
			headers: {
				'apikey': localStorage.getItem('apikey')
			},
			url : URL_WS+'update/meta',
			type: "POST",
			data : data,
			beforeSend : function(){
				$('#loading').show();
			},
			complete : function(){
				$('#loading').hide();
			},
			success : function(data){
				successAlert('Éxito', 'Tu meta fue actualizada correctamente');
			}
		})
	}else{
		errorAlert('Error', 'Debe agregar el nombre de la meta y al menos una tarea');
	}
});


$(document).on("click", ".btn_completar_meta", function(e) { 
	e.preventDefault();
	var id_meta = $(this).attr('href');
	confirm(function(){
		$.ajax({
			headers: {
				'apikey': localStorage.getItem('apikey')
			},
			url : URL_WS+'completar-meta/'+id_meta,
			beforeSend : function(){
				$('#loading').show();
			},
			complete : function(){
				$('#loading').hide();
			},
			success : function(data){
				successAlert('Éxito', 'Tu meta fue completada correctamente');
				refreshMetas();
			}
		})
	}, function(){
	  	//alert('no'); NADA
	  });
});
$(document).on("click", ".btn_editar_meta", function(e) { 
	e.preventDefault();
	$('#id_meta_editar').val($(this).attr('data-id_meta'));
});

$(document).on("change", "#toggle_manana", function(e) { 
	if($(this).prop('checked')==true){
		//ACTIVAR RECORDATORIO POR LAS MAÑANAS
		$('#hora_recordatorio_manana').show('fast');
		localStorage.setItem('recordatoriomanana','1');
	}else{
		//DESACTIVAR RECORDATORIO POR LAS MAÑANAS
		$('#hora_recordatorio_manana').hide('fast');
		cordova.plugins.notification.local.cancel(1, function() {
			successAlert('Éxito', 'Tu alerta fue desactivada');
		});
		localStorage.removeItem('recordatoriomanana');
		localStorage.removeItem('hora_manana');
		localStorage.removeItem('minuto_manana');
	}
});

$(document).on("change", "#hora_manana", function(e) { 
	localStorage.setItem('hora_manana',$(this).val());
	//Ejecutar recordatorio si amgos están seteados
	if(localStorage.getItem('hora_manana') != null && localStorage.getItem('minuto_manana') != null ){
		var hora = parseInt($('#hora_manana').val());
		var minuto = parseInt($('#minuto_manana').val());
		cordova.plugins.notification.local.schedule({
    		id : 1,
    		title: 'Recuerde revisar sus tareas diarias',
    		text: 'Al avanzar diariamente te acercas a tus metas',
			trigger: { every: { hour: hora, minute: minuto } },
    		foreground: true    		
		});
	}
});
$(document).on("change", "#minuto_manana", function(e) { 
	localStorage.setItem('minuto_manana',$(this).val());
	//Ejecutar recordatorio si amgos están seteados
	if(localStorage.getItem('hora_manana') != null && localStorage.getItem('minuto_manana') != null ){

		var hora = parseInt($('#hora_manana').val());
		var minuto = parseInt($('#minuto_manana').val());
		cordova.plugins.notification.local.schedule({
    		id : 1,
    		title: 'Recuerde revisar sus tareas diarias',
    		text: 'Al avanzar diariamente te acercas a tus metas',
			trigger: { every: { hour: hora, minute: minuto } },
    		foreground: true    		
		});
	}
});



$(document).on("change", "#toggle_tarde", function(e) { 
	if($(this).prop('checked')==true){
		//ACTIVAR RECORDATORIO POR LAS MAÑANAS
		$('#hora_recordatorio_tarde').show('fast');
		localStorage.setItem('recordatoriotarde','1');
	}else{
		//DESACTIVAR RECORDATORIO POR LAS MAÑANAS
		cordova.plugins.notification.local.cancel(2, function() {
			successAlert('Éxito', 'Tu alerta fue desactivada');
		});
		$('#hora_recordatorio_tarde').hide('fast');
		localStorage.removeItem('recordatoriotarde');
		localStorage.removeItem('hora_tarde');
		localStorage.removeItem('minuto_tarde');
	}
});

$(document).on("change", "#hora_tarde", function(e) { 
	localStorage.setItem('hora_tarde',$(this).val());
	//Ejecutar recordatorio si amgos están seteados
	if(localStorage.getItem('hora_tarde') != null && localStorage.getItem('minuto_tarde') != null ){
		var hora = parseInt($('#hora_tarde').val());
		var minuto = parseInt($('#minuto_tarde').val());
		cordova.plugins.notification.local.schedule({
    		id : 2,
    		title: 'Recuerde revisar sus tareas diarias',
    		text: 'Al avanzar diariamente te acercas a tus metas',
			trigger: { every: { hour: hora, minute: minuto } },
    		foreground: true    		
		});
	}
});
$(document).on("change", "#minuto_tarde", function(e) { 
	localStorage.setItem('minuto_tarde',$(this).val());
	//Ejecutar recordatorio si amgos están seteados
	if(localStorage.getItem('hora_tarde') != null && localStorage.getItem('minuto_tarde') != null ){
		var hora = parseInt($('#hora_tarde').val());
		var minuto = parseInt($('#minuto_tarde').val());
		cordova.plugins.notification.local.schedule({
    		id : 2,
    		title: 'Recuerde revisar sus tareas diarias',
    		text: 'Al avanzar diariamente te acercas a tus metas',
			trigger: { every: { hour: hora, minute: minuto } },
    		foreground: true    		
		});
	}
});


$(document).on("click", "#avatar", function(e) { 
	$('#inp').trigger('click');
});

/*
$(document).on("click", "#btn_guardar_avatar", function(e) { 
	e.preventDefault();
	var $image = $('#image');
	var cropper = $image.data('cropper');
	cropper.getCroppedCanvas().toBlob((blob) => {
		var reader = new FileReader();
		reader.readAsDataURL(blob); 
		reader.onloadend = function() {
			var base64data = reader.result;   
			var data = 'id_usuario='+localStorage.getItem('user_id')+'&avatar='+base64data;
			$.ajax({
				headers: {
					'apikey': localStorage.getItem('apikey')
				},
				type : 'POST',
				data : data,
				url : URL_WS+'cambiaravatar',
				beforeSend : function(){
					$('#loading').show();
				},complete : function(){
					$('#loading').hide();
				},success : function(data){
					localStorage.setItem('avatar',data.url);
					$('#avatar').attr('src',localStorage.getItem('avatar'));
					$('#image').hide();
				}
			});
		}
	});
});
*/
$(document).on("click", "#btn_guardar_recordatorio", function(e) { 
	e.preventDefault();
	if($('#input_fecha_recordatorio').val()=='' || $('#input_nombre_recordatorio').val()=='' || $('#input_descripcion_recordatorio').val()=='' || $('#input_hora_recordatorio').val()=='' || $('#input_minuto_recordatorio').val()==''){
		alert('Todos los campos son obligatorios');
	}else{
		var fecha = String($('#input_fecha_recordatorio').val());
		fecha = fecha.split('/');
		var anio = parseInt(fecha[2]);
		var mes = parseInt(fecha[0])-1;
		var dia = parseInt(fecha[1]);
		var hora = parseInt($('#input_hora_recordatorio').val());
		var horamasuno = hora + 1;
		var minuto = parseInt($('#input_minuto_recordatorio').val());

		var startDate = new Date(anio,mes,dia,hora,minuto,0,0,0); // beware: month 0 = january, 11 = december
  		var endDate = new Date(anio,mes,dia,horamasuno,minuto,0,0,0);
  		var title = $('#input_nombre_recordatorio').val();
  		var eventLocation = "";
  		var notes = $('#input_descripcion_recordatorio').val();
  		var success = function(message) { 
  			//alert("Success: " + JSON.stringify(message)); 
  		};
  		var error = function(message) { 
  			alert("Error: " + message); 
  		};
  		window.plugins.calendar.createEventInteractively(title,eventLocation,notes,startDate,endDate,success,error);	
	}
});
$(document).on("click", "#btn_abrir_calendario", function(e) { 
	e.preventDefault();
	window.plugins.calendar.openCalendar();
});


$(document).on("click", "#btn_iniciar_sesion_fb", function(e) { 
	e.preventDefault();
	//APP ID 116079742277976

	var fbLoginSuccess = function (userData) {
		var facebookID = userData.authResponse.userID;
		facebookConnectPlugin.api(facebookID+"/?fields=id,email,name", ["user_birthday"],
			function onSuccess (result) {
				var correo = result.email;
				var nombre = result.name;
				var id = result.id;
				if(correo!=null && nombre !=null && id !=null){
					$.ajax({
						url : URL_WS+'registrar-fb',
						type : 'POST',
						headers: {
							'nombre': nombre,
							'correo' : correo,
							'facebook_id' : id
						},
						beforeSend : function(){
							$('#loading').show();
						},
						complete : function(){
							$('#loading').hide();
						},
						success : function(data){
							localStorage.setItem('auth',true);
							localStorage.setItem('apikey',data.apikey);
							localStorage.setItem('avatar',URL_WS+data.avatar);
							localStorage.setItem('correo',data.correo);
							localStorage.setItem('nombre',data.nombre);
							localStorage.setItem('user_id',data.user_id);
							$('header').removeClass('invisible');
							$('footer').removeClass('invisible');
							loadView('views/home.html');
						}
					})
				}

			},function onError (error) {
				alert("Error: ", error);
			}
		);

	}

	facebookConnectPlugin.login(["public_profile","email"],
	    fbLoginSuccess,
	    function (error) { alert("" + error) }
	);

});


$(document).on("click", "#btn_registrarme", function(e) { 
	e.preventDefault();
	var nombre = $('#input_nombre').val();
	var correo = $('#input_email').val();
	var contrasena = $('#input_pass').val();

	if((nombre != null || nombre!='') && (correo != null || correo!='') && (contrasena !=null || contrasena!='')){
		$.ajax({
			url : URL_WS+'registrar',
			type : 'POST',
			headers: {
				'nombre': nombre,
				'correo' : correo,
				'password' : contrasena
			},
			beforeSend : function(){
				$('#loading').show();
			},
			complete : function(){
				$('#loading').hide();
			},
			success : function(data){
				if(data.status=='success'){
					successAlert('Éxito', 'Tu registro fué satisfactorio');
				}
			},
			error : function(){
				errorAlert('Error', 'Hubo un error al registrarte');
			}
		});		
	}else{
		alert('Todos los campos son obligatorios (Nombre, correo y contraseña)');
	}
});


