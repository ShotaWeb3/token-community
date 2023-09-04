// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TokenBank {
    /// @dev トークンの名前
    string private _name;

    /// @dev トークンのシンボル
    string private _symbol;

    /// @dev トークンの総供給量
    uint256 constant _totalSupply = 1000;

    /// @dev トークンバンクがあづかっている総額
    uint256 private _bankTotalDeposit;

    /// @dev トークンバンクのオーナー
    address public owner;

    /// @dev アカウントアドレス毎のトークン残高
    mapping(address => uint256) private _balances;

    /// @dev トークンバンクが預かっているトークン残高
    mapping(address => uint256) private _tokenBankBalances;

    /// @dev トークン移転時のイベント
    event TokenTransfer(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    /// @dev トークン預け入れ時のイベント
    event TokenDeposit(
        address indexed from,
        uint256 amount
    );

    /// @dev トークン引き出し時のイベント
    event TokenWithdraw(
        address indexed from,
        uint256 amount
    );

    constructor (string memory name_, string memory symbol_) {
        _name   = name_;
        _symbol = symbol_;
        owner   = msg.sender;
        _balances[owner] = _totalSupply;
    }
}
