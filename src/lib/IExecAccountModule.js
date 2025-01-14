const IExecModule = require('./IExecModule');
const { checkBalance } = require('../common/account/balance');
const { deposit, withdraw } = require('../common/account/fund');

class IExecAccountModule extends IExecModule {
  constructor(...args) {
    super(...args);
    this.checkBalance = async (address) =>
      checkBalance(await this.config.resolveContractsClient(), address);
    this.checkBridgedBalance = async (address) =>
      checkBalance(await this.config.resolveBridgedContractsClient(), address);
    this.deposit = async (nRlcAmount) =>
      deposit(await this.config.resolveContractsClient(), nRlcAmount);
    this.withdraw = async (nRlcAmount) =>
      withdraw(await this.config.resolveContractsClient(), nRlcAmount);
  }
}

module.exports = IExecAccountModule;
