// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CarbonCredit is ERC721URIStorage {
    uint256 public tokenCounter;

    mapping(string => bool) public usedHashes;

    constructor() ERC721("CarbonCredit", "CC") {
        tokenCounter = 0;
    }

    function mintCredit(string memory ipfsUri, string memory imageHash) public {
        require(!usedHashes[imageHash], "Duplicate submission");

        uint256 tokenId = tokenCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, ipfsUri);

        usedHashes[imageHash] = true;
        tokenCounter++;

    }
}
