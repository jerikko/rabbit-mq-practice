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
      let deadLetterQ = "deadLetterQ";

      channel.assertQueue(deadLetterQ, {
        durable: true,
      });

      channel.assertQueue(
        queue,
        {
          durable: false,
          deadLetterExchange: "deadLetterEx",
          maxLength: 1,
        },
        function (error2, q) {
          if (error2) {
            throw error2;
          }
          console.log(q);
        }
      );
      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        queue
      );
      channel.consume(
        queue,
        function (msg) {
          console.log(" [x] Received %s", msg.content.toString());
          // console.log(" [x] Received %s");
          console.log(msg);
        },
        {
          noAck: true,
        }
      );
      channel.consume(
        deadLetterQ,
        function (msg) {
          console.log(" DEAD LETTER [x] Received %s", msg.content.toString());
          console.log(msg.properties.headers["x-death"]);
        },
        {
          noAck: true,
        }
      );
    });
  }
);
