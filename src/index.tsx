import React from 'react';
import ReactDOM from 'react-dom';
import { useState } from 'react';
import { Repeat } from 'typescript-tuple';
import './index.css';

/**
 * 各マスの状態の型
 */
type SquareState = 'o' | 'x' | null

/**
 * マスに対応するプロパティの型
 */
type SquareProps = {
  value: SquareState
  onClick: () => void
}

/**
 * マスのレンダリング
 */

const Square = (props: SquareProps) => (
  <button className='square' onClick={props.onClick}>
    {props.value}
  </button>
)

/**
 * 盤面の状態
 */
type BoardState = Repeat<SquareState, 9>

type BoardProps = {
  squares: BoardState
  onClick: (i: number) => void
}

/**
 * 盤面の描画
 */

const Board = (props: BoardProps) => {
  const renderSquare = (i: number) => (
    <Square value={props.squares[i]} onClick={() => props.onClick(i)} />
  )

  return (
    <div>
      <div className='board-row'>
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className='board-row'>
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className='board-row'>
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  )
}

/**
 * あるターンでのゲームの状態（盤面と次のプレイヤー）
 */
type Step = {
  squares: BoardState
  xIsNext: boolean
}

/**
 * ゲームの状態
 */
type GameState = {
  readonly history: Step[]
  readonly stepNumber: number
}

/**
 * ゲーム全体の描画
 */

const Game = () => {
  //stateの初期設定
  const [state, setState] = useState<GameState>({
    history: [
      {
        squares: [null, null, null, null, null, null, null, null, null],
        xIsNext: true,
      },
    ],
    stepNumber: 0,
  })
  const current = state.history[state.stepNumber]

  const winner = calculateWinner(current.squares)
  const status = winner ? `Winner: ${winner}` : `Next player: ${current.xIsNext ? 'x' : 'o'}`

  const handleClick = (i: number) => {
    //勝者がいるか、もしくはクリックしたマスが空白でないなら何もしない
    if (winner || current.squares[i]) {
      return
    }

    const next: Step = (({ squares, xIsNext }) => {
      const nextSquares = squares.slice() as BoardState
      nextSquares[i] = xIsNext ? 'x' : 'o'
      return {
        squares: nextSquares,
        xIsNext: !xIsNext,
      }
    })(current)

    //ゲームを次の手番に更新
    setState(({ history, stepNumber }) => {
      const newHistory = history.slice(0, stepNumber + 1).concat(next)

      return {
        history: newHistory,
        stepNumber: newHistory.length - 1,
      }
    })
  }

  const jumpTo = (move: number) => {
    setState(prev => ({
      ...prev,
      stepNumber: move,
    }))
  }

  /**
   * ゲームを指定した回数巻き戻す
   */
  const moves = state.history.map((step, move) => {
    const desc = move > 0 ? `Go to move #${move}` : 'Go to game start'
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    )
  })

  return (
    <div className='game'>
      <div className='game-board'>
        <Board squares={current.squares} onClick={handleClick} />
      </div>
      <div className='game-info'>
        <div>{status}</div>
        <ol>{moves}</ol>
      </div>
    </div>
  )
}

/**
 * 現在の勝者を判定（いなければnull）
 */
const calculateWinner = (squares: BoardState) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  //あるラインにてビンゴが成立していたらtrue,そうでないならfalse
  const judge = (line: number[]) => {
    const boxes = line.map(e => squares[e])
    return boxes.every(e => e === boxes[0])
  }

  //ビンゴが成立している列
  const result = lines.find(judge)?.flat()
  return result ? squares[result[0]] : null
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
