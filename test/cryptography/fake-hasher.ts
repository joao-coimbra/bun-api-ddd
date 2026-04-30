import type { HashComparer } from "@/domain/identity/application/cryptography/hash-comparer"
import type { HashGenerator } from "@/domain/identity/application/cryptography/hash-generator"

export class FakeHasher implements HashGenerator, HashComparer {
  hash(plain: string): Promise<string> {
    return Promise.resolve(plain.concat("-hashed"))
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return Promise.resolve(plain.concat("-hashed") === hash)
  }
}
