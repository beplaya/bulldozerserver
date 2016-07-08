package com.gjames.socketio.demo;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;

import java.util.*;

public class Room {

    private String roomId;
    private int size;
    private Map<Integer, String> players;

    public Room(String roomId, int size) {
        this.roomId = roomId;
        this.size = size;
        this.players = new HashMap<Integer, String>();
        for (int i = 0; i < size; i++) {
            this.players.put(i, "");
        }
    }

    public String getRoomId() {
        return roomId;
    }

    public boolean containsPlayer(String playerId) {
        for (int i = 0; i < size; i++) {
            if (players.get(i).equals(playerId))
                return true;
        }
        return false;
    }

    public void sendEventToParticipants(SocketIOClient socketIOClient,
                                        SocketIOServer server,
                                        String eventString,
                                        String data) {
        for (int i = 0; i < size; i++) {
            Iterator<SocketIOClient> iterator = server.getAllClients().iterator();
            while (iterator.hasNext()) {
                SocketIOClient client = iterator.next();
                String playerId = client.getSessionId().toString();
                String senderPlayerId = socketIOClient.getSessionId().toString();
                if (playerId.equals(players.get(i))
                        && !playerId.equals(senderPlayerId)) {
                    client.sendEvent(eventString, data);
                }
            }
        }
    }

    public boolean isEmpty() {
        for (int i = 0; i < size; i++) {
            if (!isPlayerSlotEmptyByIndex(i)) {
                return false;
            }
        }
        return true;
    }

    public RoomJoin joinRoom(String playerId) {
        if (!isFull()) {
            for (int i = 0; i < size; i++) {
                if (isPlayerSlotEmptyByIndex(i)) {
                    players.put(i, playerId);
                    return new RoomJoin(roomId, i);
                }
            }
        }
        return null;
    }

    public void leaveRoom(String playerId) {
        for (int i = 0; i < size; i++) {
            if (players.get(i).equals(playerId)) {
                players.put(i, "");
            }
        }
    }

    private boolean isPlayerSlotEmptyByIndex(int i) {
        return players.get(i) == null || players.get(i).isEmpty();
    }

    public boolean hasPlayers() {
        return !isEmpty();
    }

    public boolean isFull() {
        for (int i = 0; i < size; i++) {
            if (isPlayerSlotEmptyByIndex(i)) {
                return false;
            }
        }
        return true;
    }

    public boolean isNotFull() {
        return !isFull();
    }

    public void onReceivedBallPosition(String sessionId, String ballPosition) {
    }

    public void onReceivedPlayerPosition(String sessionId, String ballPosition) {
    }

    public void notifyClientsRoomIsFull(SocketIOServer server) {
        for (int i = 0; i < size; i++) {
            Iterator<SocketIOClient> iterator = server.getAllClients().iterator();
            while (iterator.hasNext()) {
                SocketIOClient client = iterator.next();
                String playerId = client.getSessionId().toString();
                if (playerId.equals(players.get(i))) {
                    long currentTime = Calendar.getInstance().getTimeInMillis();
                    int delay = 3000;
                    client.sendEvent("GAME_ROOM_FILLED", currentTime + "," + delay);
                }
            }
        }
    }

    public static class RoomJoin {
        public final String roomId;
        public final int playerNumber;

        public RoomJoin(String roomId, int playerNumber) {
            this.roomId = roomId;
            this.playerNumber = playerNumber;
        }
    }
}
