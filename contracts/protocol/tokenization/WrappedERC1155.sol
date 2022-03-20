// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {Context} from '../../dependencies/openzeppelin/contracts/Context.sol';
import {Address} from '../../dependencies/openzeppelin/contracts/Address.sol';
import {IERC165} from '../../dependencies/openzeppelin/contracts/IERC165.sol';
import {ERC165} from '../../dependencies/openzeppelin/contracts/ERC165.sol';
import {IERC1155} from '../../dependencies/openzeppelin/contracts/IERC1155.sol';
import {IERC1155Metadata} from '../../interfaces/IERC1155Metadata.sol';
import {IERC1155Stat} from '../../interfaces/IERC1155Stat.sol';
import {IERC1155MetadataURI} from '../../dependencies/openzeppelin/contracts/IERC1155MetadataURI.sol';
import {IERC1155Receiver} from '../../dependencies/openzeppelin/contracts/IERC1155Receiver.sol';
import {SafeMath} from '../../dependencies/openzeppelin/contracts/SafeMath.sol';
import {EnumerableSet} from "../../dependencies/openzeppelin/contracts/EnumerableSet.sol";
import {EnumerableMap} from "../../dependencies/openzeppelin/contracts/EnumerableMap.sol";

abstract contract WrappedERC1155 is Context, ERC165, IERC1155, IERC1155Metadata, IERC1155MetadataURI, IERC1155Stat {
    using SafeMath for uint256;
    using Address for address;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    uint256 internal _totalSupply;
    mapping(uint256 => mapping(address => uint256)) internal _balances;

    mapping(address => uint256) internal _balanceByAccount;

    mapping(address => mapping(address => bool)) private _operatorApprovals;

    
    mapping(uint256 => uint256) internal _totalSupplyByToken;
    mapping(uint256 => EnumerableSet.AddressSet) _holdersByToken;
    mapping(address => EnumerableSet.UintSet) _tokensByHolder;

    string private _uri;

    string private _name;
    string private _symbol;

    /*constructor(
        string memory uri_,
        string memory name_,
        string memory symbol_
    ) {
        _setURI(uri_);
        _name = name_;
        _symbol = symbol_;
    }*/

    event BurnBatch(address user, address receiverOfUnderlying, uint256[] tokenIds, uint256[] amounts);

    /**
    * @return The name of the token
    **/
    function name() public view override returns (string memory) {
        return _name;
    }

    /**
    * @return The symbol of the token
    **/
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /**
    * @return The total supply of the token
    **/
    function totalSupply() external virtual view override returns (uint256) {
        return _totalSupplyImpl();
    }

    function totalSupply(uint256 tokenId) external virtual view override returns (uint256) {
        return _totalSupplyImpl(tokenId);
    }

    function totalSupplyBatch(uint256[] calldata tokenIds) external virtual view override returns (uint256[] memory) {
        return _totalSupplyBatchImpl(tokenIds);
    }

    function totalHolders(uint256 tokenId) public virtual view override returns (uint256) {
        return _holdersByToken[tokenId].length();
    }

    function holdersByToken(uint256 tokenId) external virtual view override returns (address[] memory) {
        EnumerableSet.AddressSet storage  holders = _holdersByToken[tokenId];
        address[] memory holderAddresses = new address[](holders.length());

        for(uint256 i; i < holders.length(); ++i) {
            holderAddresses[i] = holders.at(i);
        }

        return holderAddresses;

    }

    function tokensByAccount(address account) external virtual view override returns (uint256[] memory) {
         EnumerableSet.UintSet storage tokens = _tokensByHolder[account];

        uint256[] memory tokenIds = new uint256[](tokens.length());

        for (uint256 i; i < tokens.length(); ++i) {
            tokenIds[i] = tokens.at(i);
        }
        return tokenIds;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function uri(uint256) public view virtual override returns (string memory) {
        return _uri;
    }

    /**
     * @dev See {IERC1155-balanceOf}.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(address account, uint256 id) external view virtual override returns (uint256) {
        return _balanceOf(account, id);
    }

    /**
     * @dev See {IERC1155-balanceOfBatch}.
     *
     * Requirements:
     *
     * - `accounts` and `ids` must have the same length.
     */
    function balanceOfBatch(address[] memory accounts, uint256[] memory ids)
        external
        view
        virtual
        override
        returns (uint256[] memory)
    {
        return _balanceOfBatch(accounts, ids);
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

    function balanceOf(address account) external view virtual override returns (uint256) {
        return _balanceOf(account);
    }

    function getUserBalanceAndSupply(address account)
        external
        view
        override
        returns (uint256, uint256)
    {
        return (_balanceOf(account), _totalSupplyImpl());
    }
    
    /**
     * @dev See {IERC1155-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual override {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC1155-isApprovedForAll}.
     */
    function isApprovedForAll(address account, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[account][operator];
    }

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        _safeTransferFrom(from, to, id, amount, data);
        emit TransferSingle(_msgSender(), from, to, id, amount);
    }

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: transfer caller is not owner nor approved"
        );
        _safeBatchTransferFrom(from, to, ids, amounts, data);
        emit TransferBatch(_msgSender(), from, to, ids, amounts);
    }


    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, _asSingletonArray(id), _asSingletonArray(amount), data);

        

        uint256 fromBalance = _balances[id][from];
        _balances[id][from] = fromBalance.sub(amount, "ERC1155: insufficient balance for transfer");

        _balanceByAccount[to] =  _balanceByAccount[to] + amount;
        _balances[id][to] =  _balances[id][to] + amount;

        uint256 fromUserBalance = _balanceByAccount[from];
        _balanceByAccount[from] = fromUserBalance.sub(amount, "ERC1155: insufficient balance for transfer");
        

        _doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            _balances[id][from] = fromBalance.sub(amount, "ERC1155: insufficient balance for transfer");

            _balanceByAccount[to] =   _balanceByAccount[to] + amount;

            _balances[id][to] = _balances[id][to] + amount;

            uint256 fromTotalBalance = _balanceByAccount[from];
            _balanceByAccount[from] = fromTotalBalance.sub(amount, "ERC1155: insufficient balance for transfer");
            
        }

        _doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, amounts, data);
    }

    function _setURI(string memory newuri) internal virtual {
        _uri = newuri;
    }

    function _mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: mint to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, address(0), to, _asSingletonArray(id), _asSingletonArray(amount), data);

        _balanceByAccount[to] = _balanceByAccount[to] + amount;

        uint256 oldAccountBalance = _balances[id][to];
        _balances[id][to] = _balances[id][to] + amount;
        
        _doSafeTransferAcceptanceCheck(operator, address(0), to, id, amount, data);
    }

    function _mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: mint to the zero address");
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, address(0), to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            _balanceByAccount[to] = _balanceByAccount[to]+ amount;
            _balances[id][to] = _balances[id][to] + amount;
        }

        _doSafeBatchTransferAcceptanceCheck(operator, address(0), to, ids, amounts, data);
    }

    function _burn(
        address from,
        uint256 id,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC1155: burn from the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, address(0), _asSingletonArray(id), _asSingletonArray(amount), "");

        uint256 fromBalance = _balances[id][from];
        _balances[id][from] = fromBalance.sub(amount, "ERC1155: burn amount exceeds balance");

        uint256 fromTotalBalance = _balanceByAccount[from];
        _balanceByAccount[from] = fromTotalBalance.sub(amount, "ERC1155: burn amount exceeds balance");

    }

    function _burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual {
        require(from != address(0), "ERC1155: burn from the zero address");
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, address(0), ids, amounts, "");

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            _balances[id][from] = fromBalance.sub(amount, "ERC1155: burn amount exceeds balance");

            uint256 fromTotalBalance = _balanceByAccount[from];
            _balanceByAccount[from] = fromTotalBalance.sub(amount, "ERC1155: burn amount exceeds balance");
        }
    }

    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        require(owner != operator, "ERC1155: setting approval status for self");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    function _setName(string memory newName) internal {
        _name = newName;
    }

    function _setSymbol(string memory newSymbol) internal {
        _symbol = newSymbol;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        if (from != to) {
            EnumerableSet.UintSet storage fomrTokens = _tokensByHolder[from];
            EnumerableSet.UintSet storage toTokens = _tokensByHolder[to];
            for(uint256 i; i < tokenIds.length; ++i) {
                uint256 amount = amounts[i];
                if (amount > 0) {
                    uint256 id = tokenIds[i];
                    if (from == address(0)) {
                        _totalSupplyByToken[id] = _totalSupplyByToken[id] + amount;
                        _totalSupply = _totalSupply + amount;
                        
                    } else {
                        if (_balanceOf(from, id) == amount) {
                            _holdersByToken[id].remove(from);
                            _tokensByHolder[from].remove(id);
                        }
                    }
                    if (to == address(0)) {
                        _totalSupplyByToken[id] = _totalSupplyByToken[id] - amount;
                        _totalSupply = _totalSupply + amount;
                    } else {
                        if (_balanceOf(to, id) == 0) {
                            _holdersByToken[id].add(to);
                            _tokensByHolder[to].add(id);
                        }
                    }
                }
            }
        }
    }

    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        if (to.isContract()) {
            try IERC1155Receiver(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155Received.selector) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _doSafeBatchTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        if (to.isContract()) {
            try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, amounts, data) returns (
                bytes4 response
            ) {
                if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _asSingletonArray(uint256 element) private pure returns (uint256[] memory) {
        uint256[] memory array = new uint256[](1);
        array[0] = element;

        return array;
    }

    function _balanceOf(address account, uint256 id) internal view virtual returns (uint256) {
        require(account != address(0), "ERC1155: balance query for the zero address");
        return _balances[id][account];
    }

    /**
     * @dev See {IERC1155-balanceOfBatch}.
     *
     * Requirements:
     *
     * - `accounts` and `ids` must have the same length.
     */
    function _balanceOfBatch(address[] memory accounts, uint256[] memory ids)
        internal
        view
        virtual
        returns (uint256[] memory)
    {
        require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = _balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

    function _balanceOfBatch(address account, uint256[] memory ids)
        internal
        view
        virtual
        returns (uint256[] memory)
    {
        require(account != address(0), "ERC1155: balance query for the zero address");
        uint256[] memory batchBalances = new uint256[](ids.length);

        for (uint256 i = 0; i < ids.length; ++i) {
            batchBalances[i] = _balances[ids[i]][account];
        }

        return batchBalances;
    }

    function _balanceOf(address account) internal view virtual returns (uint256) {
        require(account != address(0), "ERC1155: balance query for the zero address");
        return _balanceByAccount[account];
    }

    /**
    * @return The total supply of the token
    **/
    function _totalSupplyImpl() internal virtual view returns (uint256) {
        return _totalSupply;
    }

    function _totalSupplyImpl(uint256 tokenId) internal virtual view returns (uint256) {
        return _totalSupplyByToken[tokenId];
    }

    function _totalSupplyBatchImpl(uint256[] calldata tokenIds) internal virtual view returns (uint256[] memory) {
        uint256[] memory batchTotalSupply = new uint256[](tokenIds.length);
        for(uint256 i = 0; i < tokenIds.length; ++i){
            batchTotalSupply[i] = _totalSupplyByToken[tokenIds[i]];
        }
        return batchTotalSupply;
    }

}