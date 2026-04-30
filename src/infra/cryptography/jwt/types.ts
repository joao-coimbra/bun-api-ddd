import type { EncrypterPayload } from "@/domain/identity/application/cryptography/encrypter"

export interface JwtSigner {
  sign: (payload: EncrypterPayload) => Promise<string>
}

export interface JwtService {
  accessToken: JwtSigner
  refreshToken: JwtSigner
}
