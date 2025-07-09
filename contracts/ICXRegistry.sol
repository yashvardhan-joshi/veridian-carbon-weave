
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title ICXRegistry
 * @dev ERC1155 token contract for carbon credit registry
 * Each token ID represents a unique credit batch from a specific project
 */
contract ICXRegistry is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    
    // Struct to store credit batch information
    struct CreditBatch {
        string projectId;           // Unique project identifier
        uint256 totalVolume;        // Total credits in this batch
        address currentOwner;       // Current owner of the batch
        CreditStatus status;        // Current status of the credits
        string metadataURI;         // URI pointing to off-chain metadata
        uint256 createdAt;          // Timestamp when batch was created
        uint256 vintageYear;        // Year the credits were generated
    }
    
    // Enum for credit status
    enum CreditStatus {
        Active,     // Credits are available for trading
        Retired,    // Credits have been permanently retired
        Pending,    // Credits are pending verification
        Suspended   // Credits are temporarily suspended
    }
    
    // State variables
    mapping(uint256 => CreditBatch) public creditBatches;
    mapping(string => uint256[]) public projectToBatches;  // Map project ID to batch IDs
    uint256 private _currentBatchId;
    
    // Events
    event CreditBatchMinted(
        uint256 indexed batchId,
        string indexed projectId,
        address indexed to,
        uint256 amount,
        string metadataURI
    );
    
    event CreditBatchRetired(
        uint256 indexed batchId,
        address indexed from,
        uint256 amount
    );
    
    event CreditBatchStatusUpdated(
        uint256 indexed batchId,
        CreditStatus oldStatus,
        CreditStatus newStatus
    );
    
    constructor(address initialOwner) 
        ERC1155("https://api.icx-registry.com/metadata/{id}.json") 
        Ownable(initialOwner)
    {
        _currentBatchId = 1;
    }
    
    /**
     * @dev Mint new carbon credit tokens
     * @param to Address to mint tokens to
     * @param projectId Unique project identifier
     * @param amount Number of credits to mint
     * @param metadataURI URI pointing to off-chain metadata
     * @param vintageYear Year the credits were generated
     */
    function mint(
        address to,
        string memory projectId,
        uint256 amount,
        string memory metadataURI,
        uint256 vintageYear
    ) public onlyOwner returns (uint256) {
        require(to != address(0), "ICXRegistry: mint to zero address");
        require(amount > 0, "ICXRegistry: amount must be greater than 0");
        require(bytes(projectId).length > 0, "ICXRegistry: project ID cannot be empty");
        
        uint256 batchId = _currentBatchId;
        _currentBatchId++;
        
        // Create credit batch
        creditBatches[batchId] = CreditBatch({
            projectId: projectId,
            totalVolume: amount,
            currentOwner: to,
            status: CreditStatus.Active,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            vintageYear: vintageYear
        });
        
        // Add batch to project mapping
        projectToBatches[projectId].push(batchId);
        
        // Mint the tokens
        _mint(to, batchId, amount, "");
        
        emit CreditBatchMinted(batchId, projectId, to, amount, metadataURI);
        
        return batchId;
    }
    
    /**
     * @dev Burn carbon credits (retire them permanently)
     * @param from Address to burn tokens from
     * @param batchId Credit batch ID
     * @param amount Number of credits to burn
     */
    function burn(
        address from,
        uint256 batchId,
        uint256 amount
    ) public override {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "ICXRegistry: caller is not owner nor approved"
        );
        
        require(creditBatches[batchId].status == CreditStatus.Active, 
                "ICXRegistry: credits must be active to retire");
        
        // Update status if all credits are being retired
        if (balanceOf(from, batchId) == amount) {
            creditBatches[batchId].status = CreditStatus.Retired;
            emit CreditBatchStatusUpdated(batchId, CreditStatus.Active, CreditStatus.Retired);
        }
        
        // Burn the tokens
        _burn(from, batchId, amount);
        
        emit CreditBatchRetired(batchId, from, amount);
    }
    
    /**
     * @dev Update the status of a credit batch
     * @param batchId Credit batch ID
     * @param newStatus New status for the batch
     */
    function updateBatchStatus(uint256 batchId, CreditStatus newStatus) public onlyOwner {
        require(creditBatches[batchId].totalVolume > 0, "ICXRegistry: batch does not exist");
        
        CreditStatus oldStatus = creditBatches[batchId].status;
        creditBatches[batchId].status = newStatus;
        
        emit CreditBatchStatusUpdated(batchId, oldStatus, newStatus);
    }
    
    /**
     * @dev Get credit batch information
     * @param batchId Credit batch ID
     */
    function getCreditBatch(uint256 batchId) public view returns (CreditBatch memory) {
        require(creditBatches[batchId].totalVolume > 0, "ICXRegistry: batch does not exist");
        return creditBatches[batchId];
    }
    
    /**
     * @dev Get all batch IDs for a project
     * @param projectId Project identifier
     */
    function getProjectBatches(string memory projectId) public view returns (uint256[] memory) {
        return projectToBatches[projectId];
    }
    
    /**
     * @dev Override safeTransferFrom to update current owner
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        require(creditBatches[id].status == CreditStatus.Active, 
                "ICXRegistry: can only transfer active credits");
        
        super.safeTransferFrom(from, to, id, amount, data);
        
        // Update current owner if full balance is transferred
        if (balanceOf(from, id) == 0) {
            creditBatches[id].currentOwner = to;
        }
    }
    
    /**
     * @dev Set base URI for metadata
     * @param newURI New base URI
     */
    function setURI(string memory newURI) public onlyOwner {
        _setURI(newURI);
    }
    
    // Required overrides
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}
