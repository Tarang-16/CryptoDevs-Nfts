//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IWhitelist {
    function WhitelistedAddresses(address)  external view returns (bool);
}