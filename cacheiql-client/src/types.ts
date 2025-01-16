export type ClientErrorType = {
  log: string;
  status: number;
  message: { err: string };
};

export type Query =
  | {
      query: string;
    }
  | string;

  // define an interface for the various mutation types
export interface MutationTypeSpecifier {
  delete: string[];
  update: string[];
  create: string[];
}

// mutationTypes must match setup of MutationTypeSpecifier
export const mutationTypes: MutationTypeSpecifier = {
  delete: ['delete', 'remove'],
  update: ['update', 'edit'],
  create: ['create', 'add', 'new', 'make'],
};

