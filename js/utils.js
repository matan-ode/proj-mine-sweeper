'use strict'


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

function generateColor() {
    const hexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += hexArray[Math.floor(Math.random() * 16)];
    }
    return `#${code}`

}

function drawNum() {
    var num = undefined
    while (num === undefined) {
        var randomIdx = getRandomInt(0, 99)
        var numAsArray = gNums.splice(randomIdx, 1)
        var num = numAsArray[0]
    }
    return num
}

function findEmptyLocations() {
    const size = 10
    var cells = []
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (gBoard[i][j] === EMPTY) {
                var emptyCell = {
                    i: i,
                    j: j
                }
                cells.push(emptyCell)
            }
        }
    }
    emptyCells = cells
    // console.log(emptyCells);
    if (isNoFoodLeft()) {

        victory()
    }

}

function buildBoard() {
    const size = SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = FOOD // or EMPTY

            if (i === 0 || i === size - 1 ||
                j === 0 || j === size - 1 ||
                (j === 3 && i > 4 && i < size - 2)) {
                board[i][j] = WALL
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            const cell = board[i][j]
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function countNegs(value) {
    var count = 0
    var row = gGamerPos.i - 1
    var col = gGamerPos.j - 1

    for (var k = 0; k < 3; k++) {
        for (var l = 0; l < 3; l++) {
            if (gBoard[row + k][col + l].gameElement === value) count++
        }

    }
    return count
}

function updateScore(diff) {
    // update model 
    if (diff) {
        gGame.score += diff
    } else {
        gGame.score = 0
    }
    // and dom
    document.querySelector('span.score').innerText = gGame.score

    // console.log(gGame.score)


}

function removeModal() {
    var elModal = document.querySelector('.modal')
    elModal.classList.add('hide')
}

function showModal() {
    var elModal = document.querySelector('.modal')
    elModal.classList.remove('hide')
}

// shuffle numbers array
function shuffleNums(nums) {
    for (var i = nums.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = nums[i]
        nums[i] = nums[j]
        nums[j] = temp
    }
}

// create an array of numbers of 'SIZE' numbers
function createNums(nums) {
    for (var i = 0; i < SIZE; i++) {
        nums.push(i + 1)
    }
    return nums
}

//create matrix of 'rows' and 'cols'
function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

//* Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function toAscii(char) {
    return char.charCodeAt(0)
}

function fromAscii(code) {
    return String.fromCharCode(code)
}

function bblSort(arr) {

    for (var i = 0; i < arr.length; i++) {

        // Last i elements are already in place  
        for (var j = 0; j < (arr.length - i - 1); j++) {

            // Checking if the item at present iteration 
            // is greater than the next iteration
            if (arr[j] > arr[j + 1]) {

                // If the condition is true
                // then swap them
                var temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            }
        }
    }

    // Print the sorted array
    console.log(arr);
}

function getNextLocation(eventKeyboard, player) {

    const nextLocation = {
        i: player.location.i,
        j: player.location.j
    }
    // TODO: figure out nextLocation
    switch (eventKeyboard) {
        case 'ArrowUp':
            nextLocation.i--
            break;
        case 'ArrowRight':
            nextLocation.j++
            break;
        case 'ArrowDown':
            nextLocation.i++
            break;
        case 'ArrowLeft':
            nextLocation.j--
            break;
    }

    return nextLocation
}

function sumAreaMat(mat, rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd) {
    var sum = 0
    for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
        for (var j = colIdxStart; j <= colIdxEnd; j++) {
            var currNum = mat[i][j]
            sum += currNum
        }
    }
    return sum
}

function matDiagonalsSums(mat) {
    var sumOfDiagonalLeft = 0
    var sumOfDiagonalRight = 0
    for (var i = 0; i < mat.length; i++) {
        sumOfDiagonalLeft += mat[i][i]
        sumOfDiagonalRight += mat[i][mat.length - 1 - i]
    }

    var sumsOfDiagonals = [sumOfDiagonalLeft, sumOfDiagonalRight]

    return sumsOfDiagonals

}

function findMode(mat) {
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            var currNum = mat[i][j]
            if (numsMap[currNum]) numsMap[currNum]++
            else numsMap[currNum] = 1
           
        }
    }

    var maxCountsNums = []
    var maxNum = -Infinity
    for (var num in numsMap) {
        var currNumsCount = numsMap[num]
        if (currNumsCount > maxNum) {
            maxNum = currNumsCount
            maxCountsNums = [num]
        }
        else if (currNumsCount === maxNum) maxCountsNums.push(num)
    }
    // console.log(maxCountsNums);

    return maxCountsNums

}

function sumCol(mat, colIdx) {
    var sumCol = 0
    for (var i = 0; i < mat.length; i++) {
        var currNum = mat[i][colIdx]
        sumCol += currNum
    }
    return sumCol
}

function sumRow(mat, rowIdx) {
    var sumRow = 0
    for (var i = 0; i < mat[0].length; i++) {
        var currNum = mat[rowIdx][i]
        sumRow += currNum
    }
    return sumRow
}

function getNthLargest(nums, nthNum) {
    
    var numsTemp = nums
    for (var j = 0; j < nthNum; j++) {
        var maxNum = -Infinity
        for (var i = 0; i < numsTemp.length; i++) {
            var currNum = numsTemp[i]
            if (currNum > maxNum) maxNum = currNum
        }
        if(j === nthNum-1) return maxNum
        var idxMaxNum = numsTemp.indexOf(maxNum)
        numsTemp.splice(idxMaxNum, 1)
        
    }
}

function isNumber(value) {
    return typeof value === 'number';
}

function isEven(num){
    return (num % 2 === 0)  
        
}

function getBiggerNum(num1, num2){
    return (num1 > num2)? num1 : num2
}

function getFactorial(num){
    var mult = 1
    var count = 0
    while (count < num-1){
        mult *= (num - count)
        count++
    }
    return mult
}

function writeNum(num){
    var digitNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five' , 'Six', 'Seven', 'Eight', 'Nine']
    var numStr = num + ''
    var newStr = ''
    for(var i = 0 ; i < numStr.length ; i++){
        var currChar = numStr.charAt(i)
        newStr += digitNames[currChar] + ' '
    }
    return newStr

}


//* Move the player to a specific location
function moveTo(i, j) {


    if (stuckGamer) return clearTimeout(timeoutID)
    else {
        const targetCell = gBoard[i][j]
        if (targetCell.type === WALL) return

        //* Calculate distance to make sure we are moving to a neighbor cell
        var iAbsDiff = Math.abs(i - gGamerPos.i)
        var jAbsDiff = Math.abs(j - gGamerPos.j)

        //* If the clicked Cell is one of the four allowed
        if ((isSecretPassages(i, j) && (i === gGamerPos.i || j === gGamerPos.j)) || (iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

            if (targetCell.gameElement === BALL) {
                console.log('Collecting!')
                var collectSound = new Audio('sounds/collect.mp3')
                collectSound.play()
                countBallCollect++
                var elBallCollect = document.querySelector('.ball-collect')
                elBallCollect.innerText = `You collected: ${countBallCollect} balls`

            }

            if (targetCell.gameElement === GLUE) {
                console.log('Stuck!')
                var collectSound = new Audio('sounds/pop.mp3')
                collectSound.play()
                // currGlueTime = new Date.now()
                toStuckGamer()


            }


            //* REMOVE FROM LAST CELL
            // update the MODEl
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
            // update the DOM
            renderCell(gGamerPos, '')


            //* ADD TO NEXT CELL
            // update the MODEl
            gBoard[i][j].gameElement = GAMER
            gGamerPos = { i, j }
            // update the DOM
            renderCell(gGamerPos, GAMER_IMG)

        } else {
            console.log('TOO FAR', iAbsDiff, jAbsDiff)
        }
    }

    var headerHTML = ''
    headerHTML += `Collect those Ball! your Neighbors: ${countNegs()}`
    const elHeader = document.querySelector('.header')
    elHeader.innerText = headerHTML
}