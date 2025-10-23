# 📱 InstaSocial

Decentralized social network built on MegaETH with instant posts and real-time interactions.

## Features

- **Instant Posts**: Share thoughts and images with 10ms confirmation
- **Real-time Feed**: Updates every 3 seconds
- **Likes & Comments**: Engage with content instantly
- **Tips**: Send ETH tips to content creators
- **Profile NFTs**: Mint your profile as an NFT
- **Follow System**: Build your social network

## Technology Stack

- **Smart Contracts**: Solidity + Hardhat
- **Frontend**: React + Vite + TailwindCSS
- **Blockchain**: MegaETH Testnet (Chain ID: 6342)
- **Web3**: ethers.js v6

## Setup & Deployment

### 1. Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Deploy to MegaETH

```bash
npm run deploy
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3001

## How to Use

1. **Connect Wallet**: Connect MetaMask to MegaETH Testnet
2. **Create Profile**: Choose a username and bio
3. **Create Posts**: Share content up to 500 characters
4. **Engage**: Like, comment, and tip posts
5. **Follow Users**: Build your network
6. **Mint NFT Profile**: Get a collectible profile NFT

## Smart Contract Features

### Profiles
- Username (max 20 chars)
- Bio and avatar
- Optional NFT profile (0.001 ETH)
- Follower/following counts

### Posts
- Text content (max 500 chars)
- Optional image URI
- Likes counter
- Tips in ETH
- Comments

### Social Interactions
- Like/unlike posts and comments
- Follow/unfollow users
- Tip content creators
- Comment on posts

## Smart Contract

**✅ DEPLOYED CONTRACT**

**Contract Address**: `0x59f8ec1970835BEF65b1aad19dD98902b7eCe47D`

**View on Explorer**: https://megaexplorer.xyz/address/0x59f8ec1970835BEF65b1aad19dD98902b7eCe47D

**Network**: MegaETH Testnet
- Chain ID: 6342
- RPC: https://carrot.megaeth.com/rpc
- Explorer: https://megaexplorer.xyz

**Deployed**: Successfully deployed and verified
**Deployer**: 0x89ae914DB5067a0F2EF532aeCB96aBd7c83F53Ef

## Building for Production

```bash
cd frontend
npm run build
```

Deploy the `frontend/dist` folder to any static hosting.

## License

MIT

