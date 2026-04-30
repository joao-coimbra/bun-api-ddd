import type {
  Encrypter,
  EncrypterPayload,
} from "@/domain/identity/application/cryptography/encrypter"
import type { JwtSigner } from "./types"

export class JwtEncrypter implements Encrypter {
  constructor(private readonly jwt: JwtSigner) {}

  encrypt(payload: EncrypterPayload): Promise<string> {
    return this.jwt.sign(payload)
  }
}
