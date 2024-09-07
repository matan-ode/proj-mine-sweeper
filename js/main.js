'use strict'
const FONT_SIZE = '15px'

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
var safeClicks
var isManualMode = false
var isShowingSafeClick = false

var isMegaMode = false
var megaModeUsed
var megaRange

var totalMines

var lastCellClickInfo = {
    i: null,
    j: null,
    elCell: null
}
var lastCellClicks = []




//This is called when page loads  
function onInit() {
    gGame = createGame()
    lastCellClicks = []
    totalMines = []
    megaModeUsed = false
    isMegaMode = false
    megaRange = []
    renderHearts()
    gGame.isOn = true
    safeClicks = 3
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
        strHints += `<button class="hint hint${i + 1}" onclick="onHint(this)">
                        💡
                    </button>`
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
    if (isManualMode) return
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

    // Show safe click above board
    var elClick = document.querySelector('.safe-click')
    elClick.innerText = `Safe Click :${safeClicks}`

    // Return Mega Hint button 'ready-to-click'
    var elMega = document.querySelector('.mega')
    elMega.classList.remove('clicked')


}

//Called when a cell is clicked
function onCellClicked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (!gGame.isOn) return

    lastCellClickInfo = {
        i: i,
        j: j,
        elCell: elCell
    }

    if (isMegaMode) {

        var clickInfo = {
            i,
            j,
            elCell
        }
        if (megaRange.length === 0) {
            megaRange.push(clickInfo)
            alert('Click a cell on Bottom-Right')
            return
        } else if (megaRange.length === 1) {
            megaRange.push(clickInfo)
            for (var k = megaRange[0].i; k <= megaRange[1].i; k++) {
                for (var l = megaRange[0].j; l <= megaRange[1].j; l++) {
                    // Only DOM for reveal:

                    if (gBoard[k][l].isMine) {
                        var elMine = document.querySelector(`.cell-${k}-${l} .mine`)
                        elMine.style.maxHeight = FONT_SIZE
                        elMine.classList.add('clicked')

                    } else {
                        var elCell = document.querySelector(`.cell-${k}-${l}`)
                        elCell.style.fontSize = FONT_SIZE
                        elCell.classList.add('clicked')
                    }
                }
            }
            setTimeout(cancelMegaReveal, 2000)
            return
        }
    }


    if (!isHintClicked && !isManualMode && (!isMegaMode || megaModeUsed)) {
        lastCellClicks.push(lastCellClickInfo)
        console.log(lastCellClicks);
    }

    clicksCount++

    if (clicksCount === 1 && !isManualMode) setRandomMines(i, j)

    if (isManualMode) {

        gBoard[i][j].isMine = (gBoard[i][j].isMine) ? false : true
        elCell.classList.toggle('clicked-manual')
        return
    }

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
        for (var k = 0; k < gGame.lifeCount; k++) {
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

    for (var k = 0; k < 3; k++) {
        var currI = row + k

        if (currI < 0) continue
        if (currI === gLevel.SIZE) continue

        for (var l = 0; l < 3; l++) {
            var currJ = col + l
            var currCell = gBoard[currI][col + l]

            if (currJ < 0) continue
            if (currJ === gLevel.SIZE) continue
            if (currCell.isMarked) continue
            if (currCell.isMine) continue
            if (currCell.isShown) continue

            //MODEL:
            currCell.isShown = true
            gGame.shownCount++

            //DOM:
            var elNeg = document.querySelector(`.cell-${currI}-${currJ}`)
            elNeg.style.fontSize = FONT_SIZE
            elNeg.classList.add('clicked')

            // Recursion to expose all empty neighbors
            if (currCell.minesAroundCount === 0) {
                revealNegs(currI, currJ)
            }
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
                revealMines()
                return true
            }
        }
    }
    return false
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
    if (isRevealingNegs) return
    if (!gGame.isOn) return
    if (isHintClicked && !elCell.classList.contains('clicked')) return
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

function onSafeClick(elClick) {

    if (safeClicks === 0) return
    safeClicks--
    isShowingSafeClick = true
    var i = getRandomIntInclusive(0, gLevel.SIZE - 1)
    var j = getRandomIntInclusive(0, gLevel.SIZE - 1)

    while (gBoard[i][j].isMine || gBoard[i][j].isShown) {
        i = getRandomIntInclusive(0, gLevel.SIZE - 1)
        j = getRandomIntInclusive(0, gLevel.SIZE - 1)
    }

    var elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.add('safe-clicked')

    elClick.innerText = `Safe Click :${safeClicks}`

    setTimeout(() => { cancelSafeClick(i, j) }, 2000)

}

function cancelSafeClick(i, j) {
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.remove('safe-clicked')
}

function onManuallyCreate(elBtn) {

    isManualMode = (isManualMode) ? false : true
    elBtn.classList.toggle('clicked')

    if (isManualMode) onResetGame()

    if (!isManualMode) {
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
    }
}

function revealMines() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                //MODEL:
                gBoard[i][j].isShown = true
                gGame.shownCount++

                //DOM:
                var elMine = document.querySelector(`.cell-${i}-${j} .mine`)
                elMine.style.maxHeight = FONT_SIZE
                elMine.classList.add('clicked')
            }
        }
    }
}

function onCancelClick() {
    if (lastCellClicks.length === 0) return
    if (!gGame.isOn) gGame.isOn = true


    var i = lastCellClicks[lastCellClicks.length - 1].i
    var j = lastCellClicks[lastCellClicks.length - 1].j
    var elCell = lastCellClicks[lastCellClicks.length - 1].elCell

    var currCell = gBoard[i][j]

    lastCellClicks.pop()
    console.log('pop:', lastCellClicks);

    if (currCell.isMine) {
        if (gGame.lifeCount === 0) {
            undoMinesExpose()

        } else {
            //MODEL:
            gBoard[i][j].isShown = false
            gGame.shownCount--
            gGame.lifeCount++

            //DOM:
            var elMine = document.querySelector(`.cell-${i}-${j} .mine`)
            elMine.style.maxHeight = 0
            elMine.classList.remove('clicked')

            var elLifes = document.querySelector('.lifes')
            var hearts = ''
            for (var i = 0; i < gGame.lifeCount; i++) {
                hearts += '❤️'
            }
            elLifes.innerText = hearts

        }
    } else if (currCell.minesAroundCount === 0) {
        undoRevealNegs(i, j)
    } else {
        //MODEL:
        gBoard[i][j].isShown = false
        gGame.shownCount--

        //DOM:
        var elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.style.fontSize = 0
        elCell.classList.remove('clicked')
    }

    if (checkGameOver() === false) {
        var elSmiley = document.querySelector('.smiley')
        elSmiley.innerText = '😁'
    }
}

function undoMinesExpose() {
    gGame.lifeCount++

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var isClickedNumber = false
            if (gBoard[i][j].isMine) {

                // Check if the cell was clicked before, if it was => do not hide him
                if (lastCellClicks.length > 0) {
                    for (var p = 0; p < lastCellClicks.length; p++) {
                        if (lastCellClicks[p].i === i && lastCellClicks[p].j === j) {
                            isClickedNumber = true
                            continue
                        }
                    }
                }


                if (!isClickedNumber) {
                    //MODEL:
                    gBoard[i][j].isShown = false
                    gGame.shownCount--

                    //DOM:
                    var elMine = document.querySelector(`.cell-${i}-${j} .mine`)
                    elMine.style.maxHeight = 0
                    elMine.classList.remove('clicked')
                }
            }
        }
    }

    var elLifes = document.querySelector('.lifes')
    var hearts = ''
    for (var i = 0; i < gGame.lifeCount; i++) {
        hearts += '❤️'
    }
    elLifes.innerText = hearts
}


function undoRevealNegs(i, j) {
    var row = i - 1
    var col = j - 1


    for (var k = 0; k < 3; k++) {
        var currI = row + k

        if (currI < 0) continue
        if (currI === gLevel.SIZE) continue

        for (var l = 0; l < 3; l++) {
            var currJ = col + l
            var currCell = gBoard[currI][col + l]
            var isClickedNumber = false

            if (currJ < 0) continue
            if (currJ === gLevel.SIZE) continue
            if (currCell.isMarked) continue
            if (currCell.isMine) continue
            if (!currCell.isShown) continue


            // Check if the cell was clicked before, if it was => do not hide him
            if (lastCellClicks.length > 0) {
                for (var p = 0; p < lastCellClicks.length; p++) {
                    if (lastCellClicks[p].i === currI && lastCellClicks[p].j === currJ) {
                        isClickedNumber = true
                        continue
                    }
                }
            }

            if (!isClickedNumber) {
                //MODEL:
                currCell.isShown = false
                gGame.shownCount--

                //DOM:
                var elNeg = document.querySelector(`.cell-${currI}-${currJ}`)
                elNeg.style.fontSize = 0
                elNeg.classList.remove('clicked')

                // Recursion to expose all empty neighbors
                if (currCell.minesAroundCount === 0) {
                    undoRevealNegs(currI, currJ)
                }
            }
        }
    }
}


function toggleDarkMode() {
    var elBody = document.querySelector('body')
    elBody.classList.toggle('dark-mode')

    var elHeader = document.querySelector('.header')
    elHeader.classList.toggle('dark-mode')

    var elFooter = document.querySelector('.footer')
    elFooter.classList.toggle('dark-mode')

    var elHints = document.querySelector('.hints')
    elHints.classList.toggle('dark-mode')

}

function onMegaClick(elBtn) {
    if (megaModeUsed) return alert('Sorry, you already used it...')

    isMegaMode = (isMegaMode) ? false : true
    elBtn.classList.toggle('clicked')
    if (clicksCount === 0) {
        alert('Click on a cell first, and than try again.')
        isMegaMode = (isMegaMode) ? false : true
        elBtn.classList.toggle('clicked')
        return
    }
    alert('Click a cell on Top-Left')

}

function cancelMegaReveal() {

    for (var k = megaRange[0].i; k <= megaRange[1].i; k++) {
        var currI = k
        for (var l = megaRange[0].j; l <= megaRange[1].j; l++) {
            var currJ = l
            if (!gBoard[currI][currJ].isShown) {
                if (gBoard[currI][currJ].isMine) {
                    var elMine = document.querySelector(`.cell-${k}-${l} .mine`)
                    elMine.style.maxHeight = 0
                    elMine.classList.remove('clicked')
                } else {
                    var elCell = document.querySelector(`.cell-${k}-${l}`)
                    elCell.style.fontSize = 0
                    elCell.classList.remove('clicked')
                }
            }
        }
    }
    megaModeUsed = true
}

function onExterminator() {
    if (clicksCount === 0) return alert('Start the game first, by clicking on the table')
    if (gLevel.SIZE === 4) return alert('Available only on levels MEDIUM and EXPERT')

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                var currMine = {
                    i: i,
                    j: j
                }
                totalMines.push(currMine)
            }
        }
    }

    var deletedMines = []

    for (var k = 0; k < 3; k++) {
        var randomIdx = getRandomIntInclusive(0, totalMines.length - 1)
        var deletedMine = totalMines.splice(randomIdx, 1)[0]
        deletedMines.push(deletedMine)

        // console.log(deletedMines);

        //MODEL Mine:
        var currI = deletedMine.i
        var currJ = deletedMine.j
        gBoard[currI][currJ].isMine = false
    }

    //MODEL Negs - Updating minesAroundCount:
    setMinesNegsCount(gBoard)

    for (var p = 0; p < deletedMines.length; p++) {
        // console.log(deletedMines[p]);


        var currI = deletedMines[p].i
        var currJ = deletedMines[p].j

        //DOM Mine:
        var elMine = document.querySelector(`.cell-${currI}-${currJ}`)
        console.log(elMine);

        elMine.classList.add('deleted-mine')
        elMine.classList.remove('mine')
        elMine.innerText = gBoard[currI][currJ].minesAroundCount

        //DOM Negs:
        var row = currI - 1
        var col = currJ - 1

        for (var m = 0; m < 3; m++) {
            if (row + m < 0) continue
            if (row + m === gLevel.SIZE) continue
            for (var l = 0; l < 3; l++) {
                if (col + l < 0) continue
                if (col + l === gLevel.SIZE) continue
                var elNeg = document.querySelector(`.cell-${row + m}-${col + l}`)
                var strMinesAround = (gBoard[row + m][col + l].minesAroundCount === 0) ? ' ' : gBoard[row + m][col + l].minesAroundCount

                if (!gBoard[row + m][col + l].isMine) {
                    elNeg.innerHTML = `${strMinesAround}<img class="flag hide" src="img/flag.png"></img>`

                }
            }
        }
    }
}