import React, { Component } from 'react';
import '../css/style.css';

const colorNames = {
    '0': '',
    '1': ' red',
    '2': ' yellow'
};

const segments = window.location.pathname.split('/');
console.log(segments);
const io = require('socket.io-client');
const socket = io.connect('http://localhost:5000');

// class Board extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             redsMove: true,
//             pieces: Array(7).fill(Array(6).fill(0)),
//             rowsCount: Array(7).fill(0),
//             gameOver: false,
//             gameStatus: "Reds move",
//         };

//         // this.socket = io.connect('http://localhost:5000');
//         // this.socket.on('yoyo', (data) => {
//         //   console.log("yoyo returned");
//         //   console.log(data);
//         // });
//     }

//     handleIn(d) {
//       console.log("received data from server:");
//       console.log(d);
//     }

//     componentDidMount() {
//       // this.socket.on('connect', () => {
//       //   console.log('new connect 3');
//       // this.socket.emit('testApp3', segments[2], (data) => {
//       //   console.log("returned data:");
//       //   console.log(data);
//       // });
//       // socket.on('receiveDat', dat => this.handleIn(dat));
//       // this.socket.emit('testApp3', segments[2], (data) => {
//       //   console.log("returned 234 data:");
//       //   console.log(data);
//       // });

//       // socket.on('yoyo', (data) => {
//       //   console.log("yoyo returned");
//       //   console.log(data);
//       // });
//     // });
//     socket.on('yoyo', this.testFunc);
//     }

//     testFunc(data) {
//       console.log("yoyo returned!!");
//       console.log(data);
//     }

//     handleMove(data) {
//       //move a piece
//     }

//     handleClick(i) {
//         // alert(i);
//         if (this.state.rowsCount[i] >= 6 || this.state.gameOver) {
//             return;
//         }
//         console.log("new 2");

//         const tempData = {
//           inn: "asdf",
//           win: false,
//           gid: segments[2]
//         };

//         // this.socket.on('connect', () => {
//         socket.emit('testApp3', {'e': segments[2], 'd': 'asdf'}, () => {
//           console.log("returned 234 data:");
//           // console.log(data);
//         //   this.socket.on('yoyo', (dat) => {
//         //     console.log('yoyo returned');
//         //     console.log(dat);
//         //   });
//         });
//       // });
//         // this.socket.on('yoyo', (dat) => {
//         //   console.log('yoyo returned');
//         //   console.log(dat);
//         // });
//         // this.socket.on('receiveDat', dat => this.handleIn(dat));

//         // const pieces = this.state.pieces.slice();
//         // const rowsCount = this.state.rowsCount.slice();
//         // const row = pieces[i].slice();

//         // row[5 - rowsCount[i]] = this.state.redsMove ? 1 : 2;
//         // // console.log(pieces);
//         // rowsCount[i] = rowsCount[i] + 1;
//         // pieces[i] = row;

//         // const tempState = Object.assign({}, this.state);
//         // tempState.pieces = pieces;
//         // tempState.rowsCount = rowsCount;
//         // tempState.redsMove = !this.state.redsMove;
//         // tempState.row = i;
//         // const winResult = checkWin(tempState);
//         // console.log(winResult);
//         // let newStatus = this.state.redsMove ? "Yellow's turn" : "Red's turn";
//         // if (winResult.win) {
//         //     newStatus = winResult.text;
//         // }
//         // this.setState({
//         //     pieces: pieces,
//         //     redsMove: !this.state.redsMove,
//         //     rowsCount: rowsCount,
//         //     gameStatus: newStatus,
//         //     gameOver: winResult.win
//         // });

//     }

//     render() {
//         const rows = [];
//         for (let i = 0; i < 7; i++) {
//             rows.push(<BoardRow pInfo={this.state.pieces[i]} col={i} red={this.state.redsMove} onClick={() => this.handleClick(i)} key={i.toString()} id={i} />);
//         }
//         // const winRes = checkWin(this.state);
//         return (
//             <div className="row">
//                 <div className="col-12">
//                     <div className="row board">
//                         {rows}
//                     </div>
//                 </div>
//                 <div className="col-12">
//                     <div className="row">{this.state.gameStatus}</div>
//                     {/* <div className="row">{winRes.text}: {winRes.win.toString()}</div> */}
//                 </div>
//             </div>
//         );
//     }
// }

function StartBtn(props) {
    return (
        <div className="col-12 d-flex justify-content-center">
            <button onClick={props.onClick}>New Game</button>
        </div>
    );
}
class StartApp extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     redsMove: true,
        //     pieces: Array(7).fill(Array(6).fill(0)),
        // };
        this.state = {
            newGameId: ''
        };
        console.log(window.location.pathname);
        // this.createNewGame = this.createNewGame.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    componentDidMount() {
        socket.on('newGame', this.startGame);
        socket.on('yoyo', this.connectedApp);
    }

    connectedApp(data) {
        console.log("i have been connected");
        console.log(data);
    }

    startGame(data) {
        console.log("new game about to start");
        console.log(data);
        this.setState({ newGameId: data.room_id });
        // window.open("google.com", "_blank");
    }

    createNewGame() {
        console.log("lets create a game");
    }

    handleClick() {
        //
        console.log("create new game");
        const as = {
            t: "asdf",
        };

        // console.log(as);
        socket.emit('new game');
    }



    render() {

        return (
            <div className="content1 col-12 offset0 d-flex justify-content-center align-items-center">
                <div className="row">
                    <StartBtn onClick={this.handleClick} />
                    <div className="col-12 d-flex justify-content-center"><a href={"http://"+document.domain+":"+location.port+"/game/" + this.state.newGameId} target="_blank">{this.state.newGameId !== '' ? "http://"+document.domain+":"+location.port+"/game/"+this.state.newGameId : ''}</a></div>
                    <div className="col-12 d-flex justify-content-center">
                        {this.state.newGameId !== '' ? 'Use this link to invite a friend to play/watch' : ''}
                    </div>
                    
                </div>
            </div>
        );
    }
}

export default StartApp;