var keydown = [];                
var keys = [];
var audios = [];

var audio_preload;

var preload_num = 0;
var rraudio = 0;
var keychordtype = 0;

var notenames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

var chkRepeat = false;
var chkMousePlay = false;
var chkPlay = false;

var notes_octave = new Array();
var chord_name = "";

// ----------------- Элементы окна -----------------------------

var chordText;
var chordText2;
var chordText3;
var chordText4;
var btnRepeat;
var btnMousePlay;
var chordPreviews;
var guitarchord;

var keyboard;
var chordTable;
var chordtextarea;
var preload_progress;

var restrictUpdateGuitarChord;

// --------------------------------------------------------------

var chordsBase = [
['мажорное трезвучие',[4,3],''],
['минорное трезвучие',[3,4],'m'],
['увеличенное трезвучие',[4,4],'+5'],
['уменьшенное трезвучие',[3,3],'m-5'],
['большой мажорный септаккорд',[4,3,4],'maj7'],
['большой минорный септаккорд',[3,4,4],'m+7'],
['доминантсептаккорд',[	4,3,3],'7'],
['малый минорный септаккорд',[3,4,3],'m7'],
['полуувеличенный септаккорд',[4,4,3],'maj+5'],
['полууменьшенный септаккорд',[3,3,4],'m7-5'],
['уменьшенный септаккорд',[3,3,3],'dim'],
['трезвучие с задержанием (IV)',[5,2],'sus4'],
['трезвучие с задержанием (II)',[2,5],'sus2'],
['секстмажор',[4,3,2],'6'],
['секстминор',[3,4,2],'m6'],
['большой нонмажор',[4,3,3,4],'9'],
['большой нонминор',[3,4,3,4],'m9'],
['малый нонмажор',[4,3,3,3],'-9'],
['малый нонминор',[3,4,3,3],'m-9'],
['нота',[],''],
['малая секунда',[1],' - М2'],
['большая секунда',[2],' - Б2'],
['малая терция',[3],' - М3'],
['большая терция',[4],' - Б3'],
['чистая кварта',[5],' - Ч4'],
['увеличенная кварта',[6],' - УВ4'],
['чистая квинта',[7],' - Ч5'],
['малая секста',[8],' - М6'],
['большая секста',[9],' - Б6'],
['малая септима',[10],' - М7'],
['большая септима',[11],' - Б7'],
['октава',[12],' - О'],
['малая нона',[13],' - М9'],
['большая нона',[13],' - Б9']
];

var chords_worker = new Worker('guitar_chords_worker.js');

chords_worker.onmessage = function(event) {
	var apps = event.data;
		
		for (var i=0;i<chordPreviews.length;i++)
		{
			if (apps[i] === undefined) chordPreviews[i].data = '-1,-1,-1,-1,-1,-1';
			else chordPreviews[i].data = apps[i][0].join(',');
		
			drawChord(chordPreviews[i]);
		}
	
		

		var view = undefined;
		if (apps.length>0) view = apps[0][0].join(',');
		if (view === undefined) view = '-1,-1,-1,-1,-1,-1';

		drawGuitarChord(view);

}

updateChordsList = function(chord) {
	chords_worker.postMessage(chord);	
}


chkPlayClick = function() {
	chkPlay = !chkPlay;
	if (chkPlay) playTextChords();
	else stopAllNotes();

	if (chkPlay) btnPlay.setAttribute('id', 'btn_play_on');
	else btnPlay.setAttribute('id', 'btn_play_off');

}

// Repeat Checkbox OnClick
chkRepeatClick = function() {
	chkRepeat = !chkRepeat;

	if (chkRepeat) btnRepeat.setAttribute('id', 'btn_repeat_on');
	else btnRepeat.setAttribute('id', 'btn_repeat_off');
	
}

// MousePlay Checkbox OnClick
chkMousePlayClick = function() {
	chkMousePlay = !chkMousePlay;

	if (chkMousePlay) 
	{
		btnMousePlay.setAttribute('id', 'btn_mouseplay_on');
		updateChordsList(dead_chord);
	}
	else btnMousePlay.setAttribute('id', 'btn_mouseplay_off');

}

playSound = function(sound) {
	audios[rraudio].setAttribute('src', sound);
	if (audios[rraudio].play !== undefined) audios[rraudio].play();
	rraudio = (rraudio+1)%audios.length;
}

// генерировать ноты аккорда по заданным интервалам
genChord = function(intervals, note) {
	var notes = new Array();	

	notes.push(note);		

	for (var j=0;j<intervals.length;j++)
	{
		note+=intervals[j];
		notes.push(note);
	}

	return notes;

}

drawGuitarChord = function(data) {

	if (!restrictUpdateGuitarChord)
	{
		guitarchord.data = data;
		drawChord(guitarchord);
	}
}

drawGuitarChordEvent = function() {
	restrictUpdateGuitarChord = false;
	drawGuitarChord(this.data);
}

// нарисовать таблицу аккордов
genChordTable = function() {
        var str = '';
	
	str = '<table id="chordTable">';

	for (var i=0;i<chordsBase.length;i++)
	{

	if (chordsBase[i][1].length<2) continue;


	str += '<tr>';

	str += '<td class="chordtypetext" id="chordtype'+i+'">'+chordsBase[i][0]+'</td>';

	for (var n=0;n<12;n++)
	{
		str += '<td>';

		var intervals = chordsBase[i][1].slice();
		var note = n;
		var notes = genChord(intervals,note);

		str += '<a href="#" onclick="setChord(\''+notes.join()+'\')">'+keyNameById(n)+chordsBase[i][2]+'</a>';		
		str += '</td>';
	}

		str += '</tr>';

	}

	str += '</table>';
	chordTable.innerHTML = str;
}

resetChord = function(stopnotes) {
	for (var i=0;i<49;i++) keydown[i] = false;		
	if (stopnotes) stopAllNotes();

	guitarchord.data = dead_chord.join(',');
	updateChord();
}

keyMouseUp = function() {
	if (chkMousePlay) resetChord();
}

// нажать ноты, переданные в notes, сместив их на octave.
setChord = function(notes,octave, restrict) {

	if (octave === undefined) octave = 1;

	resetChord();	

	var notes2 = notes;

	if (typeof(notes)=='string') notes2 = notes2.split(",");

	for (var i=0;i<notes2.length;i++) 
	{
		var nn = parseInt(notes2[i])+12*octave;
		keydown[nn] = true;
		playNote(nn);
	}

	restrictUpdateGuitarChord = restrict;
	updateChord();
}

// клавиша белая?
isWhite = function(key) {
	var W = [true,false,true,false,true,true,false,true,false,true,false,true];
	return W[key%W.length];
}

audioPreload = function() {
	
	if (audio_preload.canPlayType ===undefined || audio_preload.canPlayType('audio/mpeg;')) {
		audio_preload.setAttribute('src', 'audio/mp3/'+preload_num+'.mp3');
	}
	else
	{
		audio_preload.setAttribute('src', 'audio/ogg/'+preload_num+'.ogg');
	}

	preload_num++;
	preload_progress.style.width = preload_num/49.0*160;
}

setVolume = function(volume) {
	for (var i=0;i<audios.length;i++)
		audios[i].volume = volume;
}

setVolumeEvent = function(event, ui) {

	var poffset = $(this).parent().offset();
	var offset = $(this).offset();	

	var vol = (offset.left-poffset.left)/80.0; //FIXME
	
	setVolume(vol);
}

openPrintPage = function() {
	window.open('chords.html?notes='+notes_octave.join(',')+'&title='+encodeURI(chord_name));
}

window.onload = function() {

	$( ".slider_box" ).draggable({ containment: "parent" });
	$( ".slider_box" ).draggable({ disabled: false });

	$( "#slider_volume" ).draggable({
	   drag: setVolumeEvent
	});


	chordText = $('.chordText')[0];//document.getElementsByClassName('chordText')[0];
	chordText2 = $('.chordText2')[0];//document.getElementsByClassName('chordText2')[0];
	chordText3 = $('.chordText3')[0];//document.getElementsByClassName('chordText3')[0];
	chordText4 = $('.chordText4')[0];//document.getElementsByClassName('chordText4')[0];
	chordTable = $('.chordTable')[0];//document.getElementsByClassName('chordTable')[0];
	btnRepeat = $('.btn_repeat')[0];//document.getElementsByClassName('btn_repeat')[0];	
	btnMousePlay = $('.btn_mouseplay')[0];//document.getElementsByClassName('btn_mouseplay')[0];	
	btnPlay = $('.btn_play')[0];//document.getElementsByClassName('btn_play')[0];	

	preload_progress = $('.preload_progress')[0]; //document.getElementsByClassName('preload_progress')[0];

	keyboard = $('.keyboard')[0]; //document.getElementsByClassName('keyboard')[0];

	chordtextarea = $('#chords_text')[0]; //document.getElementById('chords_text');

	guitarchord = $('#guitarchord')[0]; //document.getElementById('guitarchord');

	guitarchord.addEventListener('click', onGuitarChordClick, false);
	guitarchord.hides = false;
	guitarchord.print = false;


	chordtextarea.value = 'A 1,C 2,E 2\nSleep 2000\nE,G,B\nSleep 2000';


	audio_preload = document.createElement("audio");
	audio_preload.preload = 'auto';
	
	if (audio_preload.addEventListener !== undefined)
	{
		audio_preload.addEventListener("canplaythrough", function () {
		 if (preload_num<49) audioPreload(preload_num);	 
		}, false);
		audioPreload();
	}



	for (var i = 0; i < 8; i++)
	{
	    var aud = document.createElement("audio");
	    audios.push(aud);
	}

	
	setVolume(0.5);

	var wkn = 0;
	
        for(var i = 0; i < 49; i++) {

	    var div = document.createElement("div");
	    var wh = isWhite(i);


	    if (wh) div.setAttribute('class', 'key_white');
	    else div.setAttribute('class', 'key_black');

	    div.setAttribute('id', i);
	    
	    if (wh)
	    {
		    div.style.left = (110+wkn*20);
		    wkn++;
	    }
	    else
	    {
		    div.style.left = (110+wkn*20-7);
	    }

	    keyboard.appendChild(div);
	
            div.onclick = keyClick;
	    div.onmouseup = keyMouseUp;
	    keys[i] = div;
	    keydown[i] = false;
        }

	genChordTable();


	chordPreviews = new Array();

	var previewBlock = document.getElementById('guitarchords');

	var precount = screen.width*2/50;
	
	for (var i=0;i<precount;i++) {

		var canvas = document.createElement('canvas');
		canvas.setAttribute('class','chordpreview');
		canvas.id = 'chordpreview'+i;
		canvas.width = 50;
		canvas.height = 50;
		canvas.data = '';
		canvas.hides = true;
		canvas.print = false;

		canvas.onclick = drawGuitarChordEvent;		

		previewBlock.appendChild(canvas);		

		chordPreviews.push(canvas);
	}


	guitarchord.data = dead_chord.join(',');
	drawChord(guitarchord);
	
};

function arrays_equal(a,b) { return !!a && !!b && !(a<b || b<a); }




playNote = function(id) {
	if (audio_preload.canPlayType === undefined || audio_preload.canPlayType('audio/mpeg;')) {	
		playSound('audio/mp3/'+id+'.mp3');
	}
	else
	{
		playSound('audio/ogg/'+id+'.ogg');
	}
}

stopAllNotes = function() {
	for (var i=0;i<audios.length;i++) audios[i].pause();
}

// разобрать команду скрипта проигрывания
parseCmd = function(cmd) {
	var args = cmd.split(' ');

	if (args.length<1) return;
	var oct = parseInt(args[1]);
	if (args.length<2) oct = 1;

	var id = idByKeyName(args[0],oct);
	if (id>=0)
	{
		playNote(id);
		return 0;
	}
	else
	{
		if (args[0] == 'Sleep') return parseInt(args[1]);
	}
}

// разобрать строки скрипта проигрывания начиная с num
parseLines = function(lines,num)
{

	var lastline = false;

	for (var i=num;i<lines.length;i++)
	{
		var notes = lines[i].split(',');
		for (var j=0;j<notes.length;j++)
		{
			if (!chkPlay) return;
			var time = parseCmd(notes[j]);
			if (time>0) 
			{
				setTimeout(parseLines,time,lines,i+1);
				lastline = true;
			}

		}

		if (lastline) return;
	}

	if(chkRepeat) setTimeout(parseLines,0,lines,0);
	else
	if (chkPlay) chkPlayClick();

}

playTextChords = function() {
	var lines = chordtextarea.value.split(/\r\n|\r|\n/);

	parseLines(lines,0);

}

//при нажатии мыши на клавишу синтезатора
keyClick = function(event) {
	var keyId = event.target.id;
        keydown[keyId] = !keydown[keyId];

	if (keydown[keyId]) playNote(keyId);

	restrictUpdateGuitarChord = false;
	updateChord();
}

keyNameById = function(id) {
	return notenames[id%notenames.length];
}

idByKeyName = function(name, octave) {
	var ind = notenames.indexOf(name);
	if (ind<0) return -1;

	return ind+octave*12;
}

intervalNameBySize = function(size) {
	//            0   1    2    3    4    5    6     7    8    9    10   11  12   13   14
	var names = ['1','М2','Б2','М3','Б3','Ч4','УВ4','Ч5','М6','Б6','М7','Б7','О','М9','Б9'];
	return names[size%names.length];
}

chordTypeByLength = function(size) {
	var sizes = ['','нота','интервал','трезвучие','септаккорд','нонаккорд','ундецимаккорд','терцдецимаккорд'];
	if (size<sizes.length) return sizes[size];
	else return '';
}

chordDataByIntervals = function(intervals) {
	for (var i=0;i<chordsBase.length;i++)
	{
		if (arrays_equal(chordsBase[i][1],intervals)) return chordsBase[i];
	}

	return null;
}


// обновление всех данных об аккорде
updateChord = function() {
	var notes = new Array();	
	var notes_func = new Array();
	var notes_be = new Array();

	for (var i=0;i<12;i++) notes_be[i] = false;

	for (var i=0;i<49;i++)	
	{              	
		var wh = isWhite(i);
		if (keydown[i]) 
		{
			notes.push(i);

			if (!notes_be[i%12])
			{
				notes_func.push(i);
				notes_be[i%12] = true;
			}


	                if (wh)  keys[i].setAttribute("class","key_white_down");
			else
			keys[i].setAttribute("class","key_black_down");
			
		}
		else
		{
	                if (wh)  keys[i].setAttribute("class","key_white");
			else
			keys[i].setAttribute("class","key_black");
		}

	}

	notes_octave = new Array();	

	for (var i=0;i<notes.length;i++) 
	{
		var n = notes[i]%12;
		if (notes_octave.indexOf(n) == -1) notes_octave.push(n);
	}


	var intervals = new Array();
	for (var i=1;i<notes_func.length;i++) intervals.push(notes_func[i]-notes_func[i-1]);

	if (intervals.length>0) chordText.innerHTML='Формула: '+intervalNameBySize(intervals[0]);
	else chordText.innerHTML=' ';
	if (notes_func.length>0) chordText2.innerHTML=keyNameById(notes_func[0]);
	else chordText2.innerHTML=' ';

	for (var i=1;i<intervals.length;i++) chordText.innerHTML += ' + '+intervalNameBySize(intervals[i]);
	for (var i=1;i<notes_func.length;i++) chordText2.innerHTML += ' + '+keyNameById(notes_func[i]);

	var tp = chordTypeByLength(notes_func.length);
	chordText3.innerHTML = 'Звуков: '+notes_func.length;
//	if (tp.length>0) chordText3.innerHTML += ' ('+tp+')';

	var chordData = chordDataByIntervals(intervals);

	var str = '<a href="#" onClick="setChord(\''+notes.join(',')+'\',0,true)">';

	if (chordData && notes_func.length>0) 
	{
		chord_name = chordData[0] + ' ' + keyNameById(notes_func[0])+chordData[2];
		str += chord_name;
	}
	else 
	{
		str += 'неизвестный аккорд';
		chord_name = '';
	}

	str += '</a>';
	chordText4.innerHTML = str;

	if (notes_func.length==0) {
		chordText3.innerHTML = ' ';
		chordText4.innerHTML = ' ';
	}


	if (!chkMousePlay)
	{
		updateChordsList(notes_octave);
	}

}