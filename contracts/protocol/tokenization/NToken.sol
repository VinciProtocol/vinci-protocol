// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {IERC1155} from '../../dependencies/openzeppelin/contracts/IERC1155.sol';
import {IERC721} from '../../dependencies/openzeppelin/contracts/IERC721.sol';
import {IERC165} from '../../dependencies/openzeppelin/contracts/IERC165.sol';
import {INToken} from '../../interfaces/INToken.sol';
import {ILendingPool} from '../../interfaces/ILendingPool.sol';
import {WadRayMath} from '../libraries/math/WadRayMath.sol';
import {Errors} from '../libraries/helpers/Errors.sol';
import {VersionedInitializable} from '../libraries/aave-upgradeability/VersionedInitializable.sol';
import {WrappedERC721} from './WrappedERC721.sol';
import {SafeERC721} from '../libraries/helpers/SafeERC721.sol';
import {IERC721Receiver} from '../../dependencies/openzeppelin/contracts/IERC721Receiver.sol';
import {IERC1155Receiver} from '../../dependencies/openzeppelin/contracts/IERC1155Receiver.sol';
import {IERC721Stat} from '../../interfaces/IERC721Stat.sol';

/**
 * @title Vinci ERC1155 NToken
 * @dev Implementation of the deposited NFT token for the Vinci Protocol
 * @author Vinci
 */
 contract NToken is
   VersionedInitializable,
   WrappedERC721, 
   IERC721Stat,
   IERC721Receiver,
   IERC1155Receiver,
   INToken

{
    // TODO ERC1155 or ERC1155Burnable?
    using WadRayMath for uint256;
    using SafeERC721 for IERC721;

    uint256 public constant NTOKEN_REVISION = 0x1;
    bytes public constant EIP712_REVISION = bytes('1');

    bytes32 internal constant EIP712_DOMAIN =
    keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)');
    bytes32 public constant PERMIT_TYPEHASH =
    keccak256('Permit(address owner,address spender,uint256 tokenId,uint256 amount, uint256 nonce,uint256 deadline)');

    /// @dev owner => next valid nonce to submit with permit()
    mapping(address => uint256) public _nonces;

    bytes32 public DOMAIN_SEPARATOR; // TODO

    ILendingPool internal _pool;
    address internal _underlyingNFT;

    event BurnBatch(address user, address receiverOfUnderlying, uint256[] tokenIds, uint256[] amounts);

    modifier onlyLendingPool {
        require(_msgSender() == address(_pool), Errors.CT_CALLER_MUST_BE_LENDING_POOL);
        _;
    }

    function getRevision() internal pure virtual override returns (uint256) {
        return NTOKEN_REVISION;
    }

    /** TODO check the initialize, implement _setName and _setSymbol, and use _setURI to set the _uri
     * @dev Initializes the NToken
     * @param pool The address of the lending pool where this nToken will be used
     * @param underlyingNFT The address of the underlying NFT of this nToken
     * @param nTokenName The name of the vToken
     * @param nTokenSymbol The symbol of the vToken
    */
    function initialize(
        ILendingPool pool,
        address underlyingNFT,
        string calldata nTokenName,
        string calldata nTokenSymbol,
        bytes calldata params
    ) external override initializer {
        uint256 chainId;

        //solium-disable-next-line
        assembly {
        chainId := chainid()
        }

        DOMAIN_SEPARATOR = keccak256(
        abi.encode(
            EIP712_DOMAIN,
            keccak256(bytes(nTokenName)),
            keccak256(EIP712_REVISION),
            chainId,
            address(this)
        )
        );

        _setName(nTokenName);
        _setSymbol(nTokenSymbol);

        _pool = pool;
        _underlyingNFT = underlyingNFT;

        emit Initialized(
        underlyingNFT,
        address(pool),
        nTokenName,
        nTokenSymbol,
        params
        );
    }

   function burn(
       address user,
       address receiverOfUnderlying,
       uint256 tokenId,
       uint256 amount
   ) external override onlyLendingPool {
     require(amount != 0, Errors.CT_INVALID_BURN_AMOUNT);
     _burn(tokenId);
     IERC721(_underlyingNFT).safeTransferFrom(address(this), receiverOfUnderlying, tokenId, "");

     emit Transfer(user, address(0), tokenId);
     emit Burn(user, receiverOfUnderlying, tokenId, amount);
   }

   function burnBatch(
       address user,
       address receiverOfUnderlying,
       uint256[] calldata tokenIds,
       uint256[] calldata amounts
   ) external override onlyLendingPool {
     require(tokenIds.length == amounts.length, Errors.CT_INVALID_BURN_AMOUNT);
     for(uint256 i = 0; i < tokenIds.length; ++i){
       if(amounts[i] != 0){
        _burn(tokenIds[i]);
       }
     }
     for(uint256 i = 0; i < tokenIds.length; ++i){
       uint256 id = tokenIds[i];
       IERC721(_underlyingNFT).safeTransferFrom(address(this), receiverOfUnderlying, id, "");
     }

     for(uint256 i = 0; i < tokenIds.length; ++i){
       emit Transfer(user, address(0), tokenIds[i]);
     }
     emit BurnBatch(user, receiverOfUnderlying, tokenIds, amounts);
   }

   function mint(
       address user,
       uint256 tokenId,
       uint256 amount
   ) external override onlyLendingPool returns (bool) {
     uint256 previousNFTAmount = super.balanceOf(user);
     require(amount != 0, Errors.CT_INVALID_MINT_AMOUNT);
     _safeMint(user, tokenId, "");
    emit Transfer(address(0), user, tokenId);
    emit Mint(user, tokenId, amount);

    return previousNFTAmount == 0;
   }

   function transferOnLiquidation(
    address from,
    address to,
    uint256[] calldata tokenIds,
    uint256[] calldata amounts
  ) external override onlyLendingPool {
    // Being a normal transfer, the Transfer() and BalanceTransfer() are emitted
    // so no need to emit a specific event here
    _safeBatchTransferFrom(from, to, tokenIds, amounts, '', false);

    for(uint256 i = 0; i < tokenIds.length; ++i){
      if(amounts[i] > 0) {
        emit Transfer(from, to, tokenIds[i]);
      }
    }
  }

  /**
   * @dev Returns the address of the underlying NFT of this nToken
   **/
  function UNDERLYING_ASSET_ADDRESS() public view override returns (address) {
    return _underlyingNFT;
  }

  /**
   * @dev Returns the address of the lending pool where this nToken is used
   **/
  function POOL() public view returns (ILendingPool) {
      return _pool;
  }

  function transferUnderlyingTo(address target, uint256 tokenId, uint256 amount)
    external
    override
    onlyLendingPool
    returns (uint256)
  {
    IERC721(_underlyingNFT).safeTransferFrom(_msgSender(), target, tokenId, '');
    return amount;
  }

  function getLiquidationAmounts(address user, uint256 maxTotal, uint256[] calldata tokenIds, uint256[] calldata amounts) 
    external
    view
    override 
    returns(uint256, uint256[] memory)
  {
    require(user != address(0), "ERC721: balance query for the zero address");
    require(tokenIds.length == amounts.length, "ERC721: tokenIds and amounts length mismatch");
    uint256[] memory resultAmounts = new uint256[](tokenIds.length);
    uint256 remainTotal = maxTotal;
    uint256 i = 0;
    while(remainTotal > 0 && i < tokenIds.length) {
      if(_owners[tokenIds[i]] == user) {
        resultAmounts[i] = 1;
        remainTotal = remainTotal - 1;
      }
      else{
        resultAmounts[i] = 0;
      }
      ++i;
    }
    for(; i < tokenIds.length; ++i) {
      resultAmounts[i] = 0;
    }
    return(maxTotal - remainTotal, resultAmounts);
  }

  function lock(uint256 tokenId, uint16 lockType) public virtual override onlyLendingPool
  {
    revert('LV_NFT_LOCK_NOT_IMPLEMENTED');
  }

  function getUnlockTime(address user, uint256 tokenId) public view virtual override returns(uint256 unlockTime)
  {
    return 0;
  }

  function unlockedBalanceOfBatch(address user, uint256[] calldata tokenIds) public view virtual override returns(uint256[] memory amounts)
  {
    return _balanceOfBatch(user, tokenIds);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165, WrappedERC721) returns (bool) {
    return
      interfaceId == type(IERC721Receiver).interfaceId ||
      interfaceId == type(IERC1155Receiver).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  function onERC721Received(
    address operator, 
    address from, 
    uint256 tokenId, 
    bytes calldata data
  ) external override returns (bytes4)
  {
    return this.onERC721Received.selector;
  }

  function onERC1155Received(
    address, 
    address, 
    uint256, 
    uint256, 
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC1155Received.selector;
  }

  function onERC1155BatchReceived(
    address, 
    address, 
    uint256[] memory, 
    uint256[] memory, 
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC1155BatchReceived.selector;
  }

  function _safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes memory data, bool validate) internal {
    address underlyingNFT = _underlyingNFT;
    ILendingPool pool = _pool;

    uint256 fromNFTAmountBefore = super.balanceOf(from);
    uint256 toNFTAmountBefore = super.balanceOf(to);
    super._safeTransfer(from, to, tokenId, data);
    if(validate){
      pool.finalizeNFTSingleTransfer(underlyingNFT, from, to, tokenId, amount, fromNFTAmountBefore, toNFTAmountBefore);
    }
    emit BalanceTransfer(from, to, tokenId, amount);
  }

  function _safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes memory data) internal {
    _safeTransferFrom(from, to, tokenId, amount, data, true);
  }

  function _safeBatchTransferFrom(address from, address to, uint256[] calldata tokenIds, uint256[] calldata amounts, bytes memory data, bool validate) internal {
    address underlyingNFT = _underlyingNFT;
    ILendingPool pool = _pool;

    uint256 fromNFTAmountBefore = super.balanceOf(from);
    uint256 toNFTAmountBefore = super.balanceOf(to);
    for(uint256 i = 0; i < tokenIds.length; ++i){
      if(amounts[i] != 0){
        super._safeTransfer(from, to, tokenIds[i], data);
      }
    }
    if(validate){
      pool.finalizeNFTBatchTransfer(underlyingNFT, from, to, tokenIds, amounts, fromNFTAmountBefore, toNFTAmountBefore);
    }
    emit BalanceBatchTransfer(from, to, tokenIds, amounts);

  }

  function _safeBatchTransferFrom(address from, address to, uint256[] calldata tokenIds, uint256[] calldata amounts, bytes memory data) internal {
    _safeBatchTransferFrom(from, to, tokenIds, amounts, data, true);
  }

  function balanceOfBatch(address account, uint256[] memory ids)
    external
    view
    virtual
    override
    returns (uint256[] memory)
  {
    
    return _balanceOfBatch(account, ids);
  }



  function tokensByAccount(address account) external view override returns(uint256[] memory) 
  {
    uint256 balance = balanceOf(account);
    uint256[] memory tokenIds = new uint256[](balance);
    for(uint256 i = 0; i < balance; ++i){
      tokenIds[i] = _ownedTokens[account][i];
    }
    return tokenIds;
  }

  function getUserBalanceAndSupply(address user) external view  override returns (uint256, uint256)
  {
    return (balanceOf(user), totalSupply());
  }


}
