import { tEthereumAddress } from './types';
import { MockAggregator } from '../types/MockAggregator';
import { MockTokenMap, MockERC721TokenMap, MockEligibilityMap } from './contracts-getters';

export const getAllTokenAddresses = (mockTokens: MockTokenMap) =>
  Object.entries(mockTokens).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress }, [tokenSymbol, tokenContract]) => ({
      ...accum,
      [tokenSymbol]: tokenContract.address,
    }),
    {}
  );

export const getAllERC721TokenAddresses = (mockErc721Tokens: MockERC721TokenMap) =>
  Object.entries(mockErc721Tokens).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress }, [tokenSymbol, tokenContract]) => ({
      ...accum,
      [tokenSymbol]: tokenContract.address,
    }),
    {}
  );

export const getAllEligibilityAddresses = (mockEligibilities: MockEligibilityMap) =>
  Object.entries(mockEligibilities).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress}, [tokenSymbol, eligibilityContract]) => ({
      ...accum,
      [tokenSymbol]: eligibilityContract.address,
    }),
    {}
  );

export const getAllAggregatorsAddresses = (mockAggregators: {
  [tokenSymbol: string]: MockAggregator;
}) =>
  Object.entries(mockAggregators).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress }, [tokenSymbol, aggregator]) => ({
      ...accum,
      [tokenSymbol]: aggregator.address,
    }),
    {}
  );
