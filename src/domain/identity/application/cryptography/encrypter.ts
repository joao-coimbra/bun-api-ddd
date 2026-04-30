export interface EncrypterPayload {
  sub: string
}

export interface Encrypter {
  encrypt(payload: EncrypterPayload): Promise<string>
}
