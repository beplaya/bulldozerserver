package com.gjames.socketio.demo;

import com.corundumstudio.socketio.*;
import com.corundumstudio.socketio.listener.*;

import java.util.*;

public class ChatLauncher {
    public static final int MAX_ROOM_SIZE = 2;
    public static final int NUM_ROOMS = 20;
    //    private static Map<String, List<UUID>> rooms = new HashMap<String, List<UUID>>();
    private static List<Room> rooms = new ArrayList<Room>();
    private static SocketIOServer server;

    public static void main(String[] args) throws InterruptedException {
        Configuration config = new Configuration();
        SocketConfig sockConfig = new SocketConfig();
        sockConfig.setReuseAddress(true);
        config.setSocketConfig(sockConfig);
        //config.setHostname("192.168.1.69");
        config.setHostname("10.206.4.56");
        config.setPort(9092);
        for (int i = 0; i < NUM_ROOMS; i++) {
            rooms.add(new Room("room" + i, MAX_ROOM_SIZE));
        }
        server = new SocketIOServer(config);

        server.addEventListener("SEND_BALL_VECTOR_POSITION", String.class, new DataListener<String>() {
            @Override
            public void onData(SocketIOClient socketIOClient, String ballRecVectorPosition, AckRequest ackRequest) throws Exception {
                sendEventToClientsInSameRoom(socketIOClient, ballRecVectorPosition, "REC_BALL_VECTOR_POSITION", server);
                Room room = findRoomForUUID(socketIOClient.getSessionId().toString());
                if (room != null) {
                    room.onReceivedBallPosition(socketIOClient.getSessionId().toString(), ballRecVectorPosition);
                    checkForWinner(room);
                }
            }
        });

        server.addEventListener("SEND_VECTOR_POSITION", String.class, new DataListener<String>() {
            @Override
            public void onData(SocketIOClient socketIOClient, String recVectorPosition, AckRequest ackRequest) throws Exception {
                sendEventToClientsInSameRoom(socketIOClient, recVectorPosition, "REC_VECTOR_POSITION", server);
                Room room = findRoomForUUID(socketIOClient.getSessionId().toString());
                if (room != null) {
                    room.onReceivedPlayerPosition(socketIOClient.getSessionId().toString(), recVectorPosition);
                    checkForWinner(room);
                }
            }
        });

        server.addConnectListener(new ConnectListener() {
            @Override
            public void onConnect(final SocketIOClient socketIOClient) {
                log("@@@@@@@@@ Client connected! @@@@@@@@@");
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        Room.RoomJoin roomJoin = assignToRoom(socketIOClient);
                        socketIOClient.sendEvent("JOINED_ROOM", "{\"roomId\":\"" + roomJoin.roomId
                                + "\", \"playerNumber\": \"" + roomJoin.playerNumber + "\"}");
                    }
                }).start();
            }
        });
        server.addDisconnectListener(new DisconnectListener() {
            @Override
            public void onDisconnect(final SocketIOClient socketIOClient) {
                log("%%%%%%%%%%%%% Client DISCONNECTED! %%%%%%%%%%%%%");
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        removeFromRoom(socketIOClient.getSessionId().toString());
                    }
                }).start();
            }
        });
        server.start();

        Thread.sleep(Integer.MAX_VALUE);

        server.stop();
    }

    private static void checkForWinner(Room room) {
        //TODO

    }

    private static void removeFromRoom(String playerId) {
        for (Room room : rooms) {
            if (room.containsPlayer(playerId)) {
                room.leaveRoom(playerId);
            }
        }
    }

    private static void sendEventToClientsInSameRoom(final SocketIOClient socketIOClient,
                                                     final String data,
                                                     final String eventString,
                                                     final SocketIOServer server) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                String roomKey = findRoomIdForUUID(socketIOClient.getSessionId().toString());
                for (Room room : rooms) {
                    if (room.getRoomId().equals(roomKey)) {
                        room.sendEventToParticipants(socketIOClient, server, eventString, data);
                    }
                }

            }
        }).start();
    }

    public static void log(String s) {
        System.out.println(s);
    }

    private static Room findRoomForUUID(String playerId) {
        for (Room room : rooms) {
            if (room.containsPlayer(playerId)) {
                return room;
            }
        }
        return null;
    }

    private static String findRoomIdForUUID(String playerId) {
        for (Room room : rooms) {
            if (room.containsPlayer(playerId)) {
                return room.getRoomId();
            }
        }
        return null;
    }

    private static Room.RoomJoin assignToRoom(SocketIOClient socketIOClient) {
        String playerId = socketIOClient.getSessionId().toString();

        for (Room room : rooms) {
            if (room.hasPlayers() && room.isNotFull()) {
                if (!room.containsPlayer(playerId)) {
                    Room.RoomJoin roomJoin = room.joinRoom(playerId);

                    if (roomJoin != null) {
                        //logRoom(room);
                        if (room.isFull()) {
                            room.notifyClientsRoomIsFull(server);
                        }
                        return roomJoin;
                    }
                }
            }
        }
        for (Room room : rooms) {

            if (room.isNotFull()) {
                if (!room.containsPlayer(playerId)) {
                    Room.RoomJoin roomJoin = room.joinRoom(playerId);
                    if (roomJoin != null) {
                        //logRoom(room);
                        return roomJoin;
                    }
                }
            }
        }
        return null;
    }

    private static void logRoom(Room room) {
        log(":room.getRoomId()"
                + " |  room.isNotFull()"
                + " |  room.hasPlayers()"
                + " |  room.isEmpty()"
                + " |  room.isNotFull()");
        log(":" + room.getRoomId()
                + " | " + room.isNotFull()
                + " | " + room.hasPlayers()
                + " | " + room.isEmpty()
                + " | " + room.isNotFull());
    }

}
