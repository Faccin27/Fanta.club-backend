const app = require('./app');

const start = async () => {
  try {
    await app.listen({ port: 3535 });
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();