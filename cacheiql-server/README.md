# cacheiql-server

**cacheiql-server** is a middleware that is simple to implement, providing a server-side caching solution for GraphQL applications designed to enhance performance by reducing redundant query executions. It seamlessly integrates into your GraphQL server, caching queries and intelligently invalidating them after a mutation occurs, all while leveraging Redis to manage cache responses efficiently.


---

## Installation

###  Installing and Connecting a Redis Server

#### Redis Installation

- **Mac (Homebrew):**  
  1. Open your terminal and run:  
     ```bash
     brew install redis
     ```
  2. Start the Redis server with:  
     ```bash
     redis-server
     ```
  3. Note the port number where the Redis server is listening.

- **Linux or Non-Homebrew:**  
  1. Download the appropriate version of Redis from [redis.io/download](https://redis.io/download).  
  2. Follow the installation instructions provided for your system.  
  3. Start the Redis server and note the port number on which it is listening.



### Install CacheIQL-Server

Install the package by running **`npm i cacheiql-server`** in your terminal. This will add **`cacheiql-server`** as a dependency in your package.json file.


## Implementation

1. **Import CacheIQL-Server**

   Add the following import to your Node.js/Express file:

   - **CommonJS:**
     ```js
     const { cacheMiddleware } = require('cacheiql-server');
     ```
   - **ES6+:**
     ```js
     import { cacheMiddleware } from 'cacheiql-server';
     ```

2. **Instantiate Cache Middleware**

   Create an instance of `cacheMiddleware` for your GraphQL endpoint by passing in the following parameters:
   
   - `rootValue`: Your GraphQL resolvers.
   - `TTL_IN_SECONDS`: Number of seconds data should persist in the Redis cache.
   - `graphqlSchema`: The GraphQL schema defined using the `graphql-JS` library.

   Example:
   ```js
   const TTL_IN_SECONDS = 1000;
   const cachedRootValue = cacheMiddleware(rootValue, TTL_IN_SECONDS, graphqlSchema);
3. **Add Cache Middleware to Express Route**

Attach the `cachedRootValue` to the GraphQL route in your Express app like this:

```js
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: cachedRootValue,
    graphiql: true,
  })
);
```
This sets up the middleware to cache GraphQL query responses and invalidate them when a mutation occurs.

4. **Ensure Redis is Running**

Make sure Redis is installed and running on your machine.  
Start the server using:
```bash
redis-server
```
5. **Start the Server**

Run your Express server:
```bash
node index.js
```
Visit [http://localhost:3000/graphql](http://localhost:3000/graphql) to access GraphQL and start testing the caching behavior.

6. **Example Implementation**

Your Express server file should look something like this:

```js
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { cacheMiddleware } = require('cacheiql-server');
const graphqlSchema = require('./schema/schema');
const rootValue = require('./schema/resolvers');

const app = express();

const TTL_IN_SECONDS = 1000;
const cachedRootValue = cacheMiddleware(rootValue, TTL_IN_SECONDS, graphqlSchema);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: cachedRootValue,
    graphiql: true,
  })
);

app.listen(3000, () => console.log('listening on 3000'));
```
This sets up cacheMiddleware to cache query responses and intelligently invalidate them after mutations, enhancing the performance of your GraphQL application.
