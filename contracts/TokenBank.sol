// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TokenBank {
    // トークンの名前
    string private _name;

    // トークンのシンボル
    string private _symbol;

    // トークンの総供給量
    uint256 constant _totalSupply = 1000;

    // トークンバンクがあづかっている総額
    uint256 private _bankTotalDeposit;

    // トークンバンクのオーナー
    address public owner;

    // アカウントアドレス毎のトークン残高
    mapping(address => uint256) private _balances;

    // トークンバンクが預かっているトークン残高
    mapping(address => uint256) private _tokenBankBalances;

    

}
