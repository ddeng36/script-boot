import { Value, Controller, Autowired, log } from "../src/script-boot";
import { SocketIo } from "../src/default/socket-io.class";
import { GetMapping } from "../src/route.decorate";

@Controller
export default class TestIo {

    @Value("view")
    public view: string;

    @SocketIo.onHandshake
    public handshake(socket, next) {
        log("handshake");
        log(socket.handshake.auth);
        next();
    }

    @SocketIo.onDisconnect
    public disconnet(socket, reason) {
        log(reason);
    }

    @SocketIo.onError
    public error(socket, err) {
        log(err.message);
    }

    @SocketIo.onEvent("test1") 
    public test1(socket, message) {
        log(message);
        log(SocketIo.getIoServer().sockets.emit("all", "test-from-server-all"));
        socket.emit("test1", "test-from-server-1");
    }

    @SocketIo.onEvent("test2") 
    public test2(socket, message) {
        log(message);
        log(SocketIo.getIoServer().sockets.emit("all", "test-from-server-all"));
        socket.emit("test2", "test-from-server-2");
    }

    @SocketIo.onEvent("test-error") 
    public testError(socket, message) {
        throw new Error("test-error");
    }

    @GetMapping("/socketIo")
    public socketIoPage(req, res) {
        res.render("socket");
    }
}