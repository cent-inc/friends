import { expect, use } from 'chai';
import { Contract, utils } from 'ethers';
import {
    deployContract,
    MockProvider,
    solidity
} from 'ethereum-waffle';

import fs from 'fs';
const Hive = JSON.parse(fs.readFileSync('./build/Hive.json'));

use(solidity);

describe('Hive', () => {
    const tokenURIs = [
        'https://example.com/foo.json',
        'https://example.com/bar.json',
        'https://example.com/baz.json',
        'https://example.com/bat.json'
    ];
    const [
        manager,
        notary,
        newManager,
        newNotary,
        minterA,
        minterB,
        minterC,
        ...accounts
    ] = new MockProvider().getWallets();

    let contract;
    let tokens = 0;

    const getSignature = async (tokenURI, notary) => {
        const notaryMessage = utils.defaultAbiCoder.encode([ "string" ], [ tokenURI ]);
        const notaryMessageHash = utils.keccak256(notaryMessage);
        const notarySignature = await notary.signMessage(utils.arrayify(notaryMessageHash));
        return notarySignature;
    };

    it('deploys the contract', async () => {
        contract = await deployContract(manager, Hive, [ notary.address ]);
    });

    it('mints an NFT on the contract', async () => {
        const uri = tokenURIs[0];
        const sig = await getSignature(uri, notary);
        await contract.connect(minterA).mint(uri, sig, { value: 100000000 });
        const tokenURIResult = await contract.tokenURI(1);
        expect(tokenURIResult).to.equal(uri);
        tokens++;
    });

    it('prevents reminting token with the same signed URI', async () => {
        const uri = tokenURIs[0];
        const sig = await getSignature(uri, notary);
        await expect(contract.connect(minterA).mint(uri, sig)).to.be.reverted;
    });


    it('collects and sweeps donations', async () => {
        const uri = tokenURIs[1];
        const sig = await getSignature(uri, notary);
        await contract.connect(minterA).mint(uri, sig, { value: 100000000 });
        await expect(await contract.connect(minterA).sweep()).to.changeEtherBalance(manager, 200000000);
        tokens++;
    });

    it('changes manager', async () => {
        await expect(contract.connect(minterA).replace(minterA.address)).to.be.reverted;
        await contract.connect(manager).replace(newManager.address);
        const mgr = await contract.karen();
        expect(mgr).to.equal(newManager.address);
    });

    it('changes notary', async () => {
        await expect(contract.connect(minterA).rotate(minterA.address)).to.be.reverted;
        await contract.connect(newManager).rotate(newNotary.address);
        const ntry = await contract.dmv();
        expect(ntry).to.equal(newNotary.address);
    });

});
