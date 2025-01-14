const Debug = require('debug');
const fetch = require('cross-fetch');
const qs = require('query-string');
const { hashEIP712 } = require('./sig-utils');
const { wrapSignTypedData } = require('./errorWrappers');

const debug = Debug('iexec:api-utils');

const makeBody = (method, body) => {
  if (method === 'POST' || method === 'PUT') {
    if (typeof body === 'object') {
      return { body: JSON.stringify(body) };
    }
    return { body };
  }
  return {};
};

const makeQueryString = (method, queryParams) => {
  if (Object.keys(queryParams).length !== 0) {
    return '?'.concat(qs.stringify(queryParams));
  }
  return '';
};

const makeHeaders = (method, headers, body) => {
  const generatedHeaders = {};
  if (method === 'POST' || method === 'PUT') {
    generatedHeaders['Content-Type'] =
      typeof body === 'object' ? 'application/json' : 'text/plain';
  }
  return { headers: { ...generatedHeaders, ...headers } };
};

const httpRequest =
  (method) =>
  async ({ api, endpoint = '', query = {}, body = {}, headers = {} }) => {
    debug(
      'httpRequest()',
      '\nmethod',
      method,
      '\napi',
      api,
      '\nendpoint',
      endpoint,
      '\nquery',
      query,
      '\nbody',
      body,
      '\nheaders',
      headers,
    );
    const baseURL = new URL(endpoint, api).href;
    const queryString = makeQueryString(method, query);
    const url = baseURL.concat(queryString);
    const response = await fetch(url, {
      method,
      ...makeHeaders(method, headers, body),
      ...makeBody(method, body),
    }).catch((error) => {
      debug(`httpRequest() fetch:`, error);
      throw Error(`Connection to ${baseURL} failed with a network error`);
    });
    return response;
  };

const checkResponseOk = (response) => {
  if (!response.ok) {
    throw Error(
      `API call error: ${response.status} ${
        response.statusText ? response.statusText : ''
      }`,
    );
  }
  return response;
};

const responseToJson = async (response) => {
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    if (response.ok) {
      const json = await response.json();
      return json;
    }
    const errorMessage = await response
      .json()
      .then((json) => json && json.error)
      .catch(() => {});
    if (errorMessage) throw new Error(`API error: ${errorMessage}`);
    throw Error(
      `API error: ${response.status} ${
        response.statusText ? response.statusText : ''
      }`,
    );
  }
  if (!response.ok) {
    throw Error(
      `API error: ${response.status} ${
        response.statusText ? response.statusText : ''
      }`,
    );
  }
  throw new Error('The http response is not of JSON type');
};

const wrapPaginableRequest = (request) => async (args) =>
  request(args).then(({ nextPage, ...rest }) => ({
    ...rest,
    ...(nextPage && {
      more: () =>
        wrapPaginableRequest(request)({
          ...args,
          query: { ...args.query, page: nextPage },
        }),
    }),
  }));

const jsonApi = {
  get: (args) =>
    httpRequest('GET')({
      ...args,
      ...{ headers: { Accept: 'application/json', ...args.headers } },
    }).then(responseToJson),
  post: (args) =>
    httpRequest('POST')({
      ...args,
      ...{ headers: { Accept: 'application/json', ...args.headers } },
    }).then(responseToJson),
  put: (args) =>
    httpRequest('PUT')({
      ...args,
      ...{ headers: { Accept: 'application/json', ...args.headers } },
    }).then(responseToJson),
};

const downloadZipApi = {
  get: (args) =>
    httpRequest('GET')({
      ...args,
      ...{ headers: { Accept: 'application/zip', ...args.headers } },
    }).then(checkResponseOk),
  post: (args) =>
    httpRequest('POST')({
      ...args,
      ...{ headers: { Accept: 'application/zip', ...args.headers } },
    }).then(checkResponseOk),
};

const getAuthorization =
  (api, endpoint = '/challenge') =>
  async (chainId, address, signer) => {
    try {
      const challenge = await jsonApi.get({
        api,
        endpoint,
        query: {
          chainId,
          address,
        },
      });
      const typedData = challenge.data || challenge;
      const { domain, message } = typedData || {};
      const { EIP712Domain, ...types } = typedData.types || {};
      if (!domain || !types || !message) {
        throw Error('Unexpected challenge format');
      }
      const sign = await wrapSignTypedData(
        // use experiental ether Signer._signTypedData (to remove when signTypedData is included)
        // https://docs.ethers.io/v5/api/signer/#Signer-signTypedData
        /* eslint no-underscore-dangle: ["error", { "allow": ["_signTypedData"] }] */
        signer._signTypedData && typeof signer._signTypedData === 'function'
          ? signer._signTypedData(domain, types, message)
          : signer.signTypedData(domain, types, message),
      );
      const hash = hashEIP712(typedData);
      const separator = '_';
      const authorization = hash
        .concat(separator)
        .concat(sign)
        .concat(separator)
        .concat(address);
      return authorization;
    } catch (error) {
      debug('getAuthorization()', error);
      throw Error(`Failed to get authorization: ${error}`);
    }
  };

module.exports = {
  wrapPaginableRequest,
  httpRequest,
  jsonApi,
  downloadZipApi,
  getAuthorization,
};
