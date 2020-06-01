const hostMap = {
  1: 'https://mainnet.infura.io/v3/f3e0664e01504f5ab2b4360853ce0dc7',
  5: 'https://goerli.infura.io/v3/f3e0664e01504f5ab2b4360853ce0dc7',
  133: 'https://viviani.iex.ec',
  134: 'https://bellecour.iex.ec',
};

const smsMap = {
  1: 'https://mainnet-sms.iex.ec',
  5: 'https://goerli-sms.iex.ec',
  133: 'https://viviani-sms.iex.ec',
  134: 'https://bellecour-sms.iex.ec',
};

const resultProxyMap = {
  1: 'https://mainnet-result-proxy.iex.ec',
  5: 'https://goerli-result-proxy.ec',
  133: 'https://viviani-result-proxy.iex.ec',
  134: 'https://bellecour-result-proxy.iex.ec',
};

const bridgeMap = {
  1: {
    contract: '0x4e55c9B8953AB1957ad0A59D413631A66798c6a2',
    bridgedNetworkId: '134',
  },
  5: {
    contract: '0x1e32aFA55854B6c015D284E3ccA9aA5a463A1418',
    bridgedNetworkId: '133',
  },
  133: {
    contract: '0x63CBf84596d0Dc13fCE1d8FA4470dc208390998a',
    bridgedNetworkId: '5',
  },
  134: {
    contract: '0x188A4376a1D818bF2434972Eb34eFd57102a19b7',
    bridgedNetworkId: '1',
  },
};

const ipfsGatewayMap = {};

const iexecGatewayMap = {};

const getChainDefaults = chainId => ({
  host: hostMap[chainId],
  sms: smsMap[chainId],
  resultProxy: resultProxyMap[chainId],
  ipfsGateway: ipfsGatewayMap[chainId] || 'https://ipfs.iex.ec',
  iexecGateway: iexecGatewayMap[chainId] || 'https://gateway.iex.ec',
  bridge: bridgeMap[chainId],
});

module.exports = {
  getChainDefaults,
};
