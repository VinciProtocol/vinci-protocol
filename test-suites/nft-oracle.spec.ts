import { makeSuite, TestEnv } from './helpers/make-suite';
import { expect } from 'chai';
import { deployNFTOracle } from '../helpers/contracts-deployments';
import { convertToString } from '../helpers/contracts-helpers';


makeSuite("NFTOracle - Oracle for NFT", (testEnv: TestEnv) => {
    let mockPrices;
    let NFTOracle;

    before(async () => {
        const { users } = testEnv;
        NFTOracle = await deployNFTOracle();
        let addresses = [];
        let prices = [];
        let p = 1;
        for (let user of users) {
            addresses.push(await user.address);
            prices.push(p);
            p = p + 1;
        };
        mockPrices = [addresses, prices];
    });

    it('Ownable: caller is not the owner', async () => {
        const signer = testEnv.users[1].signer;
        const instance = NFTOracle.connect(signer);
        await expect(
            await instance.owner()
        ).to.be.equal(testEnv.deployer.address);

        await expect(
            await signer.getAddress()
        ).to.not.equal(testEnv.deployer.address);

        await expect(
            instance.addAssets(mockPrices[0])
        ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('addAssets', async () => {
        let res;
        res = await NFTOracle.getAddressList();
        await expect(
            res.length
        ).to.be.equal(0);

        const addresses = mockPrices[0];
        await NFTOracle.addAssets(addresses);

        res = await NFTOracle.getAddressList();
        await expect(
            res.length
        ).to.be.equal(addresses.length);
    });

    it('batchSetAssetPrice', async () => {
        const addresses = mockPrices[0];
        const prices = mockPrices[1];

        // batchSetAssetPrice
        await NFTOracle.batchSetAssetPrice(addresses, prices);

        await expect(
            (await NFTOracle.getAssetPrice(addresses[0])).toString()
        ).to.be.equal(convertToString(prices[0] * 10 ** 14));
    });

    it('NFTOracle: caller is not the operator', async () => {
        const addresses = mockPrices[0];
        const prices = mockPrices[1];

        // set opreator
        await NFTOracle.setOperator(addresses[0]);
        await expect(
            NFTOracle.batchSetAssetPrice(addresses, prices)
        ).to.be.revertedWith('NFTOracle: caller is not the operator');
    });
});