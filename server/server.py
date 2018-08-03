# server.py
from flask import Flask, render_template, jsonify, json, request
from flask_socketio import SocketIO, join_room, leave_room
# from pprint import pprint
import json

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")
app.config['SECRET_KEY'] = 'asdf'
socketio = SocketIO(app)

room_boards = {}
room_players = {}
sid_mapper = {}
room_counter = 0

@app.route("/")
def index():
    # return render_template("index.html")
    return render_template("start.html")

@socketio.on('connect')
def myConnec():
    print("a user has connected: "+request.sid)

@socketio.on('disconnect')
def myDis():
    # print("user disconnected: "+request.sid)
    if(request.sid not in sid_mapper):
        print("SHOULDN'T BE HERE")
        return
    room_id = sid_mapper[request.sid]
    #remove sid from room_players
    for key, value in room_players[room_id].iteritems():
        if (value['sid'] == request.sid):
            print("THIS IS THE COLOR THAT NEEDS TO BE REMOVED")
            room_players[room_id][key] = {'sid': '', 'name': ''}
    del(sid_mapper[request.sid])
    returnData = {'yellow': '', 'red': ''}
    returnData['yellow'] = room_players[room_id]['yellow']['name']
    returnData['red'] = room_players[room_id]['red']['name']
    socketio.emit('removeUser', {'players': returnData}, room=room_id)

@socketio.on('addPlayer')
def addPlayer(data):
    # print("add player to room")
    addPersonToRoom(data, request.sid)
    returnData = {'players': {'yellow': '', 'red': ''}}
    returnData['players']['yellow'] = room_players[data['gid']]['yellow']['name']
    returnData['players']['red'] = room_players[data['gid']]['red']['name']
    socketio.emit('playerAdded', {'player': str(data['name']), 'players': returnData['players'], 'color': data['color']}, room=str(data['gid']))
    socketio.emit('setPlayerColor', {'color': data['color']}, room=request.sid)

def addPersonToRoom(data, sid):
    # print("add a person to the game room")
    if (data['gid'] not in room_players):
        room_players[data['gid']] = {'yellow': {'sid': '', 'name': ''}, 'red': {'sid': '', 'name': ''}}# {'sid': sid, 'name': data['name']}
    room_players[data['gid']][data['color']] = {'sid': sid, 'name': data['name']}

@socketio.on('makeMove')
def makeMove(data):
    if(data['gameOver'] == True):
        return
    room_boards[data['gid']] = data
    gameWon = checkWin(data)
    socketio.emit('moveMade', {'won': gameWon, 'pieces': room_boards[data['gid']]['pieces'], 'roomInfo': room_boards[data['gid']]}, room=data['gid'])

def checkWin(data):
    if(checkCol(data) or checkRow(data) or checkDiag(data)):
        #there was a win
        winner = "Red"
        if(data['redsMove']):
            winner = "Yellow"
        room_boards[data['gid']]['gameOver'] = True
        room_boards[data['gid']]['gameStatus'] = winner+" Won!"
        return True
    nextPlayer = "Red's"
    if(not data['redsMove']):
        nextPlayer = "Yellow's"
    room_boards[data['gid']]['gameStatus'] = nextPlayer+" turn"
    return False

def checkCol(data):
    #check column for a winner
    row = data['column']
    pieces = data['pieces']
    lastPiece = data['rowsCount'][row]
    lastPlayer = pieces[row][6-lastPiece]
    if(lastPiece >= 4):
        for i in range(1,4):
            if(lastPlayer != pieces[row][6-lastPiece+i]):
                # print("NOT A WINNER")
                return False
        # print("WINNER")
        return True
    return False

def checkRow(data):
    #check row for a win
    row = data['column']
    pieceNum = data['rowsCount'][row]
    lastPlayer = data['pieces'][row][6-pieceNum]

    #check the row linearly
    consecutivePieceCount = 1
    lastPiece = data['pieces'][0][6-pieceNum]
    for i in range(1,7):
        if(lastPiece == data['pieces'][i][6-pieceNum] and lastPiece != 0):
            consecutivePieceCount += 1
            if(consecutivePieceCount >= 4):
                # print("row winner")
                return True
        else:
            consecutivePieceCount = 1
            lastPiece = data['pieces'][i][6-pieceNum]
    return False

def checkDiag(data):
    #check diaganal for a win
    col = data['column']
    row = 6-data['rowsCount'][col]
    lastPiece = data['pieces'][col][row]
    consecutivePieceCount = 1
    #move down and to the left
    for x in range(1,4):
        if((col-x < 0) or (row-x < 0)):
            break
        if(lastPiece == data['pieces'][col-x][row-x] and data['pieces'][col-x][row-x] != 0):
            consecutivePieceCount += 1
            if(consecutivePieceCount >= 4):
                # print("diag win1")
                return True
        else:
            break
    #move up and to the right
    for x in range(1,4):
        if((col+x > 6) or (row+x > 5)):
            break
        if(lastPiece == data['pieces'][col+x][row+x] and data['pieces'][col+x][row+x] != 0):
            consecutivePieceCount += 1
            if(consecutivePieceCount >= 4):
                # print("diag win2")
                return True
        else:
            break
    
    #reset
    consecutivePieceCount = 1
    #move up and to the left
    for x in range(1,4):
        if((col-x < 0) or (row+x > 5)):
            break
        if(lastPiece == data['pieces'][col-x][row+x] and data['pieces'][col-x][row+x] != 0):
            consecutivePieceCount += 1
            if(consecutivePieceCount >= 4):
                # print("diag win3")
                return True
        else:
            break
        
    #move down and to the right
    for x in range(1,4):
        if((col+x > 6) or (row-x < 0)):
            break
        if(lastPiece == data['pieces'][col+x][row-x]):
            consecutivePieceCount += 1
            if(consecutivePieceCount >= 4):
                # print("diag win4")
                return True
    return False

@app.route("/game/<gid>")
def main(gid):
    # print("the game id is: "+gid)
    socketio.emit('joinGame', room=gid)
    if (gid not in room_players):
        room_players[gid] = {'yellow': {'sid': '', 'name': ''}, 'red': {'sid': '', 'name': ''}}
    data = {'gid': str(gid), 'players': {'yellow': '', 'red': ''}}
    if gid in room_boards:
        # print("the game is already beeing played")
        data['board'] = room_boards[gid]['pieces']
        data['redsMove'] = room_boards[gid]['redsMove']
        data['rowsCount'] = room_boards[gid]['rowsCount']
        data['gameOver'] = room_boards[gid]['gameOver']
        data['gameStatus'] = room_boards[gid]['gameStatus']
    else:
        # print("this is a new game")
        tempBoard = []
        for y in range(7):
            tempArr = []
            for x in range(6):
                tempArr.append(0)
            tempBoard.append(tempArr)
        data['board'] = tempBoard
        data['redsMove'] = True
        data['rowsCount'] = [0,0,0,0,0,0,0]
        data['gameOver'] = False
        data['gameStatus'] = 'Enter player name'
    # print(room_players)
    if gid in room_players:
        data["player_cnt"] = 5
        data['players']['yellow'] = room_players[gid]['yellow']['name']
        data['players']['red'] = room_players[gid]['red']['name']
    else:
        # print("there are no players yet")
        data["player_cnt"] = 0
    return render_template("game.html", gInfo = data)

@socketio.on('join')
def joinMe(d):
    # print("joining room "+d['gid'])
    join_room(d['gid'])
    sid_mapper[request.sid] = d['gid']
    socketio.emit('joined', {'joined': 'true'})

@socketio.on('leave')
def leaveMe(d):
    print("leaving room")


@socketio.on('new game')
def createGame():
    global room_counter
    room_counter = room_counter + 1
    print("room: "+str(room_counter))
    socketio.emit('newGame', {"room_id":room_counter}, room=request.sid)

@app.route("/start")
def mainStart():
    # print("start screen")
    return render_template("start.html")

if __name__ == "__main__":
  #app.run()
  socketio.run(app)
