// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    string _baseTokenURI; // this well be set as prefix in each nfts uri.
    uint256 public _price = 0.01 ether;
    bool public _paused; // used to pause the contract in case of emergency
    uint256 public maxTokenIds = 20;
    uint256 public tokenIds; // this keeps count of the number of nfts minted
    IWhitelist whitelist;
    bool public presaleStarted;
    uint256 public presaleEnded; // timestamp for when presale would end.

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }

    constructor(string memory baseURI, address whitelistContract) ERC721("Crypto Devs", "CD") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    function preSaleMint() public payable onlyWhenNotPaused{
        //startPresale()
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not running");
        require(whitelist.WhitelistedAddresses(msg.sender), "You are not a part of whitelist");
        require(tokenIds < maxTokenIds, "No more NFTs left");
        require(msg.value > _price, "Ether sent is not enough");

        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused{
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet");
        require(tokenIds < maxTokenIds, "No more NFTs left");
        require(msg.value > _price, "Ether sent is not enough");

        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setPaused(bool val) public onlyOwner{
        _paused = val;
    }

    function withdraw() public onlyOwner{
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent,) = _owner.call{value: amount}("");
        require (sent,"Failed to send Ether");
    }

    // Functions to receive Ether
    receive() external payable {}  // msg.data must be empty

    fallback() external payable {} // Fallback function is called when msg.data is not empty

}