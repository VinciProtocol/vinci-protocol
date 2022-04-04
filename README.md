# Vinci Protocol

This repository contains the smart contracts source code for Vinci Protocol. The repository uses Hardhat as development enviroment for compilation, testing and deployment tasks.

## What is Vinci?

Vinci Protocol is an NFT-backed DeFi protocol designed for boosting liquidity with a lending platform, and simultaneously hedging volatility with NFT-backed derivative products.

## Documentation

The documentation of Vinci is in the following [Vinci documentation](https://docs.vinci.io/) link. At the documentation you can learn more about the protocol, see the protocol design, integration guides and audits.

A more detailed and technical description of the protocol can be found in this repository, [here](https://docsend.com/view/b8fvuknbyhjvhcfa)

## Audit

* Armors Lab (03/2022): [report](/audits/Armors-vinci-03-2022.pdf)

## Community

You can join our [Telegram](https://t.me/vinciprotocol) channel for asking questions about the protocol or talk about Vinci with other peers.

## Getting Started

Run the following command to initialize the environment:

`npm run initenv`

And to test:

`npm run test`

Sometimes it will report an error like this:

`Error: Cannot find module './test-suites/__setup.spec.ts'`

It's not an error. You could just ignore it. The result of the test run is above that line.
