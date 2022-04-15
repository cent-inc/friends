// SPDX-License-Identifier: MIT
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Burnable.sol';
import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';

pragma solidity 0.6.12;

contract Hive is ERC721Burnable {
    address private manager;
    address private notary;
    uint256 private tokenID;
    mapping(bytes => bool) signatures;

    constructor(address _notary) public ERC721('HIVE', 'Hive') {
        manager = _msgSender();
        notary = _notary;
    }

    function replace(address _manager) public {
        require(_msgSender() == manager, 'Unauthorized.');
        manager = _manager;
    }

    function rotate(address _notary) public {
        require(_msgSender() == manager, 'Unauthorized.');
        notary = _notary;
    }

    function sweep() public {
        (bool success, ) = manager.call{value: address(this).balance}('');
        require(success, 'Transfer failed.');
    }

    function mint(string memory uri, bytes memory signature) public payable {
        bytes32 hash = ECDSA.toEthSignedMessageHash(keccak256(abi.encode(uri)));
        require(notary == ECDSA.recover(hash, signature), 'Invalid notarization.');
        require(!signatures[signature], 'Signature reused');
        signatures[signature] = true;
        _mint(_msgSender(), ++tokenID);
        _setTokenURI(tokenID, uri);
    }

    function karen() public view returns (address) {
        return manager;
    }

    function dmv() public view returns (address) {
        return notary;
    }
}
