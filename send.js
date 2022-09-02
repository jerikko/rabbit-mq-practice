var amqp = require('amqplib/callback_api');

amqp.connect('amqps://xhvmtemw:wv7SvO0M_6pC28ICXh5JqrkmAKyj4-XJ@gull.rmq.cloudamqp.com/xhvmtemw', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'test';
    var msg = 'Hello world';

    const OSPExchange = 'OSP-DLExchange'

    // ASSERTING 2nd DEAD LETTER EXCHANGE AND QUEUE
    channel.assertExchange(OSPExchange, 'fanout');
    channel.assertQueue('DLQ2', { durable: true });
    channel.bindQueue('DLQ2', OSPExchange);

    // ASSERTING 1st DEAD LETTER EXCHANGE AND QUEUE
    channel.assertExchange('DLX1', 'fanout');
    channel.assertQueue('DLQ1', {
      durable: true,
      deadLetterExchange: OSPExchange,
      maxLength: 1,
    });
    channel.bindQueue('DLQ1', 'DLX1');

    // ASSERTING PRIMARY QUEUE
    channel.assertQueue(queue, {
      durable: false,
      deadLetterExchange: 'DLX1',
      maxLength: 1,
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(' [x] Sent %s', msg);
  });

  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
});
