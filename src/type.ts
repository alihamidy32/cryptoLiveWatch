export interface CryptoPair{
  id:number
  name:string
  symbol:string
  logo:string
  price:number
  liquidity:number
  rank:number
  price_change_24h:number
  price_change_1h:number
  price_change_7d:number
}

export interface CryptoWatch{
  e: "kline"
  E: number
  s: string
  k: KWatch
}

export interface KWatch{
  t: number
  T: number
  s: string
  i: string
  f: number
  L: number
  o: string
  c: string
  h: string
  l: string
  v: string
  n: number
  x: boolean
  q: string
  V: string
  Q: string
  B: string
  name:string
  id:number
}



