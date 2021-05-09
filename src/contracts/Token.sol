// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Token is ERC20, ERC20Burnable, AccessControl {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  constructor() payable ERC20("Decentralized Bank Currency", "DBC") {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(MINTER_ROLE, msg.sender);
  }

  function passMinterRole(address dBank) public returns (bool) {
    require(hasRole(MINTER_ROLE, msg.sender), 'Error, only minter can pass role');
    grantRole(MINTER_ROLE, dBank);
    renounceRole(MINTER_ROLE, msg.sender);

    return true;
  }

  function mint(address account, uint256 amount) public {
    //check if msg.sender have minter role
    require(hasRole(MINTER_ROLE, msg.sender), 'Error, only minter can mint tokens');
    _mint(account, amount);
	}
}