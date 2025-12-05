"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationParams = parsePaginationParams;
exports.createPaginatedResult = createPaginatedResult;
function parsePaginationParams(query) {
    return {
        page: Math.max(1, parseInt(query.page) || 1),
        limit: Math.min(100, Math.max(1, parseInt(query.limit) || 20)),
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
    };
}
function createPaginatedResult(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}
//# sourceMappingURL=pagination.js.map