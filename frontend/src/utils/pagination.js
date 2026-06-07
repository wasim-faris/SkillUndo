export function paginateData(data, currentPage, pageSize) {
    if (!Array.isArray(data) || pageSize <= 0) {
        return [];
    }

    const page = Math.max(1, currentPage);
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
}
