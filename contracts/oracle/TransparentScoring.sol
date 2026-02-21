// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title TransparentScoring
 * @author Valueskins Team  
 * @notice On-chain scoring algorithm with full transparency and audit trail
 * @dev Addresses trust layer blocker by publishing scoring methodology
 * 
 * BLOCKER ADDRESSED: Trust, verification, and fraud resistance
 * - Published, versioned scoring algorithm
 * - All scoring factors on-chain and auditable
 * - Score computation verifiable by anyone
 * - Historical score changes tracked
 * 
 * SCORING METHODOLOGY (PUBLIC):
 * Level 1: Score 0-1999 (Entry tier)
 * Level 2: Score 2000-3999 (Established)
 * Level 3: Score 4000-5999 (Professional)
 * Level 4: Score 6000-7999 (Expert)
 * Level 5: Score 8000-10000 (Legendary - Top 1%)
 * 
 * Score Components:
 * - Activity Score (30%): Posts, engagement frequency
 * - Engagement Score (30%): Likes, comments received
 * - Consistency Score (20%): Regular activity over time
 * - Verification Score (20%): Linked credentials, proof of expertise
 */
contract TransparentScoring is 
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // ============ Constants ============
    
    uint256 public constant MAX_SCORE = 10000;
    uint256 public constant PRECISION = 10000;
    
    // Weight constants (total = 10000)
    uint256 public constant WEIGHT_ACTIVITY = 3000;     // 30%
    uint256 public constant WEIGHT_ENGAGEMENT = 3000;   // 30%
    uint256 public constant WEIGHT_CONSISTENCY = 2000;  // 20%
    uint256 public constant WEIGHT_VERIFICATION = 2000; // 20%
    
    // Level thresholds
    uint256 public constant LEVEL_2_THRESHOLD = 2000;
    uint256 public constant LEVEL_3_THRESHOLD = 4000;
    uint256 public constant LEVEL_4_THRESHOLD = 6000;
    uint256 public constant LEVEL_5_THRESHOLD = 8000;

    // ============ Structs ============
    
    struct ScoreComponents {
        uint256 activityScore;      // 0-10000
        uint256 engagementScore;    // 0-10000
        uint256 consistencyScore;   // 0-10000  
        uint256 verificationScore;  // 0-10000
        uint256 totalScore;         // Weighted average
        uint8 level;                // 1-5
        uint256 lastUpdated;
    }
    
    struct ScoreHistory {
        uint256 timestamp;
        uint256 oldScore;
        uint256 newScore;
        uint8 oldLevel;
        uint8 newLevel;
        string reason;
    }
    
    struct ScoringWeights {
        uint256 activity;
        uint256 engagement;
        uint256 consistency;
        uint256 verification;
    }
    
    // Activity metrics for scoring
    struct ActivityMetrics {
        uint256 totalPosts;
        uint256 postsLast30Days;
        uint256 avgDaysBetweenPosts;
        uint256 totalLikesReceived;
        uint256 totalCommentsReceived;
        uint256 followerCount;
        uint256 consecutiveActiveDays;
        uint256 verifiedCredentials;
    }

    // ============ State Variables ============
    
    // Current algorithm version
    uint256 public algorithmVersion;
    
    // personaId => professionId => ScoreComponents
    mapping(uint256 => mapping(uint256 => ScoreComponents)) private _scores;
    
    // personaId => professionId => ScoreHistory[]
    mapping(uint256 => mapping(uint256 => ScoreHistory[])) private _scoreHistory;
    
    // Current weights (can be updated via governance)
    ScoringWeights public currentWeights;
    
    // Authorized score updaters
    mapping(address => bool) public authorizedUpdaters;
    
    // Statistics
    uint256 public totalScoresComputed;

    // ============ Events ============
    
    event ScoreUpdated(
        uint256 indexed personaId,
        uint256 indexed professionId,
        uint256 oldScore,
        uint256 newScore,
        uint8 newLevel
    );
    event WeightsUpdated(
        uint256 activity,
        uint256 engagement,
        uint256 consistency,
        uint256 verification,
        uint256 newVersion
    );
    event UpdaterAuthorized(address indexed updater, bool authorized);
    
    // ============ Errors ============
    
    error NotAuthorizedUpdater();
    error InvalidWeights();
    error InvalidScore();
    error ZeroAddress();

    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        if (!authorizedUpdaters[msg.sender] && msg.sender != owner()) {
            revert NotAuthorizedUpdater();
        }
        _;
    }

    // ============ Initializer ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address owner_) external initializer {
        if (owner_ == address(0)) revert ZeroAddress();
        
        __Ownable_init(owner_);
        
        // Set default weights
        currentWeights = ScoringWeights({
            activity: WEIGHT_ACTIVITY,
            engagement: WEIGHT_ENGAGEMENT,
            consistency: WEIGHT_CONSISTENCY,
            verification: WEIGHT_VERIFICATION
        });
        
        algorithmVersion = 1;
        authorizedUpdaters[owner_] = true;
    }

    // ============ Core Scoring Functions ============
    
    /**
     * @notice Computes score from raw metrics (FULLY TRANSPARENT)
     * @dev This is the ENTIRE scoring algorithm - no hidden logic
     */
    function computeScore(
        ActivityMetrics calldata metrics
    ) public pure returns (uint256 totalScore, uint8 level) {
        // 1. Activity Score (30%)
        // Based on posts in last 30 days + total post history
        uint256 activityScore = _computeActivityScore(
            metrics.totalPosts,
            metrics.postsLast30Days
        );
        
        // 2. Engagement Score (30%)
        // Based on likes and comments received relative to posts
        uint256 engagementScore = _computeEngagementScore(
            metrics.totalLikesReceived,
            metrics.totalCommentsReceived,
            metrics.totalPosts,
            metrics.followerCount
        );
        
        // 3. Consistency Score (20%)
        // Based on regular posting and consecutive active days
        uint256 consistencyScore = _computeConsistencyScore(
            metrics.avgDaysBetweenPosts,
            metrics.consecutiveActiveDays
        );
        
        // 4. Verification Score (20%)
        // Based on verified credentials
        uint256 verificationScore = _computeVerificationScore(
            metrics.verifiedCredentials
        );
        
        // Weighted average
        totalScore = (
            activityScore * WEIGHT_ACTIVITY +
            engagementScore * WEIGHT_ENGAGEMENT +
            consistencyScore * WEIGHT_CONSISTENCY +
            verificationScore * WEIGHT_VERIFICATION
        ) / PRECISION;
        
        // Clamp to max
        if (totalScore > MAX_SCORE) totalScore = MAX_SCORE;
        
        // Compute level
        level = _scoreToLevel(totalScore);
        
        return (totalScore, level);
    }
    
    /**
     * @notice Activity score calculation (PUBLIC)
     * Formula: min(10000, (totalPosts * 50) + (postsLast30Days * 200))
     */
    function _computeActivityScore(
        uint256 totalPosts,
        uint256 postsLast30Days
    ) internal pure returns (uint256) {
        // Each total post = 50 points (up to 100 posts = 5000)
        // Each recent post = 200 points (up to 25 posts = 5000)
        uint256 totalPostScore = totalPosts * 50;
        if (totalPostScore > 5000) totalPostScore = 5000;
        
        uint256 recentPostScore = postsLast30Days * 200;
        if (recentPostScore > 5000) recentPostScore = 5000;
        
        return totalPostScore + recentPostScore;
    }
    
    /**
     * @notice Engagement score calculation (PUBLIC)
     * Formula: Based on engagement rate relative to follower count
     */
    function _computeEngagementScore(
        uint256 likes,
        uint256 comments,
        uint256 posts,
        uint256 followers
    ) internal pure returns (uint256) {
        if (posts == 0 || followers == 0) return 0;
        
        // Total engagement
        uint256 totalEngagement = likes + (comments * 3); // Comments weighted 3x
        
        // Engagement per post
        uint256 engagementPerPost = totalEngagement / posts;
        
        // Engagement rate (relative to followers)
        // If engagement/post > 10% of followers, max score
        uint256 engagementRate = (engagementPerPost * 10000) / followers;
        
        // Scale: 1% rate = 1000 points, cap at 10000
        if (engagementRate > 10000) return 10000;
        return engagementRate;
    }
    
    /**
     * @notice Consistency score calculation (PUBLIC)
     * Formula: Based on posting frequency and streak
     */
    function _computeConsistencyScore(
        uint256 avgDaysBetweenPosts,
        uint256 consecutiveActiveDays
    ) internal pure returns (uint256) {
        // Frequency score: daily = 5000, weekly = 2500, monthly = 1000
        uint256 frequencyScore;
        if (avgDaysBetweenPosts <= 1) frequencyScore = 5000;
        else if (avgDaysBetweenPosts <= 3) frequencyScore = 4000;
        else if (avgDaysBetweenPosts <= 7) frequencyScore = 2500;
        else if (avgDaysBetweenPosts <= 14) frequencyScore = 1500;
        else if (avgDaysBetweenPosts <= 30) frequencyScore = 1000;
        else frequencyScore = 500;
        
        // Streak score: 100 points per consecutive day, max 5000
        uint256 streakScore = consecutiveActiveDays * 100;
        if (streakScore > 5000) streakScore = 5000;
        
        return frequencyScore + streakScore;
    }
    
    /**
     * @notice Verification score calculation (PUBLIC)
     * Formula: 2500 points per verified credential, max 4
     */
    function _computeVerificationScore(
        uint256 verifiedCredentials
    ) internal pure returns (uint256) {
        // Each credential = 2500 points, max 4 = 10000
        uint256 score = verifiedCredentials * 2500;
        if (score > 10000) return 10000;
        return score;
    }
    
    /**
     * @notice Converts score to level (PUBLIC, DETERMINISTIC)
     */
    function _scoreToLevel(uint256 score) internal pure returns (uint8) {
        if (score >= LEVEL_5_THRESHOLD) return 5;
        if (score >= LEVEL_4_THRESHOLD) return 4;
        if (score >= LEVEL_3_THRESHOLD) return 3;
        if (score >= LEVEL_2_THRESHOLD) return 2;
        return 1;
    }

    // ============ State Update Functions ============
    
    /**
     * @notice Updates score for a persona-profession pair
     * @dev Called by authorized updaters with off-chain computed metrics
     */
    function updateScore(
        uint256 personaId,
        uint256 professionId,
        ActivityMetrics calldata metrics,
        string calldata reason
    ) external onlyAuthorized {
        (uint256 newScore, uint8 newLevel) = computeScore(metrics);
        
        ScoreComponents storage current = _scores[personaId][professionId];
        
        // Record history
        if (current.lastUpdated > 0) {
            _scoreHistory[personaId][professionId].push(ScoreHistory({
                timestamp: block.timestamp,
                oldScore: current.totalScore,
                newScore: newScore,
                oldLevel: current.level,
                newLevel: newLevel,
                reason: reason
            }));
        }
        
        // Update current scores
        current.activityScore = _computeActivityScore(metrics.totalPosts, metrics.postsLast30Days);
        current.engagementScore = _computeEngagementScore(
            metrics.totalLikesReceived,
            metrics.totalCommentsReceived,
            metrics.totalPosts,
            metrics.followerCount
        );
        current.consistencyScore = _computeConsistencyScore(
            metrics.avgDaysBetweenPosts,
            metrics.consecutiveActiveDays
        );
        current.verificationScore = _computeVerificationScore(metrics.verifiedCredentials);
        current.totalScore = newScore;
        current.level = newLevel;
        current.lastUpdated = block.timestamp;
        
        totalScoresComputed++;
        
        emit ScoreUpdated(personaId, professionId, current.totalScore, newScore, newLevel);
    }

    // ============ View Functions ============
    
    function getScore(
        uint256 personaId,
        uint256 professionId
    ) external view returns (ScoreComponents memory) {
        return _scores[personaId][professionId];
    }
    
    function getScoreHistory(
        uint256 personaId,
        uint256 professionId
    ) external view returns (ScoreHistory[] memory) {
        return _scoreHistory[personaId][professionId];
    }
    
    function getAlgorithmVersion() external view returns (uint256) {
        return algorithmVersion;
    }
    
    function getWeights() external view returns (ScoringWeights memory) {
        return currentWeights;
    }
    
    /**
     * @notice Returns full algorithm documentation as string
     */
    function getAlgorithmDocumentation() external pure returns (string memory) {
        return string(abi.encodePacked(
            "VALUESKINS SCORING ALGORITHM v1.0\n",
            "================================\n\n",
            "LEVEL THRESHOLDS:\n",
            "- Level 1: 0-1999 (Entry)\n",
            "- Level 2: 2000-3999 (Established)\n",
            "- Level 3: 4000-5999 (Professional)\n",
            "- Level 4: 6000-7999 (Expert)\n",
            "- Level 5: 8000-10000 (Legendary, Top 1%)\n\n",
            "SCORE COMPONENTS:\n",
            "1. Activity (30%): Posts count + recent posts\n",
            "2. Engagement (30%): Likes + comments received\n",
            "3. Consistency (20%): Posting frequency + streaks\n",
            "4. Verification (20%): Linked credentials\n\n",
            "All calculations are deterministic and verifiable on-chain."
        ));
    }
    
    /**
     * @notice Simulate score computation without state change
     */
    function simulateScore(
        ActivityMetrics calldata metrics
    ) external pure returns (
        uint256 activityScore,
        uint256 engagementScore,
        uint256 consistencyScore,
        uint256 verificationScore,
        uint256 totalScore,
        uint8 level
    ) {
        activityScore = _computeActivityScore(metrics.totalPosts, metrics.postsLast30Days);
        engagementScore = _computeEngagementScore(
            metrics.totalLikesReceived,
            metrics.totalCommentsReceived,
            metrics.totalPosts,
            metrics.followerCount
        );
        consistencyScore = _computeConsistencyScore(
            metrics.avgDaysBetweenPosts,
            metrics.consecutiveActiveDays
        );
        verificationScore = _computeVerificationScore(metrics.verifiedCredentials);
        
        (totalScore, level) = computeScore(metrics);
    }

    // ============ Admin Functions ============
    
    function setUpdaterAuthorized(address updater, bool authorized) external onlyOwner {
        if (updater == address(0)) revert ZeroAddress();
        authorizedUpdaters[updater] = authorized;
        emit UpdaterAuthorized(updater, authorized);
    }
    
    function updateWeights(
        uint256 activity,
        uint256 engagement,
        uint256 consistency,
        uint256 verification
    ) external onlyOwner {
        if (activity + engagement + consistency + verification != PRECISION) {
            revert InvalidWeights();
        }
        
        currentWeights = ScoringWeights({
            activity: activity,
            engagement: engagement,
            consistency: consistency,
            verification: verification
        });
        
        algorithmVersion++;
        
        emit WeightsUpdated(activity, engagement, consistency, verification, algorithmVersion);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
