// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title InstaSocial
 * @dev Decentralized social network with instant posts and interactions
 * Powered by MegaETH's 10ms blocks for real-time social experience
 */
contract InstaSocial is ERC721, Ownable {
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

    struct Comment {
        uint256 id;
        uint256 postId;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
    }

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

    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment) public comments;
    mapping(address => Profile) public profiles;
    mapping(address => string) public addressToUsername;
    
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(uint256 => mapping(address => bool)) public commentLikes;
    mapping(address => mapping(address => bool)) public following;

    mapping(uint256 => uint256[]) public postComments; // postId => commentIds
    
    uint256 public nextPostId = 1;
    uint256 public nextCommentId = 1;
    uint256 public nextProfileNFTId = 1;
    
    uint256 public constant PROFILE_NFT_PRICE = 0.001 ether;
    
    uint256[] public allPosts;

    event ProfileCreated(address indexed user, string username);
    event ProfileNFTMinted(address indexed user, uint256 tokenId);
    event PostCreated(uint256 indexed postId, address indexed author, string content);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostTipped(uint256 indexed postId, address indexed tipper, uint256 amount);
    event CommentCreated(uint256 indexed commentId, uint256 indexed postId, address indexed author);
    event CommentLiked(uint256 indexed commentId, address indexed liker);
    event Followed(address indexed follower, address indexed followee);
    event Unfollowed(address indexed follower, address indexed followee);

    constructor() ERC721("InstaSocial Profile", "INSTA") Ownable(msg.sender) {}

    modifier profileExists() {
        require(profiles[msg.sender].exists, "Create profile first");
        _;
    }

    function createProfile(string memory username, string memory bio, string memory avatarURI) external {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(username).length > 0 && bytes(username).length <= 20, "Invalid username length");
        require(bytes(addressToUsername[msg.sender]).length == 0, "Username taken");

        profiles[msg.sender] = Profile({
            username: username,
            bio: bio,
            avatarURI: avatarURI,
            nftProfileId: 0,
            followers: 0,
            following: 0,
            postCount: 0,
            exists: true
        });

        addressToUsername[msg.sender] = username;
        emit ProfileCreated(msg.sender, username);
    }

    function mintProfileNFT() external payable profileExists {
        require(msg.value >= PROFILE_NFT_PRICE, "Insufficient payment");
        require(profiles[msg.sender].nftProfileId == 0, "Already have NFT profile");

        uint256 tokenId = nextProfileNFTId++;
        _safeMint(msg.sender, tokenId);
        profiles[msg.sender].nftProfileId = tokenId;

        emit ProfileNFTMinted(msg.sender, tokenId);
    }

    function updateProfile(string memory bio, string memory avatarURI) external profileExists {
        Profile storage profile = profiles[msg.sender];
        profile.bio = bio;
        profile.avatarURI = avatarURI;
    }

    function createPost(string memory content, string memory imageURI) external profileExists {
        require(bytes(content).length > 0 && bytes(content).length <= 500, "Invalid content length");

        uint256 postId = nextPostId++;
        
        posts[postId] = Post({
            id: postId,
            author: msg.sender,
            content: content,
            imageURI: imageURI,
            timestamp: block.timestamp,
            likes: 0,
            tips: 0,
            isDeleted: false
        });

        allPosts.push(postId);
        profiles[msg.sender].postCount++;

        emit PostCreated(postId, msg.sender, content);
    }

    function deletePost(uint256 postId) external {
        require(posts[postId].author == msg.sender, "Not post author");
        require(!posts[postId].isDeleted, "Already deleted");
        
        posts[postId].isDeleted = true;
        profiles[msg.sender].postCount--;
    }

    function likePost(uint256 postId) external profileExists {
        require(!posts[postId].isDeleted, "Post deleted");
        require(!postLikes[postId][msg.sender], "Already liked");

        postLikes[postId][msg.sender] = true;
        posts[postId].likes++;

        emit PostLiked(postId, msg.sender);
    }

    function unlikePost(uint256 postId) external profileExists {
        require(postLikes[postId][msg.sender], "Not liked");

        postLikes[postId][msg.sender] = false;
        posts[postId].likes--;
    }

    function tipPost(uint256 postId) external payable profileExists {
        require(!posts[postId].isDeleted, "Post deleted");
        require(msg.value > 0, "Tip must be > 0");

        Post storage post = posts[postId];
        post.tips += msg.value;

        // Send tip to author
        payable(post.author).transfer(msg.value);

        emit PostTipped(postId, msg.sender, msg.value);
    }

    function createComment(uint256 postId, string memory content) external profileExists {
        require(!posts[postId].isDeleted, "Post deleted");
        require(bytes(content).length > 0 && bytes(content).length <= 200, "Invalid content length");

        uint256 commentId = nextCommentId++;
        
        comments[commentId] = Comment({
            id: commentId,
            postId: postId,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            likes: 0
        });

        postComments[postId].push(commentId);

        emit CommentCreated(commentId, postId, msg.sender);
    }

    function likeComment(uint256 commentId) external profileExists {
        require(!commentLikes[commentId][msg.sender], "Already liked");

        commentLikes[commentId][msg.sender] = true;
        comments[commentId].likes++;

        emit CommentLiked(commentId, msg.sender);
    }

    function unlikeComment(uint256 commentId) external profileExists {
        require(commentLikes[commentId][msg.sender], "Not liked");

        commentLikes[commentId][msg.sender] = false;
        comments[commentId].likes--;
    }

    function followUser(address user) external profileExists {
        require(user != msg.sender, "Cannot follow yourself");
        require(profiles[user].exists, "User doesn't exist");
        require(!following[msg.sender][user], "Already following");

        following[msg.sender][user] = true;
        profiles[msg.sender].following++;
        profiles[user].followers++;

        emit Followed(msg.sender, user);
    }

    function unfollowUser(address user) external profileExists {
        require(following[msg.sender][user], "Not following");

        following[msg.sender][user] = false;
        profiles[msg.sender].following--;
        profiles[user].followers--;

        emit Unfollowed(msg.sender, user);
    }

    function getPost(uint256 postId) external view returns (
        uint256 id,
        address author,
        string memory username,
        string memory content,
        string memory imageURI,
        uint256 timestamp,
        uint256 likes,
        uint256 tips,
        uint256 commentCount,
        bool isLikedByMe
    ) {
        Post storage post = posts[postId];
        require(!post.isDeleted, "Post deleted");
        
        return (
            post.id,
            post.author,
            profiles[post.author].username,
            post.content,
            post.imageURI,
            post.timestamp,
            post.likes,
            post.tips,
            postComments[postId].length,
            postLikes[postId][msg.sender]
        );
    }

    function getRecentPosts(uint256 count, uint256 offset) external view returns (uint256[] memory) {
        uint256 totalPosts = allPosts.length;
        if (offset >= totalPosts) {
            return new uint256[](0);
        }

        uint256 remaining = totalPosts - offset;
        uint256 size = count < remaining ? count : remaining;
        uint256[] memory result = new uint256[](size);
        
        uint256 resultIndex = 0;
        for (uint256 i = totalPosts - 1 - offset; resultIndex < size && i >= 0; i--) {
            if (!posts[allPosts[i]].isDeleted) {
                result[resultIndex] = allPosts[i];
                resultIndex++;
            }
            if (i == 0) break;
        }

        return result;
    }

    function getPostComments(uint256 postId) external view returns (uint256[] memory) {
        return postComments[postId];
    }

    function getComment(uint256 commentId) external view returns (
        uint256 id,
        uint256 postId,
        address author,
        string memory username,
        string memory content,
        uint256 timestamp,
        uint256 likes,
        bool isLikedByMe
    ) {
        Comment storage comment = comments[commentId];
        
        return (
            comment.id,
            comment.postId,
            comment.author,
            profiles[comment.author].username,
            comment.content,
            comment.timestamp,
            comment.likes,
            commentLikes[commentId][msg.sender]
        );
    }

    function getProfile(address user) external view returns (
        string memory username,
        string memory bio,
        string memory avatarURI,
        uint256 nftProfileId,
        uint256 followers,
        uint256 followingCount,
        uint256 postCount,
        bool isFollowedByMe
    ) {
        Profile storage profile = profiles[user];
        require(profile.exists, "Profile doesn't exist");
        
        return (
            profile.username,
            profile.bio,
            profile.avatarURI,
            profile.nftProfileId,
            profile.followers,
            profile.following,
            profile.postCount,
            following[msg.sender][user]
        );
    }

    function isFollowing(address follower, address followee) external view returns (bool) {
        return following[follower][followee];
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

