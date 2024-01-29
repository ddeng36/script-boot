const EventEmitter = require('node:events');
const eventEmitter = new EventEmitter();

// on() will trigger the event every time it is called
eventEmitter.on('event1', () => {
    console.log('event1 is triggered')
})

// once() will trigger the event only once
eventEmitter.once('event2', () => {
    console.log('event2 is triggered')

})

// emit() will trigger the event
eventEmitter.emit('event1');
eventEmitter.emit('event2');
eventEmitter.emit('event1');
eventEmitter.emit('event2');

// removeAllListeners() will remove all listeners of the event
eventEmitter.removeAllListeners();
eventEmitter.emit('event1');
eventEmitter.emit('event2');
