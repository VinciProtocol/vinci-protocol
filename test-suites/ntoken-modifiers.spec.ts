import { expect } from 'chai';
import { makeSuite, TestEnv } from './helpers/make-suite';
import { ProtocolErrors } from '../helpers/types';

makeSuite('NToken: Modifiers', (testEnv: TestEnv) => {
  const { CT_CALLER_MUST_BE_LENDING_POOL } = ProtocolErrors;

  it('Tries to invoke mint not being the LendingPool', async () => {
    const { deployer, nNFT } = testEnv;
    await expect(nNFT.mint(deployer.address, '1', '1')).to.be.revertedWith(
      CT_CALLER_MUST_BE_LENDING_POOL
    );
  });

  it('Tries to invoke burn not being the LendingPool', async () => {
    const { deployer, nNFT } = testEnv;
    await expect(nNFT.burn(deployer.address, deployer.address, '1', '1')).to.be.revertedWith(
      CT_CALLER_MUST_BE_LENDING_POOL
    );
  });

  it('Tries to invoke burnBatch not being the LendingPool', async () => {
    const { deployer, nNFT } = testEnv;
    await expect(nNFT.burnBatch(deployer.address, deployer.address, ['1'], ['1'])).to.be.revertedWith(
      CT_CALLER_MUST_BE_LENDING_POOL
    );
  });

  it('Tries to invoke transferOnLiquidation not being the LendingPool', async () => {
    const { deployer, users, nNFT } = testEnv;
    await expect(
      nNFT.transferOnLiquidation(deployer.address, users[0].address, ['1'], ['1'])
    ).to.be.revertedWith(CT_CALLER_MUST_BE_LENDING_POOL);
  });

  it('Tries to invoke transferUnderlyingTo not being the LendingPool', async () => {
    const { deployer, nNFT } = testEnv;
    await expect(nNFT.transferUnderlyingTo(deployer.address, '1', '1')).to.be.revertedWith(
      CT_CALLER_MUST_BE_LENDING_POOL
    );
  });
});
