/**
 * Wait for a time in ms, ex: wait(2000).then(()=>)
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
