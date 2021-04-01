class Connect4 {
        constructor(selector) {
                this.ROWS = 6;
                this.COLS = 7;
                this.player = 'Red';
                this.opponentColor = 'Blue';
                this.canMove = true;
                this.selector = selector;
                this.isGameOver = false;
                this.onPlayerMove = function () { };
                this.createGrid();
                this.setupEventListeners();
        }

        serializeSocketMessage(type, payload) {
                return JSON.stringify({ type: type, payload: payload });
        }

        createGrid() {
                const $board = $(this.selector);
                $board.empty();
                this.isGameOver = false;
                this.player = 'Red';
                for (let row = 0; row < this.ROWS; row++) {
                        const $row = $('<div>').addClass('row');
                        for (let col = 0; col < this.COLS; col++) {
                                const $col = $('<div>').addClass('col empty').attr('data-col', col).attr('data-row', row);
                                $row.append($col);
                        }
                        $board.append($row);
                }
        }

        setupEventListeners() {
                const $board = $(this.selector);
                const that = this;
                function findLastEmptyCell(col) {
                        const cells = $(`.col[data-col='${col}']`);
                        for (let i = cells.length - 1; i >= 0; i--) {
                                const $cell = $(cells[i]);
                                if ($cell.hasClass('empty')) {
                                        return $cell;
                                }
                        }
                        return null;
                }

                $board.on('mouseenter', '.col.empty', function () {
                        if (that.isGameOver) return;
                        const col = $(this).data('col');
                        const $lastEmptyCell = findLastEmptyCell(col);
                        $lastEmptyCell.addClass(`next-${that.player}`);
                });

                $board.on('mouseleave', '.col', function () {
                        $('.col').removeClass(`next-${that.player}`);
                });

                $board.on('click', '.col.empty', function () {
                        if (that.canMove) {

                                if (that.isGameOver) return;
                                const col = $(this).data('col');
                                const $lastEmptyCell = findLastEmptyCell(col);
                                console.log(that.player)
                                $lastEmptyCell.addClass(that.player);
                                $lastEmptyCell.removeClass(`empty next-${that.player}`);
                                $lastEmptyCell.data('player', that.player);

                                const winner = that.checkForWinner($lastEmptyCell.data('row'), $lastEmptyCell.data('col'));
                                if (winner) {
                                        that.isGameOver = true;
                                        alert(`Game Over! Player ${that.player} has won!`); 
                                        $('.col.empty').removeClass('empty');
                                        return;
                        
                                }

                                // that.player = that.player === 'Red' ? 'Blue' : 'Red';
                                var cellRow = $lastEmptyCell.attr('data-row');
                                var cellCol = $lastEmptyCell.attr('data-col');
                                that.onPlayerMove({ cellRow: cellRow, cellCol: cellCol });
                                that.canMove=false;
                                $(this).trigger('mouseenter');
                        }
                });
        }


        setPlayerColor(color) {
                if (color) {
                        this.player = 'Red'
                        this.opponentColor = 'Blue'
                        this.canMove = true
                } else {

                        this.player = 'Blue'
                        this.opponentColor = 'Red'
                        this.canMove = false;
                }
        }

        opponentMove(move) {
                const cell = $(`div.col[data-col=${move.col}][data-row=${move.row}]`);
                console.log(cell)

                cell.removeClass(`empty next-${this.player}`);
                cell.addClass(this.opponentColor);
                cell.data('player', this.opponentColor);


                this.canMove = true;
                // this.player = this.player === 'Red' ? 'Blue' : 'Red';
                $(this).trigger('mouseenter');
        }


        checkForWinner(row, col) {
                const that = this;

                function $getCell(i, j) {
                        return $(`.col[data-row='${i}'][data-col='${j}']`);
                }

                function checkDirection(direction) {
                        let total = 0;
                        let i = row + direction.i;
                        let j = col + direction.j;
                        let $next = $getCell(i, j);
                        while (i >= 0 && i < that.ROWS && j >= 0 && j < that.COLS && $next.data('player') === that.player) {
                                total++;
                                i += direction.i;
                                j += direction.j;
                                $next = $getCell(i, j);
                        }
                        return total;
                }

                function checkWin(directionA, directionB) {
                        const total = 1 + checkDirection(directionA) + checkDirection(directionB);
                        if (total >= 4) {
                                return that.player;
                        } else {
                                return null;
                        }
                }

                function checkDiagonalBLtoTR() {
                        return checkWin({ i: 1, j: -1 }, { i: -1, j: 1 });
                }

                function checkDiagonalTLtoBR() {
                        return checkWin({ i: 1, j: 1 }, { i: -1, j: -1 });
                }

                function checkVerticals() {
                        return checkWin({ i: -1, j: 0 }, { i: 1, j: 0 });
                }

                function checkHorizontals() {
                        return checkWin({ i: 0, j: -1 }, { i: 0, j: 1 });
                }

                return checkVerticals() || checkHorizontals() || checkDiagonalBLtoTR() || checkDiagonalTLtoBR();
        }
        opponentWin(){
                const winner = this.checkForWinner($lastEmptyCell.data('row'), $lastEmptyCell.data('col'));
                        if (winner) {
                                this.isGameOver = true;
                                        alert(`Game Over! Player ${this.player} has won!`); 
                                        $('.col.empty').removeClass('empty');
                                        return;
                                }
        }
        restart() {
                this.createGrid();
                this.onPlayerMove();
        }
}
