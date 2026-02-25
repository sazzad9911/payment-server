"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const user_1 = require("./events/user");
let io;
const setupSocket = (server) => {
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Replace with your frontend URL in production
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);
        // Attach individual event modules
        (0, user_1.userEvents)(socket, io);
        //otpEvents(socket, io);
    });
};
exports.setupSocket = setupSocket;
