'use strict'


// A Matrix containing cell objects
var gBoard
// This is an object by which the board size is set and how many mines to place
var gLevel = {
    SIZE: 4,
    MINES: 2
}
//This is an object in which you can keep and update the current game state
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var clicksCount


//This is called when page loads  
function onInit() {
    gGame.isOn = true
    clicksCount = 0
    gBoard = buildBoard()
    renderBoard(gBoard)


}



function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

// Randomicity for mines set
function setRandomMines(firstCLickI, firstClickJ) {

    gBoard[0][0].isMine = true
    gBoard[0][1].isMine = true
    // for (var k = 0; k < gLevel.MINES; k++) {
    //     var i = getRandomIntInclusive(0, gLevel.SIZE - 1)
    //     var j = getRandomIntInclusive(0, gLevel.SIZE - 1)
    //     if (firstCLickI === i && firstClickJ === j) {
    //         k--
    //         continue
    //     }
    //     gBoard[i][j].isMine = true
    // }

    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

//Count mines around each cell and set the cell's minesAroundCount. 
function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = countMinesNegs(i, j)
        }
    }

}

function countMinesNegs(i, j) {
    var count = 0
    var row = i - 1
    var col = j - 1

    for (var k = 0; k < 3; k++) {
        if (row + k < 0) continue
        if (row + k === gLevel.SIZE) continue
        for (var l = 0; l < 3; l++) {
            if (col + l < 0) continue
            if (col + l === gLevel.SIZE) continue
            if (gBoard[row + k][col + l].isMine === true) count++
        }
    }
    return count
}


//Render the board as a <table> to the page 
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            var cell = board[i][j]
            var cellValue = (cell.isMine) ? '<img class="mine" src="img/mine.png"></img>' : cell.minesAroundCount
            if (cellValue === 0) cellValue = ' '
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})">${cellValue}<img class="flag hide" src="img/flag.png"></img></td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML

    // Prevent the context menu to show on RightClick
    const elTable = document.querySelector('table')
    elTable.addEventListener("contextmenu", (e) => { e.preventDefault() });
}

//Called when a cell is clicked
function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    clicksCount++
    if (clicksCount === 1) setRandomMines(i, j)

    if (gBoard[i][j].isMarked) return


    if (gBoard[i][j].isMine) {
        //MODEL:
        gBoard[i][j].isShown = true
        gGame.shownCount++

        //DOM:
        var elMine = document.querySelector(`.cell-${i}-${j} .mine`)
        elMine.style.maxHeight = '5vw'



    } else if (gBoard[i][j].minesAroundCount === 0) {
        revealNegs(i, j)

    } else if (gBoard[i][j].minesAroundCount !== 0) {
        //MODEL:
        gBoard[i][j].isShown = true
        gGame.shownCount++

        //DOM:
        var elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.style.fontSize = '4vw'
    }


    if (checkGameOver()) {
        gGame.isOn = false
        //ADD MODAL
    }
    if (checkVictory()) {
        gGame.isOn = false
        //ADD MODAL
    }
}

function revealNegs(i, j) {
    var row = i - 1
    var col = j - 1

    for (var k = 0; k < 3; k++) {
        if (row + k < 0) continue
        if (row + k === gLevel.SIZE) continue
        for (var l = 0; l < 3; l++) {
            if (col + l < 0) continue
            if (col + l === gLevel.SIZE) continue
            //MODEL:
            gBoard[row + k][col + l].isShown = true
            gGame.shownCount++

            //DOM:
            var elNeg = document.querySelector(`.cell-${row + k}-${col + l}`)
            elNeg.style.fontSize = '4vw'
        }
    }
}

//Called when a cell is right-clicked
function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return

    if (clicksCount === 0) return alert('Left click to start!\nYou can use flags afterwards')
    if (gBoard[i][j].isShown) return

    //MODEL:
    gBoard[i][j].isMarked = (gBoard[i][j].isMarked) ? false : true
    if (gBoard[i][j].isMarked) gGame.markedCount++

    //DOM:
    var elFlag = document.querySelector(`.cell-${i}-${j} .flag`)
    elFlag.classList.toggle('hide')

    if (checkVictory()) {
        gGame.isOn = false
        //ADD MODAL
    }
}

//Game ends when all mines are marked, and all the other cells are shown 
function checkGameOver() {

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isShown) {
                console.log('Game over');
                return true
            }
        }
    }
}

function checkVictory() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if ((gBoard[i][j].isMine && !gBoard[i][j].isMarked) ||
                (!gBoard[i][j].isMine && !gBoard[i][j].isShown)) {
                return false

            }
        }
    }
    return true
}

//When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
function expandShown(board, elCell, i, j) {

}

