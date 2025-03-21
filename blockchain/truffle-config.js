require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

// Debug information to verify environment variables loading
console.log("Environment variables loaded:");
console.log("- MNEMONIC present:", !!process.env.MNEMONIC);
console.log("- INFURA_PROJECT_ID present:", !!process.env.INFURA_PROJECT_ID);

// Fallback RPC URL in case Infura has issues
const SEPOLIA_RPC_ALTERNATIVES = [
  `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  `https://eth-sepolia.public.blastapi.io`,
  `https://rpc.sepolia.org`
];

// Choose which RPC to use (default to first option)
const SEPOLIA_RPC_URL = SEPOLIA_RPC_ALTERNATIVES[0];
console.log("Using RPC URL:", SEPOLIA_RPC_URL);

module.exports = {
  networks: {
    // Updated Ganache configuration for local testing
    development: {
      host: "127.0.0.1",
      port: 7545,  // Default Ganache GUI port (use 8545 for ganache-cli)
      network_id: "*",
      gas: 6721975, // Ganache default
      gasPrice: 20000000000, // 20 gwei
    },
    
    // Ganache with specific mnemonic (if needed)
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000,
    },
    
    sepolia: {
      provider: () => {
        if (!process.env.MNEMONIC) {
          throw new Error("MNEMONIC environment variable not set! Check your .env file.");
        }
        return new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: SEPOLIA_RPC_URL,
          numberOfAddresses: 1,
          shareNonce: true,
          derivationPath: "m/44'/60'/0'/0/",
          pollingInterval: 15000
        });
      },
      network_id: 11155111,  // Sepolia's network id
      gas: 5500000,
      gasPrice: 3000000000,  // 3 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 60000
    },
    
    // Fallback Sepolia configuration using alternative RPC
    sepolia_alt: {
      provider: () => {
        if (!process.env.MNEMONIC) {
          throw new Error("MNEMONIC environment variable not set! Check your .env file.");
        }
        return new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: SEPOLIA_RPC_ALTERNATIVES[1],
          numberOfAddresses: 1,
          shareNonce: true,
        });
      },
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 3000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 60000
    }
  },
  compilers: {
    solc: {
      version: "0.8.13",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  mocha: {
    timeout: 100000
  }
};