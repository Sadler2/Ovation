//                0   1    2   3    4   5   6    7   8    9   10   11
var notenames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var stroy = [4,9,2,7,11,4];


removeItem = function(arr,item) {
	var index = arr.indexOf(item);
	if (index != -1) arr.splice(index, 1);

	return arr;

}

noteByApp = function(app,struna) {
	return (app+stroy[struna])%notenames.length;
}


drawChord = function(canvas) {

	var notes = canvas.data.split(",");

	var minnote = 24;
	var maxnote = 0

	for (var i=0;i<notes.length;i++) {
		notes[i] = parseInt(notes[i]);
		if (notes[i]>0 && notes[i]<minnote) minnote = notes[i];

		if (notes[i]>maxnote) maxnote = notes[i];
	}


	var chord_width = maxnote-minnote;

	minnote -= 4-chord_width;

	if (minnote<1) minnote=1;

	var ctx=canvas.getContext("2d");
	var w = canvas.width;
	var h = canvas.height;

	ctx.fillStyle="#F5F5F5";
	ctx.fillRect(0,0,w,h);
	
	var wdist = w/8;
	var hdist = h/7;


	ctx.fillStyle="#000000";
	ctx.drawStyle="#000000";
	ctx.font = wdist+"pt Verdana";

	if (minnote>1) ctx.fillText(""+minnote,wdist*0.8,hdist*1.7);

	for (var i=0;i<6;i++)
	{
		ctx.lineWidth = 1;		
		if (i==0 && minnote <= 1) ctx.lineWidth = 3;

		ctx.beginPath();
		ctx.moveTo(wdist*2, hdist*(i+1));
		ctx.lineTo(wdist*7, hdist*(i+1));
		ctx.stroke();
	}

	for (var i=0;i<6;i++)
	{
		
		ctx.beginPath();
		ctx.moveTo(wdist*(i+2),hdist);
		ctx.lineTo(wdist*(i+2),hdist*6);
		ctx.stroke();

		var h_num = notes[i]-minnote+1;
		if (notes[i] <= 0) h_num = 0;

		circle_h = hdist*h_num; // преобразуем номер в координату
		circle_h += hdist/2; // центрируем по ячейке

		if (notes[i]==-1)
		{
			ctx.font = wdist*2/3+"pt Verdana";
			ctx.fillText("X",wdist*(i+1)+wdist*0.6,circle_h+hdist*0.25);			
		}
		else
		{
			ctx.beginPath();
			ctx.arc(wdist*(i+2),circle_h,wdist/3,0,Math.PI*2,true);
			ctx.closePath();
			ctx.stroke();
			if (notes[i]>0) ctx.fill();
		}
	}

	ctx.fillStyle="#000000";
	ctx.drawStyle="#000000";
	ctx.font = wdist/2+"pt Verdana";


	for (var i=0;i<6;i++)
	{
		if (notes[i]>=0) ctx.fillText(notenames[noteByApp(notes[i],i)],wdist*(i+1.7),hdist*6.6);

		ctx.beginPath();
		ctx.moveTo(wdist*2, hdist*(i+1));
		ctx.lineTo(wdist*7, hdist*(i+1));
		ctx.stroke();
	}


	
}

diffsort = function(a,b) {
	if (a[1]>b[1]) return 1;
	else
	if (a[1]==b[1]) return 0;
	else
	return -1;
}

getChordApps = function(notes) {
	var strings = new Array();

	if (notes.length>6 || notes.length == 0) return [];

	var num = 0;

	for (var struna=0;struna<6;struna++)
	{
	        var strNotes = new Array();
		strNotes.push(-1);
		
		for (var i=0;i<12;i++)
		{		
			var n = noteByApp(i,struna);
			if (notes.indexOf(n) != -1) strNotes.push(i);
		}

		strings.push(strNotes);
	}


	var chords = new Array();

	for (var s1=0;s1<strings[0].length;s1++)
	for (var s2=0;s2<strings[1].length;s2++)
	for (var s3=0;s3<strings[2].length;s3++)
	for (var s4=0;s4<strings[3].length;s4++)
	for (var s5=0;s5<strings[4].length;s5++)
	for (var s6=0;s6<strings[5].length;s6++)
	{
		var chord = new Array();
		chord.push(strings[0][s1]);
		chord.push(strings[1][s2]);
		chord.push(strings[2][s3]);
		chord.push(strings[3][s4]);
		chord.push(strings[4][s5]);
		chord.push(strings[5][s6]);

		var notes2 = notes.slice();
		var spectre = [0,0,0,0,0,0,0,0,0,0,0,0,0];

		var chmin = 6;
		var chmax = 0;

		var deads = 0;
		var alone_deads = 0;
		var bass_note = -1;
		var picks = 0;
		var barre = 0;

		var wassound = false;



		for (var i=0;i<6;i++) {
			if (chord[i]>=0) 
			{
				wassound = true;
				spectre[chord[i]]++;
				if (chmin == 6) 
				{
					chmin = i;
					bass_note = noteByApp(chord[i],i);
				}
				chmax = i;				
			}
			else
			{
				if (wassound) alone_deads++;
			}


	                if (chord[i] >= 0) notes2 = removeItem(notes2,noteByApp(chord[i],i));
			if (chord[i] == -1) deads++;
			if (chord[i] > 0) picks++;
		}

		if (bass_note != notes[0]) continue; // не берём аккорды с изменённой линией баса
		if (notes2.length>0) continue; // если аккорд неполный

		var chord_height = chmax-chmin;

		var cwmin = spectre.length;
		var cwmax = 0;

		var spnum = 0;
		for (var i=0;i<spectre.length;i++) 
		if (spectre[i]>0)
		{

			if (i>0) 
				if (spnum == 0) 
				{
					spnum++;
					barre++;
				}
				else spnum += spectre[i];

			if (i<cwmin) cwmin = i;
			else
			if (i>cwmax) cwmax = i;
		}

		var chord_width = cwmax-cwmin;

		if (spnum>4) continue; // проверяем, хватит ли у нас пальцев
		if (chord_width>4) continue;

		var difficulty = chord_width*chord_height+spnum*20+barre*10+deads*10+alone_deads*100+cwmin*3+picks*3;

		chords.push([chord,difficulty]);

		
		num++;
	}

//	alert(""+num);

	chords.sort(diffsort);

	return chords;
}


window.onload = function() {

	chordViews = document.getElementsByClassName('guitarChordView');

//	for (var i=0;i<chordViews.length;i++) drawChord(chordViews[i]);

//                  0   1    2   3    4   5   6    7   8    9   10   11
//var notenames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
	var notes = [6,10,1];
	var chords = getChordApps(notes);

	for (var i=0;i<20;i++)
	{
		var canvas = document.createElement("canvas");
		canvas.width = 150;
		canvas.height = 190;
		canvas.data = chords[i][0].join(',');
		
		document.body.appendChild(canvas);
		drawChord(canvas);

//		var div = document.createElement("div");
//		div.innerHTML = chords[i][2];
//		document.body.appendChild(div);

	}
/*	if (chords.length>0) 
	{
		chordViews[0].data = chords[0][0];
		for (var i=0;i<chordViews.length;i++) drawChord(chordViews[i]);
	}
*/



};
