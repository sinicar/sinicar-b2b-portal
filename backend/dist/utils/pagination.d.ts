export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare function parsePaginationParams(query: Record<string, any>): PaginationParams;
export declare function createPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
//# sourceMappingURL=pagination.d.ts.map