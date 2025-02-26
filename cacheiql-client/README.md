# @cacheiql/client

'@cacheiql/client is a lightweight client-side caching solution for GraphQL queries, designed to improve response times through local storage and request deduplication. By intercepting GraphQL requests, cacheiql checks the cache for stored responses and only fetches missing data from the server, minimizing redundant network requests. Its efficient key-value storage approach enables quick retrieval and cache updates while ensuring data consistency. CacheIQL seamlessly integrates with existing GraphQL clients, optimizing performance without requiring additional backend configuration.

@cacheiql/client is an npm package powered through  [OS Labs](https://github.com/oslabs-beta) , developed by [Vasean Annin](https://github.com/VaseanAnnin), [Gabriella Davoudpour
](https://github.com/gabyd613), [George German](https://github.com/GeorgeGerman29), [Pedram Kashani ](https://github.com/PedramKashani), and [Chris Matzen](https://github.com/matzec42).

## Installation

Install [cacheiql/client](https://www.npmjs.com/package/cacheiql-client) from npm using the terminal command: `npm i cacheiql-client` <br/>
@cacheiql/client will be added as a dependency to your package.json file.

## How It Works

<img width="962" alt="Screenshot 2025-02-25 at 6 47 03 PM" src="https://github.com/user-attachments/assets/e3d60385-a6c5-46af-9536-92021ecea3aa" />

**With Queries:**

cacheiql's client side functionality begins with the user invoking the custom 'cacheIt' fetch and caching function, passing in the query. cacheiql begins by interpreting the query, and checking for its existence in the cache. If it is not found, cacheiql makes the query to GraphQL, storing the query: response object as a key value pair in local storage. If the query is found in local storage, the prior step is omitted, and cacheiql grabs the response object associated with the query, returning it back to the user with an increased latency of over 1000%. 

**Image A** <br/>
![screenshot_2025-02-25_at_17 37 50_360](https://github.com/user-attachments/assets/23bba352-7865-4696-82cb-46fd1ab28b10) <br/> <br/>
**Image B** <br/>
![screenshot_2025-02-25_at_17 38 28](https://github.com/user-attachments/assets/7e8bd6c2-90d5-4abe-b29b-19144cc82e6f)

Here, we can see the difference in fetching speeds with the use of the native fetch API (image A) vs. cacheiql's caching feature (image B), an increase in response time from 728 ms to .8 ms.

**With Mutations:**

Through the use of introspection, cacheiql is able to extract the query name off of the AST to determine whether or not a mutation keyword is used. If so, cacheiql implements cache invalidation, removing the initial query: response object associated with the mutation within miliseconds, allowing the user to re-update the cache with the most up to date form of data avaliable.
