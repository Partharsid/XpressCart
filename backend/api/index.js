require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const connectDB = require('../src/utils/db');
const typeDefs = require('../src/schema/types');
const resolvers = require('../src/resolvers/index');
const { authMiddleware } = require('../src/middleware/auth');

let isConnected = false;
const schema = makeExecutableSchema({ typeDefs, resolvers });
let apolloServer = null;

async function getServer() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  if (!apolloServer) {
    apolloServer = new ApolloServer({ schema });
    await apolloServer.start();
  }
  return apolloServer;
}

const app = express();
app.use(cors());
app.use(express.json());

app.use('/graphql', async (req, res, next) => {
  try {
    const server = await getServer();
    const handler = expressMiddleware(server, {
      context: async ({ req }) => authMiddleware({ req }),
    });
    return handler(req, res, next);
  } catch (err) {
    next(err);
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'XpressCart API is running', graphql: '/graphql' });
});

// Local dev only
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  getServer().then(() => {
    app.listen(PORT, () => {
      console.log(`XpressCart API ready at http://localhost:${PORT}/graphql`);
    });
  }).catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
}

module.exports = app;
