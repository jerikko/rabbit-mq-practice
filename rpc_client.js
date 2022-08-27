var amqp = require("amqplib/callback_api");

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1);
}

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

      channel.assertExchange("DeadLetterExchange", "direct", {
        durable: true,
      });

      channel.assertQueue("DeadLetterQueue");

      channel.bindQueue("DeadLetterQueue", "DeadLetterExchange");

      channel.assertQueue(
        "aliveLetter",
        {
          exclusive: true,
          deadLetterExchange: "DeadLetterExchange",
        },
        function (error2, q) {
          if (error2) {
            throw error2;
          }
          var correlationId = generateUuid();
          var num = parseInt(args[0]);

          console.log(" [x] Requesting fib(%d)", num);

          channel.consume(
            q.queue,
            function (msg) {
              if (msg.properties.correlationId == correlationId) {
                console.log(" [.] Got %s", msg.content.toString());
                setTimeout(function () {
                  connection.close();
                  process.exit(0);
                }, 500);
              }
            },
            {
              noAck: true,
            }
          );
          console.log("does this work?");
          channel.sendToQueue("rpc_queue", Buffer.from(num.toString()), {
            correlationId: correlationId,
            replyTo: q.queue,
            expiration: 10000,
          });
        }
      );
    });
  }
);

function generateUuid() {
  return (
    Math.random().toString() +
    Math.random().toString() +
    Math.random().toString()
  );
}

// var amqp = require("amqplib");
// var url =
//   "amqps://xhvmtemw:wv7SvO0M_6pC28ICXh5JqrkmAKyj4-XJ@gull.rmq.cloudamqp.com/xhvmtemw";

// amqp
//   .connect(url)
//   .then(function (conn) {
//     //Subscribe to the WorkQueue in WorkExchange to which the "delayed" messages get dead-letter'ed (is that a verb?) to.
//     return conn.createChannel().then(function (ch) {
//       return ch
//         .assertExchange("WorkExchange", "direct")
//         .then(function () {
//           return ch.assertQueue("WorkQueue", {
//             autoDelete: false,
//             durable: true,
//           });
//         })
//         .then(function () {
//           return ch.bindQueue("WorkQueue", "WorkExchange", "rk1");
//         })
//         .then(function () {
//           console.log("Waiting for consume.");

//           return ch.consume("WorkQueue", function (msg) {
//             console.log("Received message in workQueue.");
//             console.log(msg.content.toString());
//             ch.ack(msg);
//           });
//         });
//     });
//   })
//   .then(function () {
//     //Now send a test message to DeadExchange to DEQ queue.
//     return amqp
//       .connect(url)
//       .then(function (conn) {
//         return conn.createChannel();
//       })
//       .then(function (ch) {
//         return ch
//           .assertExchange("DeadExchange", "direct")
//           .then(function () {
//             return ch.assertQueue("DEQ", {
//               arguments: {
//                 "x-dead-letter-exchange": "WorkExchange",
//                 "x-dead-letter-routing-key": "rk1",
//                 "x-message-ttl": 1000,
//                 "x-expires": 100000,
//               },
//             });
//           })
//           .then(function () {
//             return ch.bindQueue("DEQ", "DeadExchange", "");
//           })
//           .then(function () {
//             console.log("Sending delayed message");

//             return ch.publish(
//               "DeadExchange",
//               "",
//               new Buffer("Over the Hills and Far Away!")
//             );
//           });
//       });
//   })
//   .then(null, function (error) {
//     console.log("error'ed");
//     console.log(error);
//     console.log(error.stack);
//   });
