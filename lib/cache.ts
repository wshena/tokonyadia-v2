export const CATALOG_REVALIDATE_SECONDS = 300
export const SEARCH_REVALIDATE_SECONDS = 180
export const RANDOM_REVALIDATE_SECONDS = 60

export const publicCacheHeaders = (seconds: number) => ({
  'Cache-Control': `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`,
})

export const noStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
}
