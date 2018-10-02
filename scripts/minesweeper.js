/* (c) 2018 Joseph Petitti | https://josephpetitti.com/license.txt */

// cell
var cell = function(n, c, f, b) {
	return {neighbors:n, clicked:c, flag:f, bomb:b};
}

// global variables
var xdim, ydim, board, canvas, ctx, squareSize, maxMines, markedMines;

$(document).ready(function() {
	$('#easy').click(function() {
		squareSize = 40;
		xdim = 10;
		ydim = 10;
		maxMines = 10;
		start();
	});

	$('#medium').click(function() {
		squareSize = 30;
		xdim = 15;
		ydim = 15;
		maxMines = 40;
		start();
	});

	$('#hard').click(function() {
		squareSize = 25;
		xdim = 30;
		ydim = 15;
		maxMines = 99;
		start();
	});

	$('#expert').click(function() {
		squareSize = 25;
		xdim = 30;
		ydim = 30;
		maxMines = 150;
		start();
	});

	$('#custom').click(function() {
		squareSize = 25;
		if ($('#input-width').val() < 1) $('#input-width').val(20);
		xdim = $('#input-width').val();
		if ($('#input-height').val() < 1) $('#input-height').val(15);
		ydim = $('#input-height').val();
		if ($('#input-mines').val() < 1) $('#input-mines').val(xdim);
		maxMines = $('#input-mines').val();
		start();
	});
});



var start = function() {
	// make canvas
	canvas = document.createElement('canvas');
	canvas.id = 'canvas';
	canvas.width = xdim * squareSize;
	canvas.height = ydim * squareSize;
	ctx = canvas.getContext('2d');
	document.getElementById('canvas-holder').appendChild(canvas);

	// create board array
	board = new Array(xdim);
	for (var i = 0; i < xdim; i++) {
		board[i] = new Array(ydim);
		for (var j = 0; j < ydim; j++) {
			board[i][j] = cell(0, 0, 0, 0);
		}
	}

	// draw grid

	initBoard();

	$('button').prop('disabled', true);
	$('input').prop('disabled', true);

	canvas.oncontextmenu = function() {return false;};

	$('canvas').mousedown(function(e) {
		var x;
		var y;
		if (e.pageX || e.pageY) {
			x = e.pageX;
			y = e.pageY;
		} else {
			 x = e.clientX + document.body.scrollLeft + 
				document.documentElement.scrollLeft; 
			y = e.clientY + document.body.scrollTop + 
				document.documentElement.scrollTop; 
		} 
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;

		x = Math.floor(x / squareSize);
		y = Math.floor(y / squareSize);

		clickCell(x, y, e.button);
	});
}

var clickCell = function(x, y, button) {
	// left click
	if (button == 0 && !board[x][y].clicked) {
		board[x][y].clicked = 1;
		if (board[x][y].bomb) {
			revealBoard();
			alert("You lose!");
			$('#canvas').off();
		} else if (board[x][y].neighbors == 0) {
			colorSquare(x, y, "#dddddd");
			
			for (var i = -1; i <= 1; i++) {
				for (var j = -1; j <= 1; j++) {
					if (x+i >= 0 && x+i < xdim
						&& y+j >= 0 && y+j < ydim) {
						clickCell(x+i, y+j, 0);
					}
				}
			}
		} else if (board[x][y].neighbors > 0) {
			colorSquare(x, y, "#dddddd");
			ctx.fillStyle = "#0000FF";
			printNum(x, y, board[x][y].neighbors);
		}
	}

	// right click
	else if (button == 2 && !board[x][y].clicked) {
		board[x][y].flag = 1;
		colorSquare(x, y, "#0000AA");
		markedMines++;
		updateScore();
		if (markedMines == maxMines && checkWin()) {
			alert("You win!");
			$('#canvas').off();
		}

	}

}

var checkWin = function() {
	var win = true;
	for (var i = 0; i < ydim; i++) {
		for (var j = 0; j < xdim; j++) {
			if (board[j][i].bomb && !board[j][i].flag) {
				win = false;
				break;
			}
		}
	}

	return win;
}


var colorSquare = function(x, y, color) {
	ctx.fillStyle = color;
	ctx.lineWidth = "2";
	ctx.strokeStyle = "#3d3d3d"
	ctx.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
	ctx.rect(x*squareSize, y*squareSize, squareSize, squareSize);
	ctx.stroke();
}

var countNeighbors = function(x, y) {
	var out = 0;
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			if (x+i >= 0 && x+i < xdim && y+j >= 0 && y+j < ydim) {
				out += board[x+i][y+j].bomb;
			}
		}
	}
	return out;
}

var initBoard = function() {
	var xoff = 0;
	var yoff = 0;

	// place mines
	var i = 0;
	while (i < maxMines) {
		var minex = Math.floor(Math.random() * xdim);
		var miney = Math.floor(Math.random() * ydim);
		if (!board[minex][miney].bomb) {
			board[minex][miney].bomb = 1;
			i++;
		}
	}
	markedMines = 0;

	// count neighbors
	for (var i = 0; i < ydim; i++) {
		for (var j = 0; j < xdim; j++) {
			if (!board[j][i].bomb)
				board[j][i].neighbors = countNeighbors(j, i);
			else
				board[j][i].neighbors = -1;
		}
	}

	// draw initial board
	ctx.lineWidth = "2";
	ctx.strokeStyle = "#3d3d3d";
	ctx.fillStyle = "#bbbbbb";
	ctx.font = squareSize + "px sans-serif";
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	for (var i = 0; i < ydim; i++) {
		for (var j = 0; j < xdim; j++) {
			ctx.fillRect(xoff, yoff, squareSize, squareSize);
			ctx.rect(xoff, yoff, squareSize, squareSize);
			ctx.stroke();

			xoff+= squareSize;
		}
		yoff+= squareSize;
		xoff = 0;
	}

	updateScore();
}

var revealBoard = function() {
	var xoff = 0;
	var yoff = 0;
	for (var i = 0; i < ydim; i++) {
		for (var j = 0; j < xdim; j++) {
			ctx.fillStyle = "#dddddd";
			if (board[j][i].bomb) {
				ctx.fillStyle = "#FF0000";
			}
			ctx.fillRect(xoff, yoff, squareSize, squareSize);
			ctx.rect(xoff, yoff, squareSize, squareSize);
			ctx.stroke();

			if (board[j][i].neighbors > 0) {
				ctx.fillStyle = "#0000FF";
				printNum(j, i, board[j][i].neighbors)
			}

			xoff+= squareSize;
		}
		yoff+= squareSize;
		xoff = 0;
	}
}

var printNum = function(x, y, num) {
	ctx.fillStyle = "#0000FF";
	ctx.fillText(num, (x + .5) * squareSize, (y + .5) * squareSize);
}

var updateScore = function() {
	$('#score').html("Mines: " + markedMines + "/" + maxMines);
}

