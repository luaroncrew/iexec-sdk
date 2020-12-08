const hostMap = {
  1: 'mainnet',
  5: 'goerli',
  133: 'https://viviani.iex.ec',
  134: 'https://bellecour.iex.ec',
};

const hubMap = {
  enterprise: {
    5: 'enterprise.v5.iexec.eth',
  },
};

const smsMap = {
  standard: {
    1: 'https://v5.sms.mainnet.iex.ec',
    5: 'https://v5.sms.goerli.iex.ec',
    133: 'https://v5.sms.viviani.iex.ec',
    134: 'https://v5.sms.bellecour.iex.ec',
  },
  enterprise: {
    1: 'https://v5.sms.mainnet.enterprise.iex.ec', // TODO update domain
    5: 'https://v5.sms.goerli.enterprise.iex.ec', // TODO update domain
  },
};

const resultProxyMap = {
  standard: {
    1: 'https://v5.result.mainnet.iex.ec',
    5: 'https://v5.result.goerli.iex.ec',
    133: 'https://v5.result.viviani.iex.ec',
    134: 'https://v5.result.bellecour.iex.ec',
  },
  enterprise: {
    1: 'https://v5.result.mainnet.enterprise.iex.ec', // TODO update domain
    5: 'https://v5.result.goerli.enterprise.iex.ec', // TODO update domain
  },
};

const bridgeMap = {
  standard: {
    1: {
      contract: '0x4e55c9B8953AB1957ad0A59D413631A66798c6a2',
      bridgedChainId: '134',
    },
    5: {
      contract: '0x1e32aFA55854B6c015D284E3ccA9aA5a463A1418',
      bridgedChainId: '133',
    },
    133: {
      contract: '0x63CBf84596d0Dc13fCE1d8FA4470dc208390998a',
      bridgedChainId: '5',
    },
    134: {
      contract: '0x188A4376a1D818bF2434972Eb34eFd57102a19b7',
      bridgedChainId: '1',
    },
  },
  enterprise: {},
};

const enterpriseEnabledMap = {
  5: true,
};

const ipfsGatewayMap = {};

const iexecGatewayMap = {
  standard: {
    default: 'https://v5.api.market.iex.ec',
  },
  enterprise: {
    default: 'https://v5.api.market.enterprise.iex.ec', // TODO update domain
  },
};

const getChainDefaults = ({ id, flavour }) => ({
  host: hostMap[id],
  hub: hubMap[flavour] && hubMap[flavour][id],
  sms: smsMap[flavour] && smsMap[flavour][id],
  resultProxy: resultProxyMap[flavour] && resultProxyMap[flavour][id],
  ipfsGateway:
    (ipfsGatewayMap[flavour]
      && (ipfsGatewayMap[flavour][id] || ipfsGatewayMap[flavour].default))
    || 'https://ipfs.iex.ec',
  iexecGateway:
    (iexecGatewayMap[flavour]
      && (iexecGatewayMap[flavour][id] || iexecGatewayMap[flavour].default))
    || 'https://v5.api.market.iex.ec',
  bridge: bridgeMap[flavour] && bridgeMap[flavour][id],
  flavour,
});

const isEnterpriseEnabled = (id) => !!enterpriseEnabledMap[id];

module.exports = {
  getChainDefaults,
  isEnterpriseEnabled,
};
