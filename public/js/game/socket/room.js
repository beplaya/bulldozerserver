function Room(id) {
    this.id = id;
    this.playerNumber;

    this.setPlayerNumber = function(playerNumber) {
        this.playerNumber = playerNumber;
    }

    this.getPlayerNumber = function() {
        return this.playerNumber;
    }

    Room.JSON {
        id : "roomId",
        playerNumber : "playerNumber"
    }
}
