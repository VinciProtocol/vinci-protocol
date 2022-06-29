import { makeSuite, TestEnv } from './helpers/make-suite';
import { expect } from 'chai';
import { deployERC721Mocked, deployNFTOracle } from '../helpers/contracts-deployments';
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

    it('setAssetPriceInGwei', async () => {
        const address = testEnv.nft.address;

        await NFTOracle.addAssets([address]);

        // set price
        await NFTOracle.setAssetPriceInGwei(address, 11234567890);

        await expect(
            (await NFTOracle.getAssetPrice(address)).toString()
        ).to.be.equal(convertToString(11234567890 * 10 ** 9));
    });

    it('batchSetAssetPrice', async () => {
        const addresses = mockPrices[0];
        const prices = mockPrices[1];
        let res = {};
        await NFTOracle.addAssets(addresses);
        for (let i = 0; i < addresses.length; i++) {
            const addr = addresses[i];
            const price = prices[i];
            const location = await NFTOracle.getLocation(addr);
            const id = parseInt(location[0].toString());
            const index = parseInt(location[1].toString());
            if (res[id] == undefined) {
                res[id] = {
                    addresses: [],
                    prices: [],
                }
            }
            res[id].addresses.push(addr);
            res[id].prices.push(price);
        }

        let batchInput = [];
        for (let id in res) {
            let _prices = res[id].prices;
            let _addresses = res[id].addresses;
            for (let i = 0; i < (4-_prices.length); i++) {
                _prices.push(0)
                _addresses.push('0x0000000000000000000000000000000000000000')
            }
            batchInput.push({
                id: id,
                addresses: res[id].addresses,
                prices: _prices,
            });
        }

        // batchSetAssetPrice
        await NFTOracle.batchSetAssetPrice(batchInput);

        await expect(
            (await NFTOracle.getAssetPrice(addresses[0])).toString()
        ).to.be.equal(convertToString(prices[0] * 10 ** 9));
    });
});