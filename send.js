var amqp = require("amqplib/callback_api");

amqp.connect(
  "amqps://xhvmtemw:wv7SvO0M_6pC28ICXh5JqrkmAKyj4-XJ@gull.rmq.cloudamqp.com/xhvmtemw",
  function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = "hello";
      var msg = "Hello world";
      var deadLetterQ = "deadLetterQ";

      channel.assertExchange("deadLetterEx", "fanout");
      channel.assertQueue(deadLetterQ, {
        durable: true,
      });

      channel.bindQueue(deadLetterQ, "deadLetterEx");

      channel.assertQueue(queue, {
        durable: false,
        deadLetterExchange: "deadLetterEx",
        maxLength: 1,
      });

      channel.sendToQueue(queue, Buffer.from(msg), {
        // expiration: 5000,
      });
      console.log(" [x] Sent %s", msg);
    });

    setTimeout(function () {
      connection.close();
      process.exit(0);
    }, 500);
  }
);
