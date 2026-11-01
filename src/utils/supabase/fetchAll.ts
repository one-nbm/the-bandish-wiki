/**
 * Utility to fetch all rows from Supabase, overcoming PostgREST's default 1,000-row limit.
 *
 * It fetches the first page of 1,000 rows while requesting the exact total count,
 * then retrieves any remaining pages concurrently in parallel via Promise.all.
 */
export async function fetchAllBandishes<T = any>(
  buildQuery: (from: number, to: number, countExact?: boolean) => any
): Promise<T[]> {
  const PAGE_SIZE = 1000;

  try {
    // 1. Fetch first chunk + total count in a single request
    const { data: firstPage, count, error } = await buildQuery(0, PAGE_SIZE - 1, true);

    if (error) {
      console.error("Error fetching first page in fetchAllBandishes:", error);
      return (firstPage as T[]) || [];
    }

    let allData: T[] = [...((firstPage as T[]) || [])];
    const total = count ?? allData.length;

    // 2. Fetch remaining pages in parallel if table exceeds 1,000 rows
    if (total > PAGE_SIZE) {
      const remainingQueries = [];
      for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) {
        const to = Math.min(from + PAGE_SIZE - 1, total - 1);
        remainingQueries.push(buildQuery(from, to, false));
      }

      const results = await Promise.all(remainingQueries);
      for (const res of results) {
        if (res.error) {
          console.error("Error fetching chunk in fetchAllBandishes:", res.error);
        }
        if (res.data) {
          allData = allData.concat(res.data as T[]);
        }
      }
    }

    return allData;
  } catch (err) {
    console.error("Unexpected error in fetchAllBandishes:", err);
    return [];
  }
}
