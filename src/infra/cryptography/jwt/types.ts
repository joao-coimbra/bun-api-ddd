export interface JwtSigner {
  sign: (payload: { sub: string }) => Promise<string>
}
