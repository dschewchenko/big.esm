import type * as declarations from "./dist/index.js" with { "resolution-mode": "import" };

declare const api: typeof declarations;
declare namespace api {
  type Big = declarations.Big;
  type BigPipe = declarations.BigPipe;
  type BigPipeline = declarations.BigPipeline;
  type BigValue = declarations.BigValue;
  type CompareResult = declarations.CompareResult;
  type PossibleNumber = declarations.PossibleNumber;
  type RoundingMode = declarations.RoundingMode;
}

export = api;
