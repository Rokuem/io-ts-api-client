export function addPathToUrl(url: URL, ...additions: string[]) {
  for (const addition of additions) {
    url.pathname += '/' + addition;
  }

  url.pathname = url.pathname.replace(/\/\/+/gi, '/');
}
