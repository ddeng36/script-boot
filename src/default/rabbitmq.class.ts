import { Bean, config, log } from "../script-boot";
import { connect } from "amqplib";

let rabbitConnection = null;

class RabbitMQ {
    @Bean
    public getRabbitMQ(): RabbitMQ {
        if (!config("rabbitmq")) {
            return null;
        }
        return new RabbitMQ();
    }

    public async publishMessageToExchange(exchange: string, routingKey: string, message: string): Promise<void> {
        const channel = await getChannel();
        await channel.checkExchange(exchange);
        channel.publish(exchange, routingKey, Buffer.from(message));
        await channel.close();
    }

    public async sendMessageToQueue(queue: string, message: string): Promise<void> {
        const channel = await getChannel();
        await channel.checkQueue(queue);
        channel.sendToQueue(queue, Buffer.from(message));
        log(" [x] Sent by MQ Class%s", message);
        await channel.close();
    }

    public async publish(exchange: string, routingKey: string, message: string): Promise<void> {
        await this.publishMessageToExchange(exchange, routingKey, message);
    }

    public async send(queue: string, message: string): Promise<void> {
        await this.sendMessageToQueue(queue, message);
    }

}

async function getChannel() {
    // Singleton
    if (rabbitConnection === null) {
        rabbitConnection = await connect(config("rabbitmq"));
        process.once('SIGINT', async () => {
            await rabbitConnection.close();
        })
    }
    const channel = await rabbitConnection.createChannel();
    return channel;
}

function RabbitListener(queue: string) {
    return (target: any, propertyKey: string) => {
        (async function () {
            const channel = await getChannel();
            await channel.checkQueue(queue);
            await channel.consume(queue, target[propertyKey], { noAck: true });
        })();
    }
}

export { RabbitMQ, RabbitListener }