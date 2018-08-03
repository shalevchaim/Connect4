import React, { Component } from 'react';
import '../css/style.css';

const colorNames = {
  '0': '',
  '1': ' red',
  '2': ' yellow'
};

//TODO: configure the url
const io = require('socket.io-client');
const socket = io.connect('http://localhost:5000');
const segments = window.location.pathname.split('/');

socket.on('connect', (data) => {
  console.log("connect");
  console.log(data);
  socket.emit('join', { 'gid': segments[2].toString() });

  // socket.on('joined', (data) => {
  //   console.log("have i joined?");
  //   console.log(data);
  // })
});

function Piece(props) {
  let color = colorNames[props.color.toString()]
  if(props.color === 0) {
    color = props.redsMove ? colorNames[1] : colorNames[2];
  }
  return (
    <div className="piece-container">
      <div className={"piece piece" + props.row + color + " d-flex justify-content-center align-items-center " + (props.color === 0 ? "pieceUp" : "pieceDown")}>
      </div>
    </div>
  );
}

class BoardRow extends Component {
  render() {
    const pieces = [];
    const pInfo = this.props.pInfo;
    for (let i = 1; i < 7; i++) {
      pieces.push(<Piece key={i} redsMove={this.props.red} color={pInfo[i - 1]} col={this.props.col} row={i - 1} num={this.props.col.toString() + (i - 1).toString()} />);
    }
    return (
      <div className="board-row" onClick={this.props.onClick}>
        {pieces}
      </div>
    );
  }
}

class Board extends Component {

  render() {
    const rows = [];
    for (let i = 0; i < 7; i++) {
      rows.push(<BoardRow pInfo={this.props.pieces[i]} col={i} red={this.props.redsMove} onClick={() => this.props.handleClick(i)} key={i.toString()} id={i} />);
    }

    return (
      <div className="row">
        <div className="col-12">
          <div className="row board">
            {rows}
          </div>
        </div>
      </div>
    );
  }
}

class GameApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redsMove: newData.redsMove,
      pieces: newData.board,
      players: newData.players,
      playerName: '',
      rowsCount: newData.rowsCount,
      gameOver: newData.gameOver,
      gameStatus: newData.gameStatus,
      iAmRed: true,
      color: '',
    };

    this.playerAdded = this.playerAdded.bind(this);
    this.removedPlayer = this.removedPlayer.bind(this);
    this.moveMade = this.moveMade.bind(this);
    this.setPlayerColor = this.setPlayerColor.bind(this);
  }

  componentDidMount() {
    socket.on('playerAdded', this.playerAdded);
    socket.on('removeUser', this.removedPlayer);
    socket.on('moveMade', this.moveMade);
    socket.on('setPlayerColor', this.setPlayerColor);
  }

  moveMade(data) {
    // console.log("made a move");
    this.setState({
      pieces: data['pieces'],
      rowsCount: data['roomInfo']['rowsCount'],
      redsMove: data['roomInfo']['redsMove'],
      gameOver: data['roomInfo']['gameOver'],
      gameStatus: data['roomInfo']['gameStatus']
    });
  }

  removedPlayer(data) {
    // console.log("a player has left");
    this.setState({
      players: data['players'],
    });
  }

  playerAdded(data) {
    // console.log("you're added");
    this.setState({
      players: data['players'],
    });
  }

  setPlayerColor(data) {
    this.setState({
      iAmRed: data['color'] === 'red' ? true : false,
      color: data['color'],
    });
  }

  handleClick(i) {
    //check if user can make a move
    if (this.state.rowsCount[i] >= 6 || this.state.gameOver || this.state.iAmRed != this.state.redsMove) {
      // console.log("can't place a piece here");
      // console.log("count: "+this.state.rowsCount[i]);
      // console.log("gameOver? "+this.state.gameOver);
      // console.log(this.state.iAmRed+" ? "+this.state.redsMove);
      return;
    }

    if(this.state.players['yellow'] === '' || this.state.players['red'] === '') {
      // console.log("not enough players");
      this.setState({gameStatus: "Not enough players"});
      return;
    }

    const pieces = this.state.pieces.slice();
    const rowsCount = this.state.rowsCount.slice();
    const row = pieces[i].slice();

    row[5 - rowsCount[i]] = this.state.redsMove ? 1 : 2;
    rowsCount[i] = rowsCount[i] + 1;
    pieces[i] = row;

    //send move to server for calculations and to save game state
    const socketData = {
      pieces: pieces,
      gid: segments[2],
      redsMove: !this.state.redsMove,
      rowsCount: rowsCount,
      column: i,
      gameOver: this.state.gameOver,
      gameStatus: this.state.gameStatus
    };
    socket.emit('makeMove', socketData);

    //prevent user from making 2 moves at once
    this.setState({
      redsMove: !this.state.redsMove,
    });
  }

  render() {
    return (
      <div className="col-12 h-100">
        <div className="row h-100 main">
          <div className="sidebar col-lg-2 col-sm-3 d-flex align-items-start align-self-center">
            <Sidebar gameStatus={this.state.gameStatus} color={this.state.color} yellowName={this.state.players['yellow']} redName={this.state.players['red']} players={this.state.players} playerName={this.state.playerName} />
          </div>
          <div className="content col-lg-10 col-sm-9 d-flex justify-content-center align-items-center">
            <Board pieces={this.state.pieces} redsMove={this.state.redsMove} gameStatus={this.state.gameStatus} handleClick={(i) => this.handleClick(i)} />
          </div>
        </div>
      </div>
    );
  }
}

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yellowName: this.props.yellowName,
      redName: this.props.redName,
      players: this.props.players,
      tempYellow: '',
      tempRed: '',
      iAmRed: this.props.iAmRed,
    };
    this.nameChangeYellow = this.nameChangeYellow.bind(this);
    this.handleSubmitYellow = this.handleSubmitYellow.bind(this);
    this.nameChangeRed = this.nameChangeRed.bind(this);
    this.handleSubmitRed = this.handleSubmitRed.bind(this);
  }

  handleSubmitYellow(event) {
    event.preventDefault();
    const playerInfo = {
      name: this.state.tempYellow,
      gid: segments[2],
      color: 'yellow'
    };
    socket.emit('addPlayer', playerInfo);
  }

  nameChangeYellow(event) {
    //name change
    this.setState({
      tempYellow: event.target.value
    });
  }

  handleSubmitRed(event) {
    event.preventDefault();
    const playerInfo = {
      name: this.state.tempRed,
      gid: segments[2],
      color: 'red'
    };
    socket.emit('addPlayer', playerInfo);
  }

  nameChangeRed(event) {
    //name change
    this.setState({
      tempRed: event.target.value
    });
  }

  render() {
    let yellowPlayer = (
      <form onSubmit={this.handleSubmitYellow}>
        Yellow: <input type="text" value={this.state.tempYellow} placeholder="Enter your name..." onChange={this.nameChangeYellow} />
        <input type="submit" value="Save Name" />
      </form>
    );
    let redPlayer = (
      <form onSubmit={this.handleSubmitRed}>
        Red: <input type="text" value={this.state.tempRed} placeholder="Enter your name..." onChange={this.nameChangeRed} />
        <input type="submit" value="Save Name" />
      </form>
    );

    if (this.props.redName !== '') {
      redPlayer = "Red: " + this.props.redName;
    } else if(this.props.color === 'yellow') {
      redPlayer = "Red: ..waiting for player to join";
    }

    if (this.props.yellowName !== '') {
      yellowPlayer = "Yellow: "+this.props.yellowName;
    } else if(this.props.color === 'red') {
      yellowPlayer = "Yellow: ..waiting for player to join";
    }
    return (
      <div className="row">
        <div className="col-12 player red">
          {redPlayer}
        </div>
        <div className="col-12 player yellow">
          {yellowPlayer}
        </div>
        <div className="col-12 gameStatus">
        {this.props.gameStatus}
        </div>
      </div>
    );
  }
}

export default GameApp;