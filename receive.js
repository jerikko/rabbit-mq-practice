var amqp = require('amqplib/callback_api');


amqp.connect('amqps://xhvmtemw:wv7SvO0M_6pC28ICXh5JqrkmAKyj4-XJ@gull.rmq.cloudamqp.com/xhvmtemw', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'test';

    // ASSERTING 2nd DEAD LETTER EXCHANGE AND QUEUE
    channel.assertExchange('DLX2', 'fanout');
    channel.assertQueue('DLQ2', { durable: true });
    channel.bindQueue('DLQ2', 'DLX2');

    // ASSERTING 1st DEAD LETTER EXCHANGE AND QUEUE
    channel.assertExchange('DLX1', 'fanout');
    channel.assertQueue('DLQ1', {
      durable: true,
      deadLetterExchange: 'DLX2',
      maxLength: 1,
    });
    channel.bindQueue('DLQ1', 'DLX1');

    // ASSERTING PRIMARY QUEUE
    channel.assertQueue(queue, {
      durable: false,
      deadLetterExchange: 'DLX1',
      maxLength: 1,
    });
    
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    // CONSUMING MESSAGES

    // channel.consume(queue, function(msg) {
    //   console.log(" [x] Received %s", msg.content.toString());
    // }, {
    //     noAck: true
    //   });

    // channel.consume(
    //   'DLQ1',
    //   function (msg) {
    //     console.log(" DEAD LETTER [x] Received %s", msg.content.toString());
    //     console.log(msg.properties.headers["x-death"]);
    //   },
    //   {
    //     noAck: true,
    //   }
    // );

    channel.consume(
      'DLQ2',
      function (msg) {
        console.log(" 2nd [x] Received %s", msg.content.toString());
        console.log(msg.properties.headers["x-death"]);
      },
      {
        noAck: true,
      }
    );
  });
});
