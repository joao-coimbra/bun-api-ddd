import type {
  Encrypter,
  EncrypterPayload,
} from "@/domain/identity/application/cryptography/encrypter"

export class FakeEncrypter implements Encrypter {
  encrypt(payload: EncrypterPayload): Promise<string> {
    return Promise.resolve(JSON.stringify(payload))
  }
}
