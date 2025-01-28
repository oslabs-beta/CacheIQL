// imports --- TBD

// function to handle mutation change update query/response
// potentially add parameters of query etc
// export const mutationHandler = (mutationType: string, mutationInfo: string) => {
  // if (localStorage.hasOwnProperty(mutationInfo)) {
  // }
    // add checker to see if query type is a mutation
//     try {
//       // parse query using graphql-tag feature (makes an AST)
//       const parsedQuery: DocumentNode = gql`
//         ${query}
//       `;
//       // check if mutation is present in parsed query
//       // check if any of the objects in definitions array has a mutation, return true if so (some method returns a boolean)
//       const containsMutation: boolean = parsedQuery.definitions.some(
//         (definition) =>
//           definition.kind === 'OperationDefinition' &&
//           definition.operation === 'mutation'
//       );
  
//       // logic for checking what mutation is occurring and getting mutation type
//       if (containsMutation) {
//         // parse query to extract name
//         let mutationName: string | null = null;
//         // traverse through AST using graphql's visit function
//         visit(parsedQuery, {
//           // this should be invoked whenever the visit function encounters an operation defintion node
//           // here, we create operation defintion key with associated method which is operationdefinition(node)
//           OperationDefinition(node) {
//             // if the node is a mutation and the value of the name property in node is defined
//             if (node.operation === 'mutation' && node.name) {
//               // set mutationName to the value of the name key in the node
//               mutationName = node.name.value;
//             }
//           },
//         });
//         // target first keyword in typeofmutation to determine type
//         // check to see what type of mutation
//         // invoke respective handler function
//         if (mutationName !== null) {
//           // let mutationString: string | null = null;
//           // go through mutationTypes object and store all keys as strings in an array
//           const arrayOfMutationTypes: Array<string> = Object.keys(mutationTypes);
//           // store first element in arrayOfMutationTypes that includes the action (CUD operation string)
//           const mutationAction: string = arrayOfMutationTypes.find((action) =>
//             // find value of action key in mutationTypes
//             // see which value is included in the mutationName we took from mutation query
//             mutationTypes[action as keyof MutationTypeSpecifier].some(
//               (type: string) => mutationName?.includes(type)
//             )
//           ) as keyof MutationTypeSpecifier;
  
//           if (mutationAction) {
//             mutationHandler(mutationAction, queryString);
//           }
//         } else {
//           console.log('mutation action type not found!');
//           return 'mutation action type not found!';
//         }
//       }
//     } catch (err) {
//       if (err instanceof Error) {
//         console.log(`${err}, Something went wrong when checking for mutations!`);
//         return createClientError(err.message);
//       }
//     }
// };