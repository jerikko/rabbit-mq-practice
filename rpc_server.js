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
      var queue = "rpc_queue";
      channel.assertExchange("DeadLetterExchange", "direct", {
        durable: true,
      });

      channel.assertQueue("DeadLetterQueue");

      channel.bindQueue("DeadLetterQueue", "DeadLetterExchange");
      channel.assertQueue(queue, {
        durable: false,
        // deadLetterExchange: "DeadLetterExchange",
        // messageTtl: 1000,
        // deadLetterRoutingKey: "DeadLetterQueue",
        // 'x-dead-letter-routing-key': 'dead letter exchange key'
      });
      channel.prefetch(1);
      console.log(" [x] Awaiting RPC requests");
      channel.consume(queue, function reply(msg) {
        var n = parseInt(msg.content.toString());

        console.log(" [.] fib(%d)", n);

        var r = fibonacci(n);

        channel.sendToQueue(msg.properties.replyTo, Buffer.from(r.toString()), {
          correlationId: msg.properties.correlationId,
        });

        channel.ack(msg);
      });
    });
  }
);

function fibonacci(n) {
  if (n == 0 || n == 1) return n;
  else return fibonacci(n - 1) + fibonacci(n - 2);
}
