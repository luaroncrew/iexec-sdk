const IExecModule = require('./IExecModule');
const { getAddress } = require('../common/wallet/address');
const { checkBalances } = require('../common/wallet/balance');
const { sendETH, sendRLC, sweep } = require('../common/wallet/send');
const {
  bridgeToMainchain,
  bridgeToSidechain,
  obsBridgeToMainchain,
  obsBridgeToSidechain,
} = require('../common/wallet/bridge');
const {
  wrapEnterpriseRLC,
  unwrapEnterpriseRLC,
} = require('../common/wallet/enterprise');

class IExecWalletModule extends IExecModule {
  constructor(...args) {
    super(...args);

    this.getAddress = async () =>
      getAddress(await this.config.resolveContractsClient());
    this.checkBalances = async (address) =>
      checkBalances(await this.config.resolveContractsClient(), address);
    this.checkBridgedBalances = async (address) =>
      checkBalances(await this.config.resolveBridgedContractsClient(), address);
    this.sendETH = async (weiAmount, to) =>
      sendETH(await this.config.resolveContractsClient(), weiAmount, to);
    this.sendRLC = async (nRlcAmount, to) =>
      sendRLC(await this.config.resolveContractsClient(), nRlcAmount, to);
    this.sweep = async (to) =>
      sweep(await this.config.resolveContractsClient(), to);
    this.bridgeToSidechain = async (nRlcAmount) =>
      bridgeToSidechain(
        await this.config.resolveContractsClient(),
        await this.config.resolveBridgeAddress(),
        nRlcAmount,
        {
          bridgedContracts: await this.config.resolveBridgedContractsClient(),
          sidechainBridgeAddress: await this.config.resolveBridgeBackAddress(),
        },
      );
    this.bridgeToMainchain = async (nRlcAmount) =>
      bridgeToMainchain(
        await this.config.resolveContractsClient(),
        await this.config.resolveBridgeAddress(),
        nRlcAmount,
        {
          bridgedContracts: await this.config.resolveBridgedContractsClient(),
          mainchainBridgeAddress: await this.config.resolveBridgeBackAddress(),
        },
      );
    this.obsBridgeToSidechain = async (nRlcAmount) =>
      obsBridgeToSidechain(
        await this.config.resolveContractsClient(),
        await this.config.resolveBridgeAddress(),
        nRlcAmount,
        {
          bridgedContracts: await this.config.resolveBridgedContractsClient(),
          sidechainBridgeAddress: await this.config.resolveBridgeBackAddress(),
        },
      );
    this.obsBridgeToMainchain = async (nRlcAmount) =>
      obsBridgeToMainchain(
        await this.config.resolveContractsClient(),
        await this.config.resolveBridgeAddress(),
        nRlcAmount,
        {
          bridgedContracts: await this.config.resolveBridgedContractsClient(),
          mainchainBridgeAddress: await this.config.resolveBridgeBackAddress(),
        },
      );
    this.wrapEnterpriseRLC = async (nRlcAmount) =>
      wrapEnterpriseRLC(
        await this.config.resolveStandardContractsClient(),
        await this.config.resolveEnterpriseContractsClient(),
        nRlcAmount,
      );
    this.unwrapEnterpriseRLC = async (nRlcAmount) =>
      unwrapEnterpriseRLC(
        await this.config.resolveEnterpriseContractsClient(),
        nRlcAmount,
      );
  }
}

module.exports = IExecWalletModule;
