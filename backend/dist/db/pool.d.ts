import { Pool } from "pg";
export declare const db: {
    query: {
        <T extends import("pg").Submittable>(queryStream: T): T;
        <R extends any[] = any[], I = any[]>(queryConfig: import("pg").QueryArrayConfig<I>, values?: import("pg").QueryConfigValues<I>): Promise<import("pg").QueryArrayResult<R>>;
        <R extends import("pg").QueryResultRow = any, I = any[]>(queryConfig: import("pg").QueryConfig<I>): Promise<import("pg").QueryResult<R>>;
        <R extends import("pg").QueryResultRow = any, I = any[]>(queryTextOrConfig: string | import("pg").QueryConfig<I>, values?: import("pg").QueryConfigValues<I>): Promise<import("pg").QueryResult<R>>;
        <R extends any[] = any[], I = any[]>(queryConfig: import("pg").QueryArrayConfig<I>, callback: (err: Error, result: import("pg").QueryArrayResult<R>) => void): void;
        <R extends import("pg").QueryResultRow = any, I = any[]>(queryTextOrConfig: string | import("pg").QueryConfig<I>, callback: (err: Error, result: import("pg").QueryResult<R>) => void): void;
        <R extends import("pg").QueryResultRow = any, I = any[]>(queryText: string, values: import("pg").QueryConfigValues<I>, callback: (err: Error, result: import("pg").QueryResult<R>) => void): void;
    };
    pool: Pool;
};
//# sourceMappingURL=pool.d.ts.map