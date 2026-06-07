import { useCallback, useEffect, useRef, useState } from 'react';
import { unwrapApiData } from '../utils/admin';

const DEFAULT_DATA = {
    count: 0,
    next: null,
    previous: null,
    results: [],
};

export default function useAdminPaginatedQuery(fetcher, options = {}) {
    const { initialPage = 1, initialData = DEFAULT_DATA, immediate = true } = options;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(Boolean(immediate));
    const [error, setError] = useState(null);
    const mountedRef = useRef(false);

    const loadPage = useCallback(
        async (page = initialPage) => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetcher(page);
                const nextData = unwrapApiData(response) ?? DEFAULT_DATA;

                if (mountedRef.current) {
                    setData({
                        count: nextData.count ?? 0,
                        next: nextData.next ?? null,
                        previous: nextData.previous ?? null,
                        results: Array.isArray(nextData.results) ? nextData.results : [],
                    });
                    setCurrentPage(page);
                }

                return nextData;
            } catch (err) {
                if (mountedRef.current) {
                    setError(err);
                }
                throw err;
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                }
            }
        },
        [fetcher, initialPage],
    );

    useEffect(() => {
        mountedRef.current = true;

        if (immediate) {
            const fetchPage = async () => {
                await loadPage(initialPage);
            };

            void fetchPage();
        }

        return () => {
            mountedRef.current = false;
        };
    }, [immediate, initialPage, loadPage]);

    const goToPage = useCallback(
        async (page) => {
            if (page === currentPage || loading) {
                return;
            }

            return loadPage(page);
        },
        [currentPage, loading, loadPage],
    );

    return {
        data,
        loading,
        error,
        currentPage,
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: data.results,
        reload: () => loadPage(currentPage),
        goToPage,
    };
}
