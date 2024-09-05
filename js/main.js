'use strict'


// A Matrix containing cell objects
var gBoard
// This is an object by which the board size is set and how many mines to place
var gLevel = {
    SIZE: 4,
    MINES: 2,
    bestScore: localStorage.getItem('bestScoreBeginner')
}
//This is an object in which you can keep and update the current game state
var gGame

var isHintClicked = false
var isRevealingNegs = false
var clicksCount
const FONT_SIZE = '2vw'



//This is called when page loads  
function onInit() {
    gGame = createGame()
    renderHearts()
    gGame.isOn = true
    clicksCount = 0
    gBoard = buildBoard()
    renderBoard(gBoard)
}


function createGame() {
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😁'
    var elHints = document.querySelector('.hints')
    var strHints = ''
    for (var i = 0; i < 3; i++) {
        strHints += `<div class="hint hint${i + 1}" onclick="onHint(this)">
                        💡
                    </div>`
    }
    elHints.innerHTML = strHints

    var gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lifeCount: 3
    }
    return gGame
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

    gBoard = buildBoard()

    // gBoard[0][0].isMine = true
    // gBoard[0][1].isMine = true

    for (var k = 0; k < gLevel.MINES; k++) {
        var i = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var j = getRandomIntInclusive(0, gLevel.SIZE - 1)
        if (firstCLickI === i && firstClickJ === j) {
            k--
            continue
        }
        gBoard[i][j].isMine = true
    }

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

    // Show best score on the board according to board size
    showBestScore()

}

//Called when a cell is clicked
function onCellClicked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (!gGame.isOn) return

    clicksCount++
    if (clicksCount === 1) setRandomMines(i, j)

    if (gBoard[i][j].isMarked) return

    if (isHintClicked) {
        if (isRevealingNegs) return
        return revealAllNegs(i, j)
    }

    if (gBoard[i][j].isMine) {
        //MODEL:
        gBoard[i][j].isShown = true
        gGame.shownCount++
        gGame.lifeCount--

        //DOM:
        var elMine = document.querySelector(`.cell-${i}-${j} .mine`)
        elMine.style.maxHeight = FONT_SIZE
        elMine.classList.add('clicked')

        var elLifes = document.querySelector('.lifes')
        var hearts = ''
        for (var i = 0; i < gGame.lifeCount; i++) {
            hearts += '❤️'
        }
        elLifes.innerText = hearts

    } else if (gBoard[i][j].minesAroundCount === 0) {
        revealNegs(i, j)

    } else {
        //MODEL:
        gBoard[i][j].isShown = true
        gGame.shownCount++

        //DOM:
        var elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.style.fontSize = FONT_SIZE
        elCell.classList.add('clicked')
    }

    if (checkGameOver()) {
        gGame.isOn = false
        console.log('Game Over');

        //ADD MODAL
    }
    if (checkVictory()) {
        gGame.isOn = false
        console.log('Victory');


        //ADD MODAL
    }
}

function revealNegs(i, j) {
    var row = i - 1
    var col = j - 1
    var secShownCount = 0

    for (var k = 0; k < 3; k++) {
        if (row + k < 0) continue
        if (row + k === gLevel.SIZE) continue
        for (var l = 0; l < 3; l++) {
            if (col + l < 0) continue
            if (col + l === gLevel.SIZE) continue
            if (gBoard[row + k][col + l].isMarked) continue
            if (gBoard[row + k][col + l].isMine) continue




            //MODEL:
            gBoard[row + k][col + l].isShown = true
            gGame.shownCount++
            if (gBoard[row + k][col + l].isShown) secShownCount++

            //DOM:
            var elNeg = document.querySelector(`.cell-${row + k}-${col + l}`)
            elNeg.style.fontSize = FONT_SIZE
            elNeg.classList.add('clicked')
        }
    }
    if (secShownCount > 2) {
        expandShown(gBoard, i, j)
    }
}

//When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
function expandShown(board, i, j) {
    // var openerCell = gBoard[i][j]
    // var openedCell = gBoard[row + k][col + l]

    var row = i - 1
    var col = j - 1
    var secShownCount = 0

    for (var k = 0; k < 3; k++) {
        if (row + k < 0) continue
        if (row + k === gLevel.SIZE) continue
        for (var l = 0; l < 3; l++) {
            if (col + l < 0) continue
            if (col + l === gLevel.SIZE) continue
            if (gBoard[row + k][col + l].isMarked) continue
            if (gBoard[row + k][col + l].isMine) continue




            //MODEL:
            gBoard[row + k][col + l].isShown = true
            gGame.shownCount++
            if (gBoard[row + k][col + l].isShown) secShownCount++

            //DOM:
            var elNeg = document.querySelector(`.cell-${row + k}-${col + l}`)
            elNeg.style.fontSize = FONT_SIZE
            elNeg.classList.add('clicked')
        }
    }

}

function revealAllNegs(i, j) {
    isRevealingNegs = true
    var row = i - 1
    var col = j - 1

    for (var k = 0; k < 3; k++) {
        if (row + k < 0) continue
        if (row + k === gLevel.SIZE) continue
        for (var l = 0; l < 3; l++) {
            if (col + l < 0) continue
            if (col + l === gLevel.SIZE) continue
            if (gBoard[row + k][col + l].isMarked) continue

            if (gBoard[row + k][col + l].isMine) {
                //DOM:
                var elMine = document.querySelector(`.cell-${row + k}-${col + l} .mine`)
                elMine.style.maxHeight = FONT_SIZE
                elMine.classList.add('clicked')

            } else {
                //DOM:
                var elNeg = document.querySelector(`.cell-${row + k}-${col + l}`)
                elNeg.style.fontSize = FONT_SIZE
                elNeg.classList.add('clicked')
            }
        }
    }
    setTimeout(() => {
        isRevealingNegs = false
        cancelRevealAllNegs(i, j)
        removeHint()
    }, 1000)
}

function cancelRevealAllNegs(i, j) {
    var row = i - 1
    var col = j - 1

    for (var k = 0; k < 3; k++) {
        if (row + k < 0) continue
        if (row + k === gLevel.SIZE) continue
        for (var l = 0; l < 3; l++) {
            if (col + l < 0) continue
            if (col + l === gLevel.SIZE) continue
            if (gBoard[row + k][col + l].isMarked) continue
            if (gBoard[row + k][col + l].isShown) continue


            if (gBoard[row + k][col + l].isMine) {
                //DOM:
                var elMine = document.querySelector(`.cell-${row + k}-${col + l} .mine`)
                elMine.style.maxHeight = 0
                elMine.classList.remove('clicked')

            } else {
                //DOM:
                var elNeg = document.querySelector(`.cell-${row + k}-${col + l}`)
                elNeg.style.fontSize = 0
                elNeg.classList.remove('clicked')
            }
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
        console.log('Victory');

        //ADD MODAL
    }
}

//Game ends when all mines are marked, and all the other cells are shown 
function checkGameOver() {
    var count = 0
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isShown) {
                count++
            }
            if (gGame.lifeCount === 0) {
                var elSmiley = document.querySelector('.smiley')
                elSmiley.innerText = '😭'
                var score = calcScore()
                setBestScore(score)
                return true
            }
        }
    }
}

function checkVictory() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if ((gBoard[i][j].isMine && !gBoard[i][j].isShown && !gBoard[i][j].isMarked) ||
                (!gBoard[i][j].isMine && !gBoard[i][j].isShown)) {
                return false

            }
        }
    }
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😎'
    var score = calcScore()
    setBestScore(score)
    return true
}

function chooseDifficulty(size, mines, difficulty) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    gLevel.bestScore = localStorage.getItem(`bestScore${difficulty}`)
    // setBestScore(calcScore())
    // console.log(gLevel.bestScore);
    onInit()
}


function renderHearts() {
    var elLifes = document.querySelector('.lifes')
    var hearts = ''
    for (var i = 0; i < gGame.lifeCount; i++) {
        hearts += '❤️'
    }
    elLifes.innerText = hearts
}

function onResetGame() {
    onInit()
}

function onHint(elCell) {
    if (!gGame.isOn) return
    elCell.classList.toggle('clicked')
    isHintClicked = (isHintClicked) ? false : true

    // elCell.style.backgroundColor = '#227B94'


}
function removeHint() {
    var elClickedHint = document.querySelectorAll('.hint.clicked')
    for (var i = 0; i < 3; i++) {
        if (!elClickedHint[i]) return
        elClickedHint[i].classList.add('hide')
        isHintClicked = false
    }
}

function calcScore() {
    var score = 0
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMarked && gBoard[i][j].isMine) {
                score++
            }
        }
    }
    return score
}

function setBestScore(score) {

    //MODEL:
    var bestScore
    if (gLevel.SIZE === 4) {
        bestScore = localStorage.getItem('bestScoreBeginner')
        if (score > bestScore) {
            localStorage.setItem('bestScoreBeginner', score)
        }
    }
    else if (gLevel.SIZE === 8) {
        bestScore = localStorage.getItem('bestScoreMedium')
        if (score > bestScore) {
            localStorage.setItem('bestScoreMedium', score)
        }
    }
    else if (gLevel.SIZE === 12) {
        bestScore = localStorage.getItem('bestScoreExpert')
        if (score > bestScore) {
            localStorage.setItem('bestScoreExpert', score)
        }
    }

    //DOM:
    showBestScore()
}

function showBestScore() {

    //DOM:
    var difficulty
    if (gLevel.SIZE === 4) difficulty = 'Beginner'
    else if (gLevel.SIZE === 8) difficulty = 'Medium'
    else if (gLevel.SIZE === 12) difficulty = 'Expert'

    gLevel.bestScore = localStorage.getItem(`bestScore${difficulty}`)
    const elScore = document.querySelector('.score h2')
    elScore.innerText = `Best Score: ${gLevel.bestScore}`

}