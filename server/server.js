const express = require('express');
const db = require('./config/connection');
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth')
const path = require('path');

const { typeDefs, resolvers } = require('./schemas');

const startServer = async () => {
  // creates new apollo server and passes in schema data
  const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: authMiddleware
  });

  // start apollo server
  await server.start();

  // integrate apollo server with express application as middleware
  server.applyMiddleware({ app });

  // logs where we can test GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`)
};

// initialize apollo server
startServer();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
