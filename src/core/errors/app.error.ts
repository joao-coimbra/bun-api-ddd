export abstract class AppError extends Error {
  abstract readonly status: number

  toResponse() {
    return Response.json(
      { error: this.message, code: this.status },
      { status: this.status }
    )
  }
}
