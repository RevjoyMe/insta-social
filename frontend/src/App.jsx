import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import contractABI from './contract-abi.json'
import contractAddress from './contract-address.json'

const MEGAETH_CONFIG = {
  chainId: '0x18c6',
  chainName: 'MegaETH Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://carrot.megaeth.com/rpc'],
  blockExplorerUrls: ['https://megaexplorer.xyz']
}

function App() {
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('feed') // feed, profile, create
  const [selectedPost, setSelectedPost] = useState(null)

  // Form states
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postImage, setPostImage] = useState('')
  const [commentContent, setCommentContent] = useState('')

  useEffect(() => {
    checkWalletConnection()
  }, [])

  useEffect(() => {
    if (contract && account) {
      loadProfile()
      loadFeed()
      const interval = setInterval(loadFeed, 3000)
      return () => clearInterval(interval)
    }
  }, [contract, account])

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        await connectWallet()
      }
    }
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask!')
        return
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MEGAETH_CONFIG.chainId }],
        })
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MEGAETH_CONFIG],
          })
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contractInstance = new ethers.Contract(
        contractAddress.address,
        contractABI,
        signer
      )

      setAccount(accounts[0])
      setContract(contractInstance)
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const loadProfile = async () => {
    try {
      const profileData = await contract.getProfile(account)
      setProfile({
        username: profileData[0],
        bio: profileData[1],
        avatarURI: profileData[2],
        nftProfileId: profileData[3],
        followers: Number(profileData[4]),
        following: Number(profileData[5]),
        postCount: Number(profileData[6])
      })
    } catch (error) {
      console.log('No profile found')
      setProfile(null)
    }
  }

  const loadFeed = async () => {
    try {
      const postIds = await contract.getRecentPosts(20, 0)
      const postsData = await Promise.all(
        postIds.map(async (id) => {
          try {
            const post = await contract.getPost(id)
            return {
              id: Number(id),
              author: post[1],
              username: post[2],
              content: post[3],
              imageURI: post[4],
              timestamp: Number(post[5]),
              likes: Number(post[6]),
              tips: ethers.formatEther(post[7]),
              commentCount: Number(post[8]),
              isLiked: post[9]
            }
          } catch (e) {
            return null
          }
        })
      )
      setPosts(postsData.filter(p => p !== null))
    } catch (error) {
      console.error('Error loading feed:', error)
    }
  }

  const createProfile = async () => {
    if (!username) return
    setLoading(true)
    try {
      const tx = await contract.createProfile(username, bio, '')
      await tx.wait()
      await loadProfile()
      setView('feed')
    } catch (error) {
      console.error('Error creating profile:', error)
      alert(error.reason || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async () => {
    if (!postContent) return
    setLoading(true)
    try {
      const tx = await contract.createPost(postContent, postImage)
      await tx.wait()
      setPostContent('')
      setPostImage('')
      setView('feed')
      await loadFeed()
    } catch (error) {
      console.error('Error creating post:', error)
      alert(error.reason || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const likePost = async (postId) => {
    try {
      const tx = await contract.likePost(postId)
      await tx.wait()
      await loadFeed()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const tipPost = async (postId) => {
    const amount = prompt('Enter tip amount in ETH:', '0.001')
    if (!amount) return
    
    try {
      const tx = await contract.tipPost(postId, {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      await loadFeed()
      alert('Tip sent!')
    } catch (error) {
      console.error('Error tipping post:', error)
      alert(error.reason || 'Failed to send tip')
    }
  }

  const formatTime = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000) - timestamp
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (!account) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">📱 InstaSocial</h1>
          <p className="text-gray-600 mb-6">Decentralized social network on MegaETH</p>
          <button
            onClick={connectWallet}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold hover:shadow-lg transition"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <h2 className="text-3xl font-bold mb-6 text-center">Create Your Profile</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={20}
          />
          <textarea
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
          <button
            onClick={createProfile}
            disabled={loading || !username}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">InstaSocial</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('feed')}
              className={`p-2 ${view === 'feed' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              🏠
            </button>
            <button
              onClick={() => setView('create')}
              className={`p-2 ${view === 'create' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              ➕
            </button>
            <button
              onClick={() => setView('profile')}
              className={`p-2 ${view === 'profile' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              👤
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Feed View */}
        {view === 'feed' && (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow post-card transition-shadow">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{post.username}</p>
                      <p className="text-xs text-gray-500">{formatTime(post.timestamp)}</p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-2">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>

                {post.imageURI && (
                  <img src={post.imageURI} alt="Post" className="w-full" />
                )}

                {/* Post Actions */}
                <div className="p-4 flex items-center justify-between border-t">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => likePost(post.id)}
                      className="flex items-center gap-2 hover:text-red-500 transition"
                    >
                      <span className="text-xl">{post.isLiked ? '❤️' : '🤍'}</span>
                      <span className="font-bold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition">
                      <span className="text-xl">💬</span>
                      <span className="font-bold">{post.commentCount}</span>
                    </button>
                    <button
                      onClick={() => tipPost(post.id)}
                      className="flex items-center gap-2 hover:text-green-500 transition"
                    >
                      <span className="text-xl">💰</span>
                      {post.tips > 0 && <span className="text-sm">{post.tips} ETH</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <p className="text-xl">No posts yet</p>
                <p>Be the first to post!</p>
              </div>
            )}
          </div>
        )}

        {/* Create Post View */}
        {view === 'create' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Create Post</h2>
            <textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={5}
              maxLength={500}
            />
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={postImage}
              onChange={(e) => setPostImage(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-3">
              <button
                onClick={createPost}
                disabled={loading || !postContent}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
              <button
                onClick={() => setView('feed')}
                className="px-6 py-3 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profile View */}
        {view === 'profile' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                {profile.username[0].toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold mb-2">{profile.username}</h2>
              <p className="text-gray-600">{profile.bio}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-bold">{profile.postCount}</p>
                <p className="text-gray-600">Posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.followers}</p>
                <p className="text-gray-600">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.following}</p>
                <p className="text-gray-600">Following</p>
              </div>
            </div>

            {profile.nftProfileId === 0n && (
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition">
                Mint Profile NFT (0.001 ETH)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

