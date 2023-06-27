var amqp = require('amqplib/callback_api');

amqp.connect('amqps://vymscxik:W5MfsidhcnUgEYw69jok5o4dI0_Bir0c@gull.rmq.cloudamqp.com/vymscxik', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'sign-up';
    var msg = 'Hello world';

    const OSPExchange = 'RabbitTracks-DLExchange'

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

    channel.sendToQueue(queue, Buffer.from(msg), {
      contentType: 'text',
      contentEncoding: 'gzip',
      priority: 1,
      correlationId: 'test',
      replyTo: queue,
      expiration: 50000,
      messageId: Math.random().toString(),
      timestamp: Date.now(),
      type: 'update',
      userId: 'vymscxik',
      appId: 'rabbit-mq-practice',
      clusterId: 'cloudamqp'
    });
    console.log(' [x] Sent %s', msg);
  });

  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
});
