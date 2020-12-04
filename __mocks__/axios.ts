export const mockedAxios = {
  create: () => mockedAxios,
  nextResponse: {},
  request: () => Promise.resolve(mockedAxios.nextResponse),
};

export default mockedAxios;
