package com.gjames.socketio.demo;

import com.corundumstudio.socketio.*;
import com.corundumstudio.socketio.listener.*;

import java.util.*;

public class ChatLauncher {
    public static final int MAX_ROOM_SIZE = 2;
    private static Map<String, List<UUID>> rooms = new HashMap<String, List<UUID>>();

    public static void main(String[] args) throws InterruptedException {
        Configuration config = new Configuration();
        SocketConfig sockConfig = new SocketConfig();
        sockConfig.setReuseAddress(true);
        config.setSocketConfig(sockConfig);
        config.setOrigin("*");
//        config.setHostname("192.168.1.69");
        config.setHostname("10.206.4.56");
        config.setPort(8080);
        for (int i = 0; i < 1000; i++) {
            rooms.put("room" + i, new ArrayList<UUID>());
        }
        final SocketIOServer server = new SocketIOServer(config);

        server.addEventListener("SEND_BALL_VECTOR_POSITION", String.class, new DataListener<String>() {
            @Override
            public void onData(SocketIOClient socketIOClient, String ballRecVectorPosition, AckRequest ackRequest) throws Exception {
                sendEventToClientsInSameRoom(socketIOClient, ballRecVectorPosition, "REC_BALL_VECTOR_POSITION", server);
            }
        });

        server.addEventListener("SEND_VECTOR_POSITION", String.class, new DataListener<String>() {
            @Override
            public void onData(SocketIOClient socketIOClient, String recVectorPosition, AckRequest ackRequest) throws Exception {
                sendEventToClientsInSameRoom(socketIOClient, recVectorPosition, "REC_VECTOR_POSITION", server);
            }
        });

        server.addConnectListener(new ConnectListener() {
            @Override
            public void onConnect(final SocketIOClient socketIOClient) {
                log("@@@@@@@@@ Client connected! @@@@@@@@@");
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        RoomJoin roomJoin = assignToRoom(socketIOClient);
                        socketIOClient.sendEvent("JOINED_ROOM", "{roomId:" + roomJoin.roomId
                                + ", playerNumber: " + roomJoin.playerNumber + "}");
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
                        removeFromRoom(socketIOClient.getSessionId());
                    }
                }).start();
            }
        });
        server.start();

        Thread.sleep(Integer.MAX_VALUE);

        server.stop();
    }

    private static void removeFromRoom(UUID sessionId) {
        Set<String> roomKeys = rooms.keySet();
        for (String rk : roomKeys) {
            int roomSize = rooms.get(rk).size();
            for (int i = 0; i < roomSize; i++) {
                if (rooms.get(rk).get(i).equals(sessionId)) {
                    rooms.get(rk).remove(i);
                    removeFromRoom(sessionId);
                    return;
                }
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
                String roomKey = findRoomForUUID(socketIOClient.getSessionId());
                List<UUID> clientIds = rooms.get(roomKey);
                Iterator<SocketIOClient> iterator = server.getAllClients().iterator();
                for (UUID uuid : clientIds) {
                    SocketIOClient client = iterator.next();
                    if (client.getSessionId().equals(uuid)
                            && !client.getSessionId().equals(socketIOClient.getSessionId())) {
                        client.sendEvent(eventString, data);
                    }
                }
            }
        }).start();
    }

    private static void log(String s) {
        System.out.println(s);
    }

    private static String findRoomForUUID(UUID sessionId) {
        Set<String> roomKeys = rooms.keySet();
        for (String rk : roomKeys) {
            List<UUID> uuids = rooms.get(rk);
            for (UUID uid : uuids) {
                if (uid.equals(sessionId)) {
                    return rk;
                }
            }
        }
        return null;
    }

    private static RoomJoin assignToRoom(SocketIOClient socketIOClient) {
        Set<String> roomKeys = rooms.keySet();
        for (String rk : roomKeys) {
            if (rooms.get(rk).size() > 0) {
                if (!rooms.get(rk).contains(socketIOClient.getSessionId())) {
                    rooms.get(rk).add(socketIOClient.getSessionId());
                    return new RoomJoin(rk, (rooms.get(rk).size() - 1));
                }
            }
        }
        for (String rk : roomKeys) {
            if (rooms.get(rk).size() < MAX_ROOM_SIZE) {
                if (!rooms.get(rk).contains(socketIOClient.getSessionId())) {
                    rooms.get(rk).add(socketIOClient.getSessionId());
                    return new RoomJoin(rk, (rooms.get(rk).size() - 1));
                }
            }
        }
        return null;
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
