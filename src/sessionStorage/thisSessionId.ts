export function setThisSessionId(thisSessionId: string): void {
  sessionStorage.setItem('thisSessionId', thisSessionId);
}

export function getThisSessionId(): string|null {
  return sessionStorage.getItem('thisSessionId');
}

export function removeThisSessionId(): void {
  sessionStorage.removeItem('thisSessionId');
}
