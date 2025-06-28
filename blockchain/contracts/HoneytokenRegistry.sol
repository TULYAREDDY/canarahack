// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract HoneytokenRegistry {
    event HoneytokenRegistered(bytes32 indexed htHash, uint256 timestamp, string metadata);

    mapping(bytes32 => uint256) public firstSeen;  // block-timestamp of initial registration

    function registerHoneytoken(bytes32 htHash, string calldata metadata) external {
        require(firstSeen[htHash] == 0, "Already registered");
        firstSeen[htHash] = block.timestamp;
        emit HoneytokenRegistered(htHash, block.timestamp, metadata);
    }

    function isRegistered(bytes32 htHash) external view returns (bool) {
        return firstSeen[htHash] != 0;
    }
} 