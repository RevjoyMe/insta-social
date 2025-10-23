# 📱 InstaSocial - Vercel Deployment Guide

## 📋 Overview

InstaSocial is a decentralized social network built on MegaETH. This guide will help you deploy the frontend to Vercel.

**Live Contract**: `0x59f8ec1970835BEF65b1aad19dD98902b7eCe47D`  
**Network**: MegaETH Testnet (Chain ID: 6342)

---

## 🚀 Quick Deploy

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd insta-social

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub + Vercel (Automated)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit: InstaSocial"
git branch -M main
git remote add origin https://github.com/RevjoyMe/insta-social.git
git push -u origin main

# Then import in Vercel Dashboard
```

---

## 🔧 Detailed Setup

### Step 1: Prepare Frontend

```bash
cd frontend
npm install
npm run dev  # Test locally first
```

Verify at http://localhost:3001

### Step 2: Verify Configuration

Check `frontend/src/contract-address.json`:

```json
{
  "contract": "InstaSocial",
  "address": "0x59f8ec1970835BEF65b1aad19dD98902b7eCe47D",
  "network": "MegaETH Testnet",
  "chainId": 6342
}
```

### Step 3: Create vercel.json

In `insta-social/` root:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🌐 Vercel Dashboard Configuration

### Project Settings

- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 18.x

---

## ✅ Testing Deployed App

### 1. Connect Wallet
- Click "Connect Wallet"
- Approve MetaMask connection
- Switch to MegaETH Testnet (auto-prompt)

### 2. Create Profile
- Enter username (max 20 chars)
- Add bio (optional)
- Click "Create Profile"
- Wait for transaction confirmation (~10ms!)

### 3. Create Post
- Click ➕ (Create Post)
- Write content (max 500 chars)
- Add image URL (optional)
- Click "Post"

### 4. Interact
- Like posts (❤️)
- Comment (💬)
- Send tips (💰)
- Follow users

### 5. Profile NFT
- Go to Profile view
- Click "Mint Profile NFT" (0.001 ETH)
- Get your collectible profile!

---

## 🎨 UI Components

### Feed View
- Real-time post updates every 3 seconds
- Like counter with instant feedback
- Comment counts
- Tips display
- Floating animations on interactions

### Create View
- Character counter (500 max)
- Image URL validation
- Preview functionality
- Instant submission

### Profile View
- Stats: Posts, Followers, Following
- NFT badge if minted
- Edit bio functionality
- Following list

### Leaderboard
- Top 10 posters
- Real-time updates
- Highlight your position

---

## 📊 Smart Contract Features

### Profiles
```solidity
struct Profile {
    string username;
    string bio;
    string avatarURI;
    uint256 nftProfileId;
    uint256 followers;
    uint256 following;
    uint256 postCount;
    bool exists;
}
```

### Posts
```solidity
struct Post {
    uint256 id;
    address author;
    string content;
    string imageURI;
    uint256 timestamp;
    uint256 likes;
    uint256 tips;
    bool isDeleted;
}
```

### Interactions
- `createProfile(username, bio, avatarURI)`
- `createPost(content, imageURI)`
- `likePost(postId)`
- `tipPost(postId)` - payable
- `createComment(postId, content)`
- `followUser(userAddress)`

---

## 🐛 Troubleshooting

### Issue: Can't create profile

**Solution**:
- Check username is unique
- Max 20 characters
- Valid characters only
- Ensure wallet is connected

### Issue: Posts not loading

**Solution**:
- Check contract address in `contract-address.json`
- Verify RPC endpoint is responding
- Check browser console for errors
- Wait for sync (3 second interval)

### Issue: Transactions failing

**Solution**:
- Ensure sufficient ETH balance
- Check gas estimation
- Try increasing gas limit
- Verify contract is not paused

### Issue: Images not showing

**Solution**:
- Use direct image URLs (IPFS, CDN)
- Ensure CORS is enabled
- Check image URL is valid
- Try different hosting service

---

## 🎯 Performance Optimization

### Frontend

```javascript
// Lazy loading
const LazyProfile = React.lazy(() => import('./Profile'))

// Memoization
const MemoizedPost = React.memo(Post)

// Virtual scrolling for long feeds
import { FixedSizeList } from 'react-window'
```

### Contract Queries

```javascript
// Batch requests
const posts = await Promise.all(
  postIds.map(id => contract.getPost(id))
)

// Cache results
const cache = new Map()
```

---

## 📈 Analytics Setup

### Vercel Analytics

1. Dashboard → Project → Analytics
2. Enable Web Analytics
3. View real-time visitors
4. Track page views
5. Monitor performance

### Custom Events

```javascript
// Track user actions
analytics.track('post_created', {
  userId: account,
  postId: id
})
```

---

## 🔒 Security Best Practices

### Frontend

- ✅ Validate all inputs
- ✅ Sanitize user content
- ✅ Use Content Security Policy
- ✅ Implement rate limiting
- ✅ Check transaction confirmations

### Smart Contract

- ✅ ReentrancyGuard on all functions
- ✅ Access control modifiers
- ✅ Input validation
- ✅ Event logging
- ✅ Pausable functionality

---

## 🌟 Advanced Features

### IPFS Integration

```javascript
// Upload to IPFS
const cid = await ipfs.add(file)
const imageURI = `https://ipfs.io/ipfs/${cid}`
```

### ENS Integration

```javascript
// Resolve ENS names
const ensName = await provider.lookupAddress(address)
```

### Notifications

```javascript
// Real-time notifications
socket.on('new_like', (data) => {
  toast.success(`${data.username} liked your post!`)
})
```

---

## 📱 Mobile Optimization

### Responsive Design

```css
/* Mobile-first approach */
@media (max-width: 768px) {
  .post-grid {
    grid-template-columns: 1fr;
  }
}
```

### Touch Interactions

```javascript
// Swipe gestures
const handlers = useSwipeable({
  onSwipedLeft: () => nextPost(),
  onSwipedRight: () => prevPost()
})
```

---

## 🚀 Scaling Considerations

### Caching Strategy

- Use React Query for data caching
- Implement service workers
- CDN for static assets
- Edge caching on Vercel

### Database (Optional)

For better performance, consider adding:
- The Graph protocol for indexing
- Ceramic Network for profiles
- IPFS for media storage

---

## 🎉 Post-Deployment Checklist

- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Social media metadata
- [ ] SEO optimization
- [ ] Backup strategy

---

## 📚 Resources

- [MegaETH Docs](https://docs.megaeth.com)
- [Vercel Docs](https://vercel.com/docs)
- [React Best Practices](https://react.dev)
- [Web3 Security](https://consensys.github.io/smart-contract-best-practices/)

---

## 💬 Support

Issues? Questions?
- GitHub: [Create an issue](https://github.com/RevjoyMe/insta-social/issues)
- Discord: MegaETH Community
- Twitter: @MegaETH

---

**Happy Deploying! 📱✨**

