const Debug = require('debug');
const fetch = require('cross-fetch');
const BN = require('bn.js');
const { ethersBnToBn, bnToEthersBn } = require('./utils');

const debug = Debug('iexec:wallet');

const ethFaucets = [
  {
    chainName: 'ropsten',
    name: 'faucet.ropsten.be',
    getETH: address => fetch(`http://faucet.ropsten.be:3001/donate/${address}`)
      .then(res => res.json())
      .catch(() => ({ error: 'ETH faucet is down.' })),
  },
  {
    chainName: 'ropsten',
    name: 'ropsten.faucet.b9lab.com',
    getETH: address => fetch('https://ropsten.faucet.b9lab.com/tap', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ toWhom: address }),
    })
      .then(res => res.json())
      .catch(() => ({ error: 'ETH faucet is down.' })),
  },
  {
    chainName: 'rinkeby',
    name: 'faucet.rinkeby.io',
    getETH: () => ({
      error: 'Go to https://faucet.rinkeby.io/ to manually ask for ETH',
    }),
  },
  {
    chainName: 'kovan',
    name: 'gitter.im/kovan-testnet/faucet',
    getETH: () => ({
      error:
        'Go to https://gitter.im/kovan-testnet/faucet to manually ask for ETH',
    }),
  },
];

const checkBalances = async (contracts, address) => {
  const rlcAddress = await contracts.fetchRLCAddress();
  const getETH = () => contracts.eth.getBalance(address).catch((error) => {
    debug(error);
    return 0;
  });
  const getRLC = () => contracts
    .getRLCContract({
      at: rlcAddress,
    })
    .balanceOf(address)
    .catch((error) => {
      debug(error);
      return 0;
    });

  const [weiBalance, rlcBalance] = await Promise.all([getETH(), getRLC()]);
  const balances = {
    wei: ethersBnToBn(weiBalance),
    nRLC: ethersBnToBn(rlcBalance),
  };
  debug('balances', balances);
  return balances;
};

const getETH = async (chainName, account) => {
  const filteredFaucets = ethFaucets.filter(e => e.chainName === chainName);
  const faucetsResponses = await Promise.all(
    filteredFaucets.map(faucet => faucet.getETH(account)),
  );
  const responses = filteredFaucets.reduce((accu, curr, index) => {
    accu.push(
      Object.assign(
        {
          name: curr.name,
        },
        { response: faucetsResponses[index] },
      ),
    );
    return accu;
  }, []);
  return responses;
};

const rlcFaucets = [
  {
    name: 'faucet.iex.ec',
    getRLC: (chainName, address) => fetch(
      `https://api.faucet.iex.ec/getRLC?chainName=${chainName}&address=${address}`,
    ).then(res => res.json()),
  },
];

const getRLC = async (chainName, account) => {
  const faucetsResponses = await Promise.all(
    rlcFaucets.map(faucet => faucet.getRLC(chainName, account)),
  );
  const responses = rlcFaucets.reduce((accu, curr, index) => {
    accu.push(
      Object.assign(
        {
          name: curr.name,
        },
        { response: faucetsResponses[index] },
      ),
    );
    return accu;
  }, []);
  return responses;
};

const sendETH = async (contracts, value, from, to) => {
  const tx = await contracts.ethSigner.sendTransaction({
    data: '0x',
    to,
    value,
  });

  const txReceipt = await tx.wait();
  debug('txReceipt:', txReceipt);

  return txReceipt;
};

const sendRLC = async (contracts, amount, to) => {
  const rlcAddress = await contracts.fetchRLCAddress();
  debug('rlcAddress', rlcAddress);

  const rlcContract = contracts.getRLCContract({ at: rlcAddress });

  const tx = await rlcContract.transfer(to, amount);
  const txReceipt = await tx.wait();
  debug('txReceipt', txReceipt);

  return txReceipt;
};

const sweep = async (contracts, address, to) => {
  const balances = await checkBalances(contracts, address);

  if (balances.nRLC.gt(new BN(0))) {
    await sendRLC(contracts, bnToEthersBn(balances.nRLC), to);
  }

  const txFee = new BN('10000000000000000');
  debug('txFee.toString()', txFee.toString());
  debug('balances.wei.toString()', balances.wei.toString());
  debug('balances.wei.gt(txFee)', balances.wei.gt(txFee));

  const sweepETH = balances.wei.sub(txFee);
  debug('sweepETH.toString()', sweepETH.toString());
  if (balances.wei.gt(new BN(txFee))) {
    await sendETH(contracts, bnToEthersBn(sweepETH), address, to);
  }
  return true;
};

module.exports = {
  checkBalances,
  getETH,
  getRLC,
  sendETH,
  sendRLC,
  sweep,
};
