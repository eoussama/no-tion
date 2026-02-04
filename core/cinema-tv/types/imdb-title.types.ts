export type TImdbTitle = {
  id: string
  type: string
  primaryTitle: string

  startYear?: number
  rating?: TImdbRating
  runtimeSeconds?: number
  primaryImage?: TImdbImage
}

type TImdbRating = {
  aggregateRating: number
  voteCount: number
}

type TImdbImage = {
  url: string
}
