// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EthaLink
 * @dev Hackathon-friendly contract for locking and distributing Ether
 */
contract EthaLink {
    address public host;
    
    event FundsLocked(address sender, uint256 amount);
    event FundsDistributed(address recipient, uint256 amount);
    
    modifier onlyHost() {
        require(msg.sender == host, "Only host can call this");
        _;
    }
    
    constructor() {
        host = msg.sender;
    }
    
    // Lock funds by sending Ether to this function - anyone can call
    function lockFunds() external payable {
        require(msg.value > 0, "Must send Ether");
        emit FundsLocked(msg.sender, msg.value);
    }
    
    // Distribute funds to a single recipient
    function distributeFunds(
        address recipient,
        uint256 amount
    ) external onlyHost {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= address(this).balance, "Not enough balance");
        
        payable(recipient).transfer(amount);
        
        emit FundsDistributed(recipient, amount);
    }
    
    // Accept direct Ether transfers
    receive() external payable {
        emit FundsLocked(msg.sender, msg.value);
    }
    
    // View contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}