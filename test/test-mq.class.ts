import { RabbitMQ, RabbitListener } from "../src/default/rabbitmq.class";
import { GetMapping } from "../src/route.decorate";
import { Autowired, Controller, log } from "../src/script-boot";
import { connect } from "amqplib";
@Controller
export default class TestMq {

    @Autowired
    private rabbitMQ: RabbitMQ;

    @RabbitListener("myqueues")
    public async listen(message) {
        log(" [x] Received by Decorator'%s'", message.content.toString());
    }

    @GetMapping("/mq/sendByMQClass")
    async sendByMQClass() {
        await this.rabbitMQ.send("myqueues", "hello world by MQ class");
    }

    @GetMapping("/mq/sendByQueue")
    async sendMq() {
        const queue = 'myqueues';
        const text = 'hello world';
        const connection = await connect('amqp://localhost:5672');
        const channel = await connection.createChannel();
        await channel.checkQueue(queue);
        channel.sendToQueue(queue, Buffer.from(text));
        log(" [x] Sent %s", text);
        await channel.close();
        return "Send success";
    }

    @GetMapping("/mq/sendByExchange")
    async sendMq2() {
        const exchange = 'myexchanges';
        const text = "hello world, by exchange";
        const connection = await connect('amqp://localhost:5672');
        const channel = await connection.createChannel();
        await channel.checkExchange(exchange);
        channel.publish(exchange, '', Buffer.from(text));
        log(" [x] Publish by exchange '%s'", text);
        await channel.close();
        return "sent by exchange";
    }
    
    @GetMapping("/mq/listen")
    async testMq() {
        const connection = await connect('amqp://localhost:5672');
        const channel = await connection.createChannel();
        const queue = 'myqueues';
        const queue2 = 'myqueues2';
        await channel.checkQueue(queue);
        await channel.checkQueue(queue2);
        await channel.consume(queue, (message) => {
            log(" [x] Received queue1'%s'", message.content.toString());
        }, { noAck: true });
        await channel.consume(queue2, (message) => {
            log(" [x] Received queue2 '%s'", message.content.toString());
        }, { noAck: true });
        return "ok";
    }
}