// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract dBank {
  Token private token;

  //add mappings
  mapping(address => uint) public depositStart;
  mapping(address => uint) public etherBalanceOf;

  //add events
  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event Withdraw(address indexed user, uint etherAmount, uint depositTime, uint interest);
  
  //pass as constructor argument deployed Token contract
  constructor(Token _token) {
    token = _token;
  }
  
  function deposit() payable public {
    require(etherBalanceOf[msg.sender] == 0, 'Error, deposit already active');
    require(msg.value>=1e16, 'Error, deposit must be >= 0.01 ETH');

    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
    depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;

    emit Deposit(msg.sender, msg.value, block.timestamp);
  }

  function withdraw() public {
    require(etherBalanceOf[msg.sender]>0, 'Error, no previous deposit');
    uint userBalance = etherBalanceOf[msg.sender]; //for event

    //check user's hodl time
    uint depositTime = block.timestamp - depositStart[msg.sender];

    //31668017 - interest(10% APY) per second for min. deposit amount (0.01 ETH), cuz:
    //1e15(10% of 0.01 ETH) / 31577600 (seconds in 365.25 days)

    //(etherBalanceOf[msg.sender] / 1e16) - calc. how much higher interest will be (based on deposit), e.g.:
    //for min. deposit (0.01 ETH), (etherBalanceOf[msg.sender] / 1e16) = 1 (the same, 31668017/s)
    //for deposit 0.02 ETH, (etherBalanceOf[msg.sender] / 1e16) = 2 (doubled, (2*31668017)/s)
    uint interestPerSecond = 31668017 * (etherBalanceOf[msg.sender] / 1e16);
    uint interest = interestPerSecond * depositTime;

    //send funds to user
    token.transfer(msg.sender, etherBalanceOf[msg.sender]); //eth back to user
    token.mint(msg.sender, interest); //interest to user

    //reset depositer data
    depositStart[msg.sender] = 0;
    etherBalanceOf[msg.sender] = 0;

    emit Withdraw(msg.sender, userBalance, depositTime, interest);
  }
}