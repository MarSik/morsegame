function MorseGame() {
	this.paused = true;
	this.letter_timeout;
	this.streak = 0;
	this.letters = [ // {{{
	/// LCWO KOCH order K M U R E S N A P T L W I . J Z = F O Y , V G 5 / Q 9 2 H 3 8 B ? 4 7 C 1 D 6 0 X
		{letter: 'K', score: 100, streak: 0, active: false},
		{letter: 'M', score: 100, streak: 0, active: false},
		{letter: 'U', score: 100, streak: 0, active: false},
		{letter: 'R', score: 100, streak: 0, active: false},
		{letter: 'E', score: 100, streak: 0, active: false},
		{letter: 'S', score: 100, streak: 0, active: false},
		{letter: 'N', score: 100, streak: 0, active: false},
		{letter: 'A', score: 100, streak: 0, active: false},
		{letter: 'P', score: 100, streak: 0, active: false},
		{letter: 'T', score: 100, streak: 0, active: false},
		{letter: 'L', score: 100, streak: 0, active: false},
		{letter: 'W', score: 100, streak: 0, active: false},
		{letter: 'I', score: 100, streak: 0, active: false},
		{letter: '.', score: 100, streak: 0, active: false},
		{letter: 'J', score: 100, streak: 0, active: false},
		{letter: 'Z', score: 100, streak: 0, active: false},
		{letter: '=', score: 100, streak: 0, active: false},
		{letter: 'F', score: 100, streak: 0, active: false},
		{letter: 'O', score: 100, streak: 0, active: false},
		{letter: 'Y', score: 100, streak: 0, active: false},
		{letter: ',', score: 100, streak: 0, active: false},
		{letter: 'V', score: 100, streak: 0, active: false},
		{letter: 'G', score: 100, streak: 0, active: false},
		{letter: '5', score: 100, streak: 0, active: false},
		{letter: '/', score: 100, streak: 0, active: false},
		{letter: 'Q', score: 100, streak: 0, active: false},
		{letter: '9', score: 100, streak: 0, active: false},
		{letter: '2', score: 100, streak: 0, active: false},
		{letter: 'H', score: 100, streak: 0, active: false},
		{letter: '3', score: 100, streak: 0, active: false},
		{letter: '8', score: 100, streak: 0, active: false},
		{letter: 'B', score: 100, streak: 0, active: false},
		{letter: '?', score: 100, streak: 0, active: false},
		{letter: '4', score: 100, streak: 0, active: false},
		{letter: '7', score: 100, streak: 0, active: false},
		{letter: 'C', score: 100, streak: 0, active: false},
		{letter: '1', score: 100, streak: 0, active: false},
		{letter: 'D', score: 100, streak: 0, active: false},
		{letter: '6', score: 100, streak: 0, active: false},
		{letter: '0', score: 100, streak: 0, active: false},
		{letter: 'X', score: 100, streak: 0, active: false}
	]; //}}}

	this.ac = new (window.AudioContext || window.webkitAudioContext)();
	this.wpm = 15;
	this.guessLimit = 2;
	this.pitch = 700;
	this.morse = new MorseNode(this.ac, this.wpm, this.pitch);
	this.morse.connect(this.ac.destination);

	this.activateLetter();
	this.activateLetter();

	this.next_letter = $(".letter.active").first().data("letter");

	key("space", this.togglePause.bind(this));
}

MorseGame.prototype.unlockAudio = function() {
    // based on https://paulbakaus.com/tutorials/html5/web-audio-on-ios/#Example_2_Unlocking_Web_Audio_the_smart_way
    // create empty buffer
    var buffer = this.ac.createBuffer(1, 1, 22050);
    var source = this.ac.createBufferSource();
    source.buffer = buffer;

    // connect to output (your speakers)
    source.connect(this.ac.destination);

    // play the file
    source.start(0);
    console.log("Audio unlocked.");
}

MorseGame.prototype.getLetterIndex = function(letter) {
	for (i = 0; i < this.letters.length; i++) {
		if (this.letters[i].letter == letter) {
			return i;
		}
	}
	return -1;
}

MorseGame.prototype.getActiveLetters = function() {
	var active = [];
	for (i = 0; i < this.letters.length; i++) {
		if (this.letters[i].active) {
			active.push(this.letters[i]);
		}
	}
	return active;
}

MorseGame.prototype.togglePause = function(event) {
	console.log("togglePause");
	this.paused = !this.paused;

	if (event)
		event.preventDefault();
	if (!this.paused) {
		this.doLetter();
	} else {
		clearTimeout(this.letter_timeout);
		$("#symbol").html("&nbsp;");
	}
	$("#begin-modal").modal("hide");
	$("#options-modal").modal(this.paused?"show":"hide");

	active = game.getActiveLetters().map(x => x.letter);
	$("#active-symbols").text(active.join(", "));
	return false;
}

MorseGame.prototype.doNextLetter = function() {
	// Sets next_letter to be a random active letter, and calls doLetter()
	var active = this.getActiveLetters();
	if (active.length < 2) {
		this.activateLetter();
		active = this.getActiveLetters();
	}
	var next_index = Math.floor(Math.random() * active.length);
	this.next_letter = active[next_index].letter;
	this.doLetter();
}

MorseGame.prototype.doLetter = function() {
	// Play the letter, and set a timeout
	if (this.next_letter == null) {
		this.doNextLetter();
		return;
	}

	$("#symbol").text(this.next_letter);

	this.morse.playString(this.ac.currentTime, this.next_letter);
	this.letter_timeout = setTimeout(this.doNextLetter.bind(this), this.guessLimit * 1000);
}

MorseGame.prototype.activateLetter = function(letter) {
	if (letter === undefined) {
		for (i = 0; i < this.letters.length; i++) {
			if (!this.letters[i].active && this.letters[i].score == 100) {
				letter = this.letters[i].letter;
				break;
			}
		}
	}
	if (letter === undefined) {
		// No more letters to activate
		return false;
	}

	var letter_index = this.getLetterIndex(letter);
	this.next_letter = letter;
	this.letters[letter_index].active = true;
	this.letters[letter_index].score = 100;
	console.log(this.letters[letter_index]);
}

MorseGame.prototype.deactivateLetter = function(letter) {
	if (letter === undefined) {
		for (i = 0; i < this.letters.length; i++) {
			if (this.letters[i].active) {
				letter = this.letters[i].letter;
			}
		}
	}
	if (letter === undefined) {
		// No more letters to deactivate
		return false;
	}

	var letter_index = this.getLetterIndex(letter);
	//this.next_letter = letter;
	this.letters[letter_index].active = false;
	console.log(this.letters[letter_index]);
}

MorseGame.prototype.setWPM = function(wpm) {
	this.wpm = wpm;
	this.morse.setRate(this.wpm);
}

MorseGame.prototype.setPitch = function(pitch) {
	this.pitch = pitch;
	this.morse.setPitch(this.pitch);
}

$(function() {
	game = new MorseGame();

	$("#begin-modal").modal({keyboard: false,backdrop:"static"}).modal("show");
	$("#begin-modal").on("hidden.bs.modal", function() {
		console.log("closing modal");
		if (game.paused) {
			game.togglePause();
		}
	});

    $("#go-button").on("click", function(event) {
        // Unlock iOS and Android audio
        game.unlockAudio();
    })

	$("#options-modal").on("shown.bs.modal", function() {
		console.log("opening modal");
		if (!game.paused) {
			game.togglePause();
		}
		$("input[name=input-wpm]").parent("label").removeClass("active");
		$("input[name=input-wpm][value="+game.wpm+"]").prop("checked", true).parent("label").addClass("active");
		$("input[name=input-wait]").parent("label").removeClass("active");
		$("input[name=input-wait][value="+game.guessLimit+"]").prop("checked", true).parent("label").addClass("active");
		$("input[name=input-pitch]").parent("label").removeClass("active");
        $("input[name=input-pitch][value="+game.pitch+"]").prop("checked", true).parent("label").addClass("active");
	});
	$("#options-modal").on("hide.bs.modal", function() {
		if (game.paused) {
			game.togglePause();
		}
	});
	$("#save-options-button").on("click", function(event) {
		game.setWPM($("input[name=input-wpm]:checked").val());
		game.guessLimit = $("input[name=input-wait]:checked").val();
		game.setPitch($("input[name=input-pitch]:checked").val());
	});
	$("#add-symbol-button").on("click", function(event) {
	    game.activateLetter();
	    active = game.getActiveLetters().map(x => x.letter);
	    $("#active-symbols").text(active.join(", "));
	    return false;
	});
	$("#remove-symbol-button").on("click", function(event) {
        game.deactivateLetter();
	    active = game.getActiveLetters().map(x => x.letter);
	    $("#active-symbols").text(active.join(", "));
	    return false;
    });
});
