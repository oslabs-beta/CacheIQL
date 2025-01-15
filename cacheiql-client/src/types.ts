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
