// ----------------------------------------------------------------------

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  } else {
    return `Unknown error: ${error}`;
  }
}
