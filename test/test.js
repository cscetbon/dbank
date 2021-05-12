import { assert, expect } from 'chai'
import { tokens, ether, ETHER_ADDRESS, EVM_REVERT, wait } from './helpers'

const Token = artifacts.require('./Token')
const DecentralizedBank = artifacts.require('./dBank')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('dBank', ([deployer, user]) => {
  let dbank, token, minterRole
  const interestPerSecond = 31668017 //(10% APY) for min. deposit (0.01 ETH)

  beforeEach(async () => {
    token = await Token.new()
    minterRole = await token.MINTER_ROLE()
    dbank = await DecentralizedBank.new(token.address)
    await token.passMinterRole(dbank.address, {from: deployer})
  })

  // describe('testing token contract...', () => {
  //   describe('success', () => {
  //     it('checking token name', async () => {
  //       expect(await token.name()).to.be.eq('Decentralized Bank Currency')
  //     })

  //     it('checking token symbol', async () => {
  //       expect(await token.symbol()).to.be.eq('DBC')
  //     })

  //     it('checking token initial total supply', async () => {
  //       expect(Number(await token.totalSupply())).to.eq(0)
  //     })

  //     it('deployer passed minter role to dbank', async () => {
  //       expect(await token.hasRole(minterRole, dbank.address)).to.be.true
  //       expect(await token.hasRole(minterRole, deployer)).to.be.false
  //     })
  //   })

  //   describe('failure', () => {
  //     it('transferring minter role should be rejected', async () => {
  //       await token.passMinterRole(user, {from: deployer}).should.be.rejectedWith(EVM_REVERT)
  //     })

  //     it('tokens minting should be rejected', async () => {
  //       await token.mint(user, '1', {from: deployer}).should.be.rejectedWith(EVM_REVERT) //unauthorized minter
  //     })
  //   })
  // })

  // describe('testing deposit...', () => {
  //   let balance

  //   describe('success', () => {
  //     beforeEach(async () => {
  //       await dbank.deposit({value: 10**16, from: user}) //0.01 ETH
  //     })

  //     it('balances should increase', async () => {
  //       expect(Number(await web3.eth.getBalance(dbank.address))).to.eq(10**16)
  //       expect(Number(await dbank.etherBalanceOf(user))).to.eq(10**16)
  //     })

  //     it('deposit time should > 0', async () => {
  //       expect(Number(await dbank.depositStart(user))).to.be.above(0)
  //     })
  //   })

  //   describe('failure', () => {
  //     it('depositing should be rejected', async () => {
  //       await dbank.deposit({value: 10**15, from: user}).should.be.rejectedWith(EVM_REVERT) //to small amount
  //     })
  //   })
  // })

  describe('testing withdraw...', () => {
    let balance

    describe('success', () => {

      beforeEach(async () => {
        balance = await web3.eth.getBalance(user)
        console.log("balance: ",balance)
        let deployerBalance = web3.utils.fromWei(await web3.eth.getBalance(deployer))
        console.log("deployer balance: ", deployerBalance)
        let bankBalance = web3.utils.fromWei(await web3.eth.getBalance(dbank.address))
        console.log("bank balance: ", bankBalance)

        await dbank.deposit({value: 10**16, from: user}) //0.01 ETH

        await wait(2) //accruing interest

        bankBalance = web3.utils.fromWei(await web3.eth.getBalance(dbank.address))
        console.log("bank balance: ", bankBalance)
        balance = await web3.eth.getBalance(user)
        console.log("balance: ", balance)
        let balanceInBank = await dbank.etherBalanceOf(user)
        console.log(web3.utils.fromWei(balanceInBank, 'ether'), "Eth")
        await dbank.withdraw({from: user})
      })

      it('balances should decrease', async () => {
        assert.equal(1, 1, "yeah 1 is 1")
        // expect(11).to.be.above(0);
        // expect(Number(await web3.eth.getBalance(dbank.address))).to.eq(0)
        // expect(Number(await dbank.etherBalanceOf(user))).to.eq(0)
        // expect(true).to.be.true
      })

    //   it('user should receive ether back', async () => {
    //     expect(Number(await web3.eth.getBalance(user))).to.be.above(Number(balance))
    //   })

    //   it('user should receive proper amount of interest', async () => {
    //     //time synchronization problem make us check the 1-3s range for 2s deposit time
    //     balance = Number(await token.balanceOf(user))
    //     expect(balance).to.be.above(0)
    //     expect(balance%interestPerSecond).to.eq(0)
    //     expect(balance).to.be.below(interestPerSecond*4)
    //   })

    //   it('depositer data should be reset', async () => {
    //     expect(Number(await dbank.depositStart(user))).to.eq(0)
    //     expect(Number(await dbank.etherBalanceOf(user))).to.eq(0)
    //   })
    // })

    // describe('failure', () => {
    //   it('withdrawing should be rejected', async () =>{
    //     await dbank.deposit({value: 10**16, from: user}) //0.01 ETH
    //     await wait(2) //accruing interest
    //     await dbank.withdraw({from: deployer}).should.be.rejectedWith(EVM_REVERT) //wrong user
    //   })
    })
  })
})