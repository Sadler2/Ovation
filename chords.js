var chordPreviews;



window.onload = function() {

// Import GET Vars
   document.$_GET = [];
   var urlHalves = String(document.location).split('?');
   if(urlHalves[1]){
      var urlVars = urlHalves[1].split('&');
      for(var i=0; i<=(urlVars.length); i++){
         if(urlVars[i]){
            var urlVarPair = urlVars[i].split('=');
            document.$_GET[urlVarPair[0]] = urlVarPair[1];
         }
      }
   }

	var notes = document.$_GET['notes'].split(',');
	for (var i=0;i<notes.length;i++) notes[i] = parseInt(notes[i]);

	var apps = getChordApps(notes);


	var previewView = $('#printpreviews')[0];
	var previewTitle = $('#printpreviews_title')[0];

	previewTitle.innerHTML = decodeURI(document.$_GET['title']);

	chordPreviews = new Array();

	var precount = 18;

		var canvas = document.createElement('canvas');
		canvas.setAttribute('class','chordpreview');
		canvas.id = 'chordpreview'+i;
		canvas.width = 150;
		canvas.height = 190;
		canvas.data = '';
		canvas.hides = true;
		canvas.print = true;

	previewView.appendChild(canvas);

	
	for (var i=0;i<precount;i++)
	{
		if (apps[i] === undefined) canvas.data = '-1,-1,-1,-1,-1,-1';
		else canvas.data = apps[i][0].join(',');
	
		drawChord(canvas);
		var img = canvas.toDataURL("image/png");

		var elem = document.createElement("img");
		elem.setAttribute('src',img);
		previewView.appendChild(elem);
	
	}

	previewView.removeChild(canvas);

}