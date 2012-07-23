function arrays_equal(a,b) { return !!a && !!b && !(a<b || b<a); }

//                0   1    2   3    4   5   6    7   8    9   10   11
var notenames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var stroy = [4,9,2,7,11,4];

var dead_chord = [-1,-1,-1,-1,-1,-1];


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

	if (arrays_equal(dead_chord,notes)) return; // dead chord
	
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



window.onload = function() {

//	chordViews = document.getElementsByClassName('guitarChordView');

//	for (var i=0;i<chordViews.length;i++) drawChord(chordViews[i]);

//                  0   1    2   3    4   5   6    7   8    9   10   11
//var notenames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
/*	var notes = [6,10,1];
	var chords = getChordApps(notes);

	for (var i=0;i<20;i++)
	{
		var canvas = document.createElement("canvas");
		canvas.width = 150;
		canvas.height = 190;
		canvas.data = chords[i][0].join(',');
		
		document.body.appendChild(canvas);
		drawChord(canvas);
*/
//		var div = document.createElement("div");
//		div.innerHTML = chords[i][2];
//		document.body.appendChild(div);

//	}
/*	if (chords.length>0) 
	{
		chordViews[0].data = chords[0][0];
		for (var i=0;i<chordViews.length;i++) drawChord(chordViews[i]);
	}
*/


};
