import type { HashComparer } from "@/domain/identity/application/cryptography/hash-comparer"
import type { HashGenerator } from "@/domain/identity/application/cryptography/hash-generator"

export class BunHasher implements HashGenerator, HashComparer {
  hash(plain: string): Promise<string> {
    return Bun.password.hash(plain)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return Bun.password.verify(plain, hash)
  }
}
