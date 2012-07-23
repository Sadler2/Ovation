var notenames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var stroy = [4,9,2,7,11,4];

noteByApp = function(app,struna) {
	return (app+stroy[struna])%notenames.length;
}


removeItem = function(arr,item) {
	var index = arr.indexOf(item);
	if (index != -1) arr.splice(index, 1);

	return arr;

}

diffsort = function(a,b) {
	if (a[1]>b[1]) return 1;
	else
	if (a[1]==b[1]) return 0;
	else
	return -1;
}



self.onmessage = function(event) {  
	var notes = event.data;	

	postMessage( getChordApps(notes) );
};  


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

		if (bass_note != notes[0]) continue; // Ð_Ð÷ Ð+Ð÷Ñ_Ñ'Ð_ Ð°ÐºÐºÐ_Ñ_Ð_Ñ< Ñ_ Ð¸Ð·Ð_Ð÷Ð_Ñ'Ð_Ð_Ð_Ð¹ Ð>Ð¸Ð_Ð¸Ð÷Ð¹ Ð+Ð°Ñ_Ð°
		if (notes2.length>0) continue; // Ð÷Ñ_Ð>Ð¸ Ð°ÐºÐºÐ_Ñ_Ð_ Ð_Ð÷Ð¿Ð_Ð>Ð_Ñ<Ð¹

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

		if (spnum>4) continue; // Ð¿Ñ_Ð_Ð_Ð÷Ñ_Ñ_Ð÷Ð_, Ñ:Ð_Ð°Ñ'Ð¸Ñ' Ð>Ð¸ Ñ_ Ð_Ð°Ñ_ Ð¿Ð°Ð>Ñ_Ñ+Ð÷Ð_
		if (chord_width>4) continue;

		var difficulty = chord_width*chord_height+spnum*20+barre*10+deads*10+alone_deads*100+cwmin*3+picks*3;

		if (difficulty<500) chords.push([chord,difficulty]);

		
		num++;
	}

//	alert(""+num);

	chords.sort(diffsort);

	return chords;
}



