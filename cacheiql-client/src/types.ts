export type ClientErrorType = {
  log: string;
  status: number;
  message: { err: string };
};

export type Query = string;

export type Mutation = string;

// define an interface for the various mutation types
export interface MutationTypeSpecifier {
  delete: string[];
  update: string[];
  create: string[];
}

export type mutationArray = {
  name: string;
  type: { name: string; kind: string };
};

export type queryArray = {
  name: string;
  type: {
    kind: string;
    name: null | string;
    ofType: { name: string };
  };
};

// mutationTypes must match setup of MutationTypeSpecifier
export const mutationTypes: MutationTypeSpecifier = {
  delete: ['delete', 'remove'],
  update: ['update', 'edit'],
  create: ['create', 'add', 'new', 'make'],
};

// 
export type cacheiqItType = {
  endpoint: string | URL;
  query?: Query;
  mutation?: Mutation;
  time?: number;
  variables?: Object;
};
