# Minter for CENT x dOrg graph project

This contract allows anyone to mint a token of their friend graph.

The initial manager is the deployer of the contract. The manager has the power to

* change the manager
* change the notary
* sweep funds to their address

Minters must pass token uris with valid signatures from the notary in order to mint.

Minters can optionally attach a payment when minting.

## Install

`npm run install`

## Build

`npm run build`

## Flatten (for deploying + verifying on etherscan)

`npm run flatten`

## Testing

`npm run test`

## License

MIT
