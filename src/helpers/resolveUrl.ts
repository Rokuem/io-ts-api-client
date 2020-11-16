export function addPathToUrl(url: URL, ...additions: string[]) {
  for (const addition of additions) {
    if (url.pathname.endsWith('/')) {
      if (addition.startsWith('/')) {
        url.pathname += '/' + addition;
      } else {
        url.pathname += addition;
      }
    } else {
      if (addition.startsWith('/')) {
        url.pathname += addition;
      } else {
        url.pathname += '/' + addition;
      }
    }
  }
}
